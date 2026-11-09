/**
 * The voice agent: connects the Gemini Live session, the microphone and
 * speaker, and the workspace (pages of diagrams). Tool calls are executed one after another
 * (in order) and answered with the resulting diagram state.
 *
 * The page never holds the Gemini API key: each connection gets a single-use
 * token from the studio server (voice/liveToken.ts, server/liveToken.ts).
 */
import type { Workspace } from '../engine/workspace';
import { AudioIO } from '../voice/audio';
import { LiveClient, type FunctionCall } from '../voice/liveClient';
import { fetchLiveToken } from '../voice/liveToken';
import { handleToolCall, type ViewController } from './dispatcher';
import { SYSTEM_INSTRUCTION } from './prompt';
import { TOOL_DECLARATIONS } from './tools';

export interface VoiceSettings {
  model: string;
  voice: string;
  thinkingLevel: string;
  silenceDurationMs: number;
  /** Live API WebSocket endpoint; only changed for tests or a proxy. */
  endpoint?: string;
}

export const DEFAULT_SETTINGS: VoiceSettings = {
  model: 'gemini-3.8-live',
  voice: 'Zephyr',
  thinkingLevel: 'LOW',
  silenceDurationMs: 600,
};

export type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'working' | 'speaking' | 'error';

export interface VoiceSnapshot {
  status: VoiceStatus;
  /** True while the microphone streams to the model. */
  micOn: boolean;
  /** What the user said or typed in the current turn. */
  heard: string;
  /** What the model said in the current turn. */
  reply: string;
  level: number;
  error: string | null;
  /** The studio server's error code when it refused a token ('signed-out', 'daily-limit', …). */
  errorCode: string | null;
  /** Seconds from the end of the request to the change on the canvas. */
  lastLatency: number | null;
}

const IDLE: VoiceSnapshot = { status: 'idle', micOn: false, heard: '', reply: '', level: 0, error: null, errorCode: null, lastLatency: null };

export class VoiceAgent {
  snapshot: VoiceSnapshot = IDLE;
  private listeners = new Set<() => void>();
  private client: LiveClient | null = null;
  private audio: AudioIO | null = null;
  private queue: Promise<void> = Promise.resolve();
  private cancelled = new Set<string>();
  private activeCalls = 0;
  private playing = false;
  private newTurn = true;
  private lastHeardAt = 0;
  private pendingText: string[] = [];
  private source: 'voice' | 'text' = 'voice';

  /** Set by the canvas so that the agent can zoom and focus. */
  view: ViewController | undefined;

  constructor(private workspace: Workspace, private getSettings: () => VoiceSettings) {}

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private set(patch: Partial<VoiceSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    for (const l of this.listeners) l();
  }

  get active(): boolean {
    return this.client != null;
  }

  private settle() {
    if (this.client == null) return;
    this.set({ status: this.activeCalls > 0 ? 'working' : this.playing ? 'speaking' : 'listening' });
  }

  /** Starts a session; must be called from a user gesture (audio permission). */
  async start(withMic: boolean): Promise<void> {
    if (this.client != null) {
      if (withMic && this.audio != null && !this.audio.micActive) {
        await this.enableMic();
      }
      return;
    }
    const settings = this.getSettings();
    // A typed request that starts the session stays the "heard" text, so the
    // history records it as the request of the change it makes
    this.set({ ...IDLE, status: 'connecting', micOn: false, heard: this.pendingText.length > 0 ? this.snapshot.heard : '' });

    const audio = new AudioIO({
      onPcm: (pcm) => this.client?.sendAudio(pcm),
      onLevel: (level) => {
        if (Math.abs(level - this.snapshot.level) > 0.02) this.set({ level });
      },
      onPlayback: (playing) => {
        this.playing = playing;
        this.settle();
      },
    });
    this.audio = audio;

    const client = new LiveClient({
      // A new token for every connection (also when the session resumes)
      getToken: () => fetchLiveToken({
        model: settings.model,
        voice: settings.voice || undefined,
        thinkingLevel: settings.thinkingLevel || undefined,
      }),
      model: settings.model,
      endpoint: settings.endpoint || undefined,
      voice: settings.voice || undefined,
      thinkingLevel: settings.thinkingLevel || undefined,
      silenceDurationMs: settings.silenceDurationMs,
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: TOOL_DECLARATIONS,
    }, {
      onReady: () => {
        this.settle();
        for (const text of this.pendingText.splice(0)) client.sendText(text);
      },
      onInputTranscript: (text) => {
        if (this.newTurn) {
          this.newTurn = false;
          this.source = 'voice';
          this.set({ heard: '', reply: '' });
        }
        this.lastHeardAt = Date.now();
        this.set({ heard: (this.snapshot.heard + text).replace(/\s+/g, ' ') });
      },
      onOutputTranscript: (text) => {
        const base = this.newTurn ? '' : this.snapshot.reply;
        this.newTurn = false;
        this.set({ reply: (base + text).replace(/\s+/g, ' ') });
      },
      onAudio: (data, rate) => audio.play(data, rate),
      onInterrupted: () => {
        audio.stopPlayback();
        this.newTurn = true;
        this.set({ reply: '' });
      },
      onTurnComplete: () => {
        this.newTurn = true;
        this.settle();
      },
      onToolCall: (call) => this.enqueue(call),
      onToolCallCancellation: (ids) => ids.forEach((id) => this.cancelled.add(id)),
      onError: (e) => {
        this.teardown();
        this.set({ ...IDLE, status: 'error', error: friendlyError(e.message), errorCode: codeOf(e) });
      },
      onClose: () => {
        if (this.client === client) this.stop();
      },
    });
    this.client = client;

    try {
      await audio.start(false);
      client.connect();
      if (withMic) await this.enableMic();
    } catch (e) {
      this.teardown();
      this.set({ ...IDLE, status: 'error', error: friendlyError(e instanceof Error ? e.message : String(e), e), errorCode: codeOf(e) });
      throw e;
    }
  }

