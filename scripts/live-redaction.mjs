export function redactScreepsApiMessage(message) {
  return String(message)
    .replace(/([?&](?:token|access_token|auth)=)[^&#\s)]+/gi, "$1<redacted>")
    .replace(/(\bX-Token:\s*)[^\s)]+/gi, "$1<redacted>")
    .replace(/(\bSCREEPS_TOKEN=)[^\s)]+/g, "$1<redacted>");
}

export function formatScreepsApiError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return redactScreepsApiMessage(message);
}
