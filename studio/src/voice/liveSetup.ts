/**
 * The Live API session setup (BidiGenerateContentSetup). Pure, so that the
 * browser, the eval in Node and the token server build exactly the same
 * setup: the server locks the tokens it issues to it.
 */

export const LIVE_MODELS = [
  'gemini-3.8-live',
  'gemini-3.8-live-extended-thinking',
  'gemini-3.1-flash-live-preview',
  'gemini-2.5-flash-native-audio-preview-12-2025',
];

export const VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede', 'Leda', 'Orus'];

export const THINKING_LEVELS = ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH'];

export interface LiveSessionOptions {
  model: string;
  voice?: string;
  /** Only sent to models whose name contains "thinking". */
  thinkingLevel?: string;
  silenceDurationMs?: number;
  systemInstruction?: string;
  tools?: unknown[];
}

/** The setup of a new session, or of a resumed one when `handle` is given. */
export function liveSetup(o: LiveSessionOptions, handle: string | null): Record<string, unknown> {
  const generationConfig: Record<string, unknown> = {
    responseModalities: ['AUDIO'],
    speechConfig: {
      languageCode: 'en-US',
      ...(o.voice ? { voiceConfig: { prebuiltVoiceConfig: { voiceName: o.voice } } } : {}),
    },
  };
  // Only the extended thinking models accept a thinking level
  if (o.thinkingLevel && /thinking/i.test(o.model)) {
    generationConfig.thinkingConfig = { thinkingLevel: o.thinkingLevel };
  }
  const setup: Record<string, unknown> = {
    model: o.model.startsWith('models/') ? o.model : `models/${o.model}`,
    generationConfig,
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    contextWindowCompression: { triggerTokens: 104857, slidingWindow: { targetTokens: 52428 } },
    sessionResumption: handle != null ? { handle } : {},
  };
  if (o.silenceDurationMs != null) {
    setup.realtimeInputConfig = { automaticActivityDetection: { silenceDurationMs: o.silenceDurationMs } };
  }
  if (o.systemInstruction) {
    setup.systemInstruction = { parts: [{ text: o.systemInstruction }] };
  }
  if (o.tools) {
    setup.tools = [{ functionDeclarations: o.tools }];
  }
  return setup;
}