  private async enableMic() {
    await this.audio!.startMic();
    this.set({ micOn: true });
  }

  /** Turns the microphone off but keeps the session (typed requests still work). */
  muteMic() {
    if (this.audio?.micActive) {
      this.audio.stopMic();
      this.client?.sendAudioStreamEnd();
      this.set({ micOn: false, level: 0 });
    }
  }

  stop() {
    this.teardown();
    this.set({ ...IDLE, lastLatency: this.snapshot.lastLatency });
  }

  private teardown() {
    const client = this.client;
    this.client = null;
    client?.close();
    this.audio?.stop();
    this.audio = null;
    this.activeCalls = 0;
    this.playing = false;
    this.newTurn = true;
    this.pendingText = [];
    this.cancelled.clear();
  }

  /** Sends a typed request (starting a session without microphone if needed). */
  async sendText(text: string) {
    const t = text.trim();
    if (t === '') return;
    this.source = 'text';
    this.newTurn = false;
    this.lastHeardAt = Date.now();
    this.set({ heard: t, reply: '' });
    if (this.client == null) {
      this.pendingText.push(t);
      await this.start(false);
    } else if (!this.client.sendText(t)) {
      this.pendingText.push(t);
    }
  }

  private enqueue(call: FunctionCall) {
    this.activeCalls++;
    this.settle();
    const client = this.client;
    const request = this.snapshot.heard || undefined;
    const source = this.source;
    this.queue = this.queue.then(async () => {
      // Cancelled while it waited (the user interrupted), or its session ended: the
      // canvas must not change behind the model's back
      if (this.cancelled.delete(call.id) || client !== this.client) {
        this.activeCalls = Math.max(0, this.activeCalls - 1);
        this.settle();
        return;
      }
      let response: Record<string, unknown>;
      try {
        response = await handleToolCall(call.name, call.args, { workspace: this.workspace, source, request, view: this.view });
      } catch (e) {
        response = { ok: false, errors: [e instanceof Error ? e.message : String(e)] };
      }
      if (response.ok && this.lastHeardAt > 0 && call.name !== 'get_diagram') {
        this.set({ lastLatency: Math.round((Date.now() - this.lastHeardAt) / 100) / 10 });
      }
      if (client === this.client && !this.cancelled.delete(call.id)) {
        client!.sendToolResponse(call, response);
      }
      this.activeCalls = Math.max(0, this.activeCalls - 1);
      this.settle();
    });
  }
}

function codeOf(e: unknown): string | null {
  const code = (e as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : null;
}

function friendlyError(message: string, e?: unknown): string {
  const name = (e as { name?: string } | undefined)?.name;
  if (name === 'NotAllowedError') return 'Microphone access was denied. Allow it in the browser to talk.';
  if (name === 'NotFoundError') return 'No microphone was found.';
  if (/api key not valid|API_KEY_INVALID|permission/i.test(message)) return 'The Gemini API key was rejected. Replace it with ./studio.sh key.';
  if (/not found|not supported/i.test(message) && /model/i.test(message)) return `${message} — choose another model in Settings.`;
  return message || 'The voice session ended unexpectedly.';
}
