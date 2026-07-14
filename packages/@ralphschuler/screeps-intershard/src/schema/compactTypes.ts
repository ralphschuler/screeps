import type { InterShardFootprintStatus } from "../schema";

/** Wire payload stored in InterShardMemory after checksum wrapping. */
export interface SerializedInterShardPayload {
  d: CompactInterShardMemory;
  c: number;
}

/** Compact InterShardMemory shape optimized for the Screeps 100KB limit. */
export interface CompactInterShardMemory {
  v: number;
  s: CompactShardState[];
  g: CompactGlobalTargets;
  o?: CompactFootprintOperation;
  k: CompactTask[];
  ls: number;
}

export interface CompactShardState {
  n: string;
  r: string;
  h: CompactShardHealth;
  t: string[];
  p: CompactPortal[];
  cl?: number;
  ch?: CompactCpuHistory[];
}

export interface CompactShardHealth {
  c: string;
  cu: number;
  b: number;
  e: number;
  w: number;
  m: number;
  rc: number;
  rl: number;
  cc: number;
  u: number;
}

export interface CompactPortal {
  sr: string;
  sp: string;
  ts: string;
  tr: string;
  th: number;
  s: number;
  tc: number;
  ls?: number;
  dt?: number;
}

export interface CompactCpuHistory {
  t: number;
  l: number;
  u: number;
  b: number;
}

export interface CompactGlobalTargets {
  pl: number;
  ws?: string;
  es?: string;
  ct?: string;
  al?: string[];
  en?: CompactEnemyIntel[];
}

export interface CompactEnemyIntel {
  u: string;
  r: string[];
  t: 0 | 1 | 2 | 3;
  s: number;
  a: number;
}

export interface CompactFootprintOperation {
  i: string;
  e: number;
  s: string[];
  a: number;
  u: number;
  t: CompactFootprintTarget[];
}

export interface CompactFootprintTarget {
  n: string;
  st: InterShardFootprintStatus;
  pr?: string;
  pp?: string;
  dr?: string;
  cr?: string;
  ar?: number;
  ca?: number;
  at?: number;
  b?: string;
  u: number;
}

export interface CompactTask {
  i: string;
  y: string;
  ss: string;
  ts: string;
  tr?: string;
  rt?: ResourceConstant;
  ra?: number;
  p: number;
  st: string;
  pr?: number;
}
