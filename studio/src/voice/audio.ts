/**
 * Browser audio for the voice session: microphone capture as 16 kHz PCM (via
 * an AudioWorklet), an input level for the UI, and gapless playback of the
 * model's 24 kHz PCM replies that stops at once when the user interrupts.
 */

const WORKLET = `
class Capture extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor('capture', Capture);
`;

export const INPUT_RATE = 16000;

export interface AudioCallbacks {
  onPcm: (pcm: Uint8Array) => void;
  /** Input level 0..1, about 30 times per second. */
  onLevel?: (level: number) => void;
  /** True while the model's reply is playing. */
  onPlayback?: (playing: boolean) => void;
}

export class AudioIO {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private carry: Float32Array | null = null;
  private playing: AudioBufferSourceNode[] = [];
  private playTime = 0;
  private lastLevel = 0;
  private workletLoaded = false;
  private startingMic = false;
  muted = false;

  constructor(private cb: AudioCallbacks) {}

  static isSupported(): boolean {
    return typeof window !== 'undefined' && window.isSecureContext !== false && typeof AudioContext !== 'undefined' &&
      navigator.mediaDevices != null && typeof navigator.mediaDevices.getUserMedia === 'function';
  }

  /** Must run in a user gesture so the audio context may start. */
  async start(withMic: boolean) {
    this.ctx = new AudioContext();
    this.workletLoaded = false;
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    if (withMic) await this.startMic();
  }

  get micActive(): boolean {
    return this.stream != null;
  }

  async startMic() {
    if (this.ctx == null || this.stream != null || this.startingMic) return;
    this.startingMic = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (this.ctx == null) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this.stream = stream;
      if (!this.workletLoaded) {
        const url = URL.createObjectURL(new Blob([WORKLET], { type: 'text/javascript' }));
        try {
          await this.ctx.audioWorklet.addModule(url);
          this.workletLoaded = true;
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      this.source = this.ctx.createMediaStreamSource(stream);
      this.node = new AudioWorkletNode(this.ctx, 'capture');
      const rate = this.ctx.sampleRate;
      this.node.port.onmessage = (e: MessageEvent<Float32Array>) => {
        if (this.muted) return;
        this.level(e.data);
        this.cb.onPcm(this.resample(e.data, rate));
      };
      this.source.connect(this.node);
    } finally {
      this.startingMic = false;
    }
  }

  stopMic() {
    this.node?.port.close();
    try {
      this.source?.disconnect();
      this.node?.disconnect();
    } catch {
      // ignore
    }
    this.node = null;
    this.source = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.carry = null;
    this.cb.onLevel?.(0);
  }

  stop() {
    this.stopMic();
    this.stopPlayback();
    this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }

  private level(data: Float32Array) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
    const rms = Math.sqrt(sum / data.length);
    // Smoothed, scaled so that normal speech reaches about 0.6
    this.lastLevel = Math.max(rms * 6, this.lastLevel * 0.85);
    this.cb.onLevel?.(Math.min(1, this.lastLevel));
  }

  /**
   * Downsamples to 16 kHz by averaging (a simple low-pass filter) and returns
   * little-endian 16-bit PCM; leftover samples are kept for the next frame.
   */
  private resample(data: Float32Array, rate: number): Uint8Array {
    let input = data;
    if (this.carry != null && this.carry.length > 0) {
      input = new Float32Array(this.carry.length + data.length);
      input.set(this.carry, 0);
      input.set(data, this.carry.length);
    }
    const ratio = rate / INPUT_RATE;
    const outLen = Math.floor(input.length / ratio);
    const view = new DataView(new ArrayBuffer(outLen * 2));
    for (let i = 0; i < outLen; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.max(start + 1, Math.min(input.length, Math.floor((i + 1) * ratio)));
      let sum = 0;
      for (let j = start; j < end; j++) sum += input[j];
      const s = Math.max(-1, Math.min(1, sum / (end - start)));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const consumed = Math.min(input.length, Math.floor(outLen * ratio));
    this.carry = input.slice(consumed);
    return new Uint8Array(view.buffer);
  }

  play(base64: string, rate: number) {
    const ctx = this.ctx;
    if (ctx == null) return;
    const bin = atob(base64);
    const len = bin.length >> 1;
    if (len === 0) return;
    const buffer = ctx.createBuffer(1, len, rate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8);
      samples[i] = (v >= 0x8000 ? v - 0x10000 : v) / 0x8000;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    // Small lead time so that chunks arriving late do not click
    this.playTime = Math.max(this.playTime, ctx.currentTime + 0.05);
    src.start(this.playTime);
    this.playTime += buffer.duration;
    this.playing.push(src);
    if (this.playing.length === 1) this.cb.onPlayback?.(true);
    src.onended = () => {
      this.playing = this.playing.filter((p) => p !== src);
      if (this.playing.length === 0) this.cb.onPlayback?.(false);
    };
  }

  stopPlayback() {
    const playing = this.playing;
    this.playing = [];
    this.playTime = 0;
    for (const p of playing) {
      p.onended = null;
      try {
        p.stop();
      } catch {
        // ignore
      }
    }
    if (playing.length > 0) this.cb.onPlayback?.(false);
  }
}
