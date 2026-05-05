import { describe, it } from '../index';
import { expect } from '../assertions';
import type { TestContext } from '../types';

function game(ctx?: TestContext): any {
  if (!ctx?.Game) throw new Error('Game context missing');
  return ctx.Game;
}

function memory(ctx?: TestContext): any {
  return ctx?.Memory ?? {};
}

function ownedRooms(ctx?: TestContext): any[] {
  return Object.values(game(ctx).rooms ?? {}).filter((room: any) => room.controller?.my);
}

describe('CI private-server state', () => {
  it('server exposes Game and advances ticks', ctx => {
    expect(game(ctx).time).toBeGreaterThan(0);
  }, ['smoke', 'server']);

  it('our bot has at least one owned visible room', ctx => {
    expect(ownedRooms(ctx).length).toBeGreaterThan(0);
  }, ['smoke', 'bot']);

  it('owned room has a spawn after initialization', ctx => {
    const spawns = Object.values(game(ctx).spawns ?? {});
    expect(spawns.length).toBeGreaterThan(0);
  }, ['smoke', 'spawn']);

  it('global reset loop is not detected', ctx => {
    const mem = memory(ctx) as { __lastObservedGlobalResetTick?: number; __globalResetCount?: number };
    const resetCount = mem.__globalResetCount ?? 0;
    expect(resetCount).toBeLessThan(5);
  }, ['runtime', 'stability']);

  it('creep population exists after warmup', ctx => {
    if ((ctx?.tick ?? 0) < 100) return;
    expect(Object.keys(game(ctx).creeps ?? {}).length).toBeGreaterThan(0);
  }, ['runtime', 'population']);

  it('CPU bucket is not chronically empty', ctx => {
    const bucket = game(ctx).cpu?.bucket ?? 10000;
    expect(bucket).toBeGreaterThan(1000);
  }, ['runtime', 'cpu']);

  it('task board memory exists and can track room tasks', ctx => {
    const mem = memory(ctx) as { creepTaskBoard?: { rooms?: Record<string, unknown> } };
    if ((ctx?.tick ?? 0) < 100) return;
    expect(Boolean(mem.creepTaskBoard)).toBe(true);
    expect(Object.keys(mem.creepTaskBoard?.rooms ?? {}).length).toBeGreaterThan(0);
  }, ['runtime', 'task-board']);

  it('critical console error counter stays below threshold', ctx => {
    const mem = memory(ctx) as { ciCriticalConsoleErrors?: number };
    expect(mem.ciCriticalConsoleErrors ?? 0).toBeLessThan(10);
  }, ['runtime', 'errors']);
});
