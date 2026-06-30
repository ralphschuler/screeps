export function roundTo(value: number, digits: number): number {
  const scale = Math.pow(10, digits);
  return Math.round(value * scale) / scale;
}
