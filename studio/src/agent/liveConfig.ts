/**
 * The Live API setup of the voice agent. The browser sends it when a session
 * starts, and the token server (server/liveToken.ts) locks every token it
 * issues to the same model, voice, system instruction and tools, so a token
 * read from the page cannot be used for anything else.
 */
import { LIVE_MODELS, THINKING_LEVELS, VOICES, liveSetup } from '../voice/liveSetup';
import { SYSTEM_INSTRUCTION } from './prompt';
import { TOOL_DECLARATIONS } from './tools';

export { LIVE_MODELS, THINKING_LEVELS, VOICES };

/** What the browser chooses (Settings); the rest of the setup is fixed. */
export interface AgentSessionRequest {
  model: string;
  voice?: string;
  thinkingLevel?: string;
}

export function agentSetup(request: AgentSessionRequest): Record<string, unknown> {
  return liveSetup({ ...request, systemInstruction: SYSTEM_INSTRUCTION, tools: TOOL_DECLARATIONS }, null);
}
