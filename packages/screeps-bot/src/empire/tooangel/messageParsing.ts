/** Lightweight guards for TooAngel terminal/controller JSON messages. */
export function isJsonObjectMessage(message: unknown): message is string {
  if (typeof message !== "string") return false;
  return message.trimStart().startsWith("{");
}

export function normalizeJsonObjectMessage(message: unknown): string | null {
  if (!isJsonObjectMessage(message)) return null;
  return message.trim();
}
