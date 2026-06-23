export interface CompactPosition {
  x: number;
  y: number;
}

export function encodePosition(position: CompactPosition): string {
  return `${position.x},${position.y}`;
}

/** Preserve legacy portal parsing: malformed x/y fields become parseInt results. */
export function decodePortalPosition(encoded: string): CompactPosition {
  const [x, y] = encoded.split(",");
  return {
    x: parseInt(x ?? "0", 10),
    y: parseInt(y ?? "0", 10)
  };
}

export function decodeOptionalPosition(encoded: string | undefined): CompactPosition | undefined {
  const [x, y] = encoded?.split(",") ?? [];
  if (x === undefined || y === undefined) {
    return undefined;
  }
  return {
    x: parseInt(x, 10),
    y: parseInt(y, 10)
  };
}
