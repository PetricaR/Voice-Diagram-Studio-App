/**
 * Minimal Gemini Live API client over a raw WebSocket (BidiGenerateContent),
 * ported from the draw.io fork's GeminiLive.js. It has no audio code, so it
 * runs in the browser and in Node (the eval harness); see audio.ts for the
 * microphone and playback. https://ai.google.dev/gemini-api/docs/live-api
 *
 * The browser authenticates with ephemeral tokens from the studio server
 * (`getToken`, a new one for every connection), never with the API key:
 * https://ai.google.dev/gemini-api/docs/ephemeral-tokens
 */
import { liveSetup, type LiveSessionOptions } from './liveSetup';

/** API key authentication; only used by Node (the eval). */
export const DEFAULT_ENDPOINT = 'wss://generativelanguage.googleapis.com/ws/' +
  'google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

/** Ephemeral token authentication (v1alpha only). */
export const TOKEN_ENDPOINT = 'wss://generativelanguage.googleapis.com/ws/' +
  'google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained';

export interface FunctionCall {
  id: string;
  name: string;
  args?: Record<string, unknown>;
}

export interface LiveOptions extends LiveSessionOptions {
  /** Returns a fresh single-use ephemeral token; called for every connection, also when a session resumes. */
  getToken?: () => Promise<string>;
  /** The API key itself: only for server-side use (Node), never in a browser. */
  apiKey?: string;
  /** Overrides the WebSocket endpoint (tests, a proxy). */
  endpoint?: string;
}

export interface LiveCallbacks {
  onReady?: () => void;
  onInputTranscript?: (text: string) => void;
  onOutputTranscript?: (text: string) => void;
  onAudio?: (base64: string, sampleRate: number) => void;
  onText?: (text: string) => void;
  onInterrupted?: () => void;
  onTurnComplete?: () => void;
  onToolCall?: (call: FunctionCall) => void;
  onToolCallCancellation?: (ids: string[]) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export class LiveClient {
  private ws: WebSocket | null = null;
  private resumeHandle: string | null = null;
  private goAway = false;
  private closed = false;
  private everReady = false;
  ready = false;

  constructor(private options: LiveOptions, private callbacks: LiveCallbacks) {}

  connect(handle: string | null = null) {
    void this.open(handle);
  }

  private async url(): Promise<string> {
    const o = this.options;
    if (o.getToken) {
      const token = await o.getToken();
      return `${o.endpoint ?? TOKEN_ENDPOINT}?access_token=${encodeURIComponent(token)}`;
    }
    if (o.apiKey) {
      return `${o.endpoint ?? DEFAULT_ENDPOINT}?key=${encodeURIComponent(o.apiKey)}`;
    }
    throw new Error('No Live API credentials: getToken or apiKey is required.');
  }

  private async open(handle: string | null) {
    let url: string;
    try {
      url = await this.url();
    } catch (e) {
      this.fail(e instanceof Error ? e : new Error(String(e)));
      return;
    }
    // Closed while the token was being fetched
    if (this.closed) return;
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    this.ready = false;
    this.goAway = false;

    ws.onopen = () => {
      if (ws === this.ws) this.send(this.setupMessage(handle));
    };
    ws.onmessage = (evt: MessageEvent) => {
      if (ws !== this.ws) return;
      let msg: Record<string, any>;
      try {
        msg = JSON.parse(typeof evt.data === 'string' ? evt.data : new TextDecoder('utf-8').decode(evt.data as ArrayBuffer));
      } catch {
        return;
      }
      try {
        this.handleMessage(msg);
      } catch (e) {
        this.fail(e instanceof Error ? e : new Error(String(e)));
      }
    };
    ws.onclose = (evt: CloseEvent) => {
      if (ws !== this.ws) return;
      this.ws = null;
      this.ready = false;
      // The connection lifetime is limited: after goAway the session
      // continues on a new connection with the resumption handle
      if (!this.closed && this.goAway && this.resumeHandle != null) {
        this.connect(this.resumeHandle);
      } else if (!this.closed && this.everReady && evt.code === 1000 && !evt.reason) {
        this.close();
      } else if (!this.closed) {
        // Setup errors (unknown model, invalid key) only arrive as the close reason
        this.fail(new Error(evt.reason || `Connection closed (${evt.code})`));
      }
    };
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.ready = false;
    const ws = this.ws;
    this.ws = null;
    try {
      ws?.close(1000);
    } catch {
      // ignore
    }
    this.callbacks.onClose?.();
  }

  private fail(error: Error) {
    if (this.closed) return;
    const onError = this.callbacks.onError;
    this.close();
    onError?.(error);
  }

  private send(msg: unknown): boolean {
    if (this.ws != null && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(msg));
      return true;
    }
    return false;
  }

  private setupMessage(handle: string | null) {
    return { setup: liveSetup(this.options, handle) };
  }

  private handleMessage(msg: Record<string, any>) {
    const cb = this.callbacks;
    if (msg.setupComplete != null) {
      this.ready = true;
      this.everReady = true;
      cb.onReady?.();
    }
    const sc = msg.serverContent;
    if (sc != null) {
      if (sc.interrupted) cb.onInterrupted?.();
      if (sc.inputTranscription?.text) cb.onInputTranscript?.(sc.inputTranscription.text);
      if (sc.outputTranscription?.text) cb.onOutputTranscript?.(sc.outputTranscription.text);
      for (const part of sc.modelTurn?.parts ?? []) {
        const data = part.inlineData;
        if (data?.data && typeof data.mimeType === 'string' && data.mimeType.startsWith('audio/pcm')) {
          const rate = /rate=(\d+)/.exec(data.mimeType);
          cb.onAudio?.(data.data, rate ? parseInt(rate[1], 10) : 24000);
        } else if (typeof part.text === 'string' && !part.thought) {
          cb.onText?.(part.text);
        }
      }
      if (sc.turnComplete) cb.onTurnComplete?.();
    }
    for (const call of msg.toolCall?.functionCalls ?? []) {
      cb.onToolCall?.(call as FunctionCall);
    }
    if (msg.toolCallCancellation?.ids) {
      cb.onToolCallCancellation?.(msg.toolCallCancellation.ids);
    }
    const update = msg.sessionResumptionUpdate;
    if (update?.resumable && update.newHandle) {
      this.resumeHandle = update.newHandle;
    }
    if (msg.goAway != null) {
      this.goAway = true;
    }
  }

  /** 16 kHz little-endian 16-bit mono PCM. */
  sendAudio(pcm: Uint8Array) {
    if (this.ready && pcm.length > 0) {
      this.send({ realtimeInput: { audio: { data: encodeBase64(pcm), mimeType: 'audio/pcm;rate=16000' } } });
    }
  }

  /** Tells the server the microphone paused (flushes the voice activity detection). */
  sendAudioStreamEnd() {
    if (this.ready) this.send({ realtimeInput: { audioStreamEnd: true } });
  }

  /** A typed message, handled like speech. */
  sendText(text: string): boolean {
    return this.ready && this.send({ realtimeInput: { text } });
  }

  sendToolResponse(call: FunctionCall, response: Record<string, unknown>) {
    this.send({ toolResponse: { functionResponses: [{ id: call.id, name: call.name, response }] } });
  }
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(bytes.length, i + 0x8000)));
  }
  return btoa(binary);
}
