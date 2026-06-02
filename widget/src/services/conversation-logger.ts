/**
 * Conversation Logger
 *
 * Fire-and-forget logging of completed question/answer pairs to an external
 * endpoint (e.g. a Google Apps Script web app backed by a Sheet), used during
 * the test phase to record conversations.
 *
 * Design constraints:
 * - Opt-in only: if no log URL is configured, logging is a no-op.
 * - Must never break the chat: all errors are swallowed.
 * - Must survive tab close: uses `keepalive` so an in-flight request still
 *   completes when the page unloads.
 *
 * NOTE: This runs in the user's browser, so the configured URL is publicly
 * visible. Only use endpoints where that is acceptable (an Apps Script web app
 * exposes a write-only doPost — no secret is leaked).
 */

export interface ConversationLogEntry {
  chatSessionId: string;
  timestamp: string; // ISO 8601
  agentName: string;
  question: string;
  answer: string;
}

/**
 * Read the configured log endpoint. Returns undefined when logging is disabled.
 */
export function getConversationLogUrl(): string | undefined {
  const url = import.meta.env.VITE_CONVO_LOG_URL;
  return url && url.length > 0 ? url : undefined;
}

/**
 * Send a single completed Q&A pair to the log endpoint. Never throws.
 */
export function logConversation(entry: ConversationLogEntry): void {
  const url = getConversationLogUrl();
  if (!url) {
    return; // Logging disabled — no endpoint configured.
  }

  try {
    void fetch(url, {
      method: "POST",
      // text/plain avoids a CORS preflight, which Apps Script web apps don't
      // handle. The body is still JSON; the receiver parses it.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(entry),
      keepalive: true,
      mode: "no-cors",
    }).catch(() => {
      // Swallow — logging must never surface to the user.
    });
  } catch {
    // Swallow synchronous failures too.
  }
}
