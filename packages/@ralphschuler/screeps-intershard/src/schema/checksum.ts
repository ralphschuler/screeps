/** Calculate a stable 32-bit checksum for compact InterShardMemory payloads. */
export function calculateChecksum(data: string): number {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
