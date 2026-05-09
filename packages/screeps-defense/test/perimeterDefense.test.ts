import { expect } from 'chai';
import { calculatePerimeterPositions } from '../src/structures/perimeterDefense';

declare const global: { Game: typeof Game; TERRAIN_MASK_WALL: number };

describe('perimeter defense sealing', () => {
  beforeEach(() => {
    global.TERRAIN_MASK_WALL = 1;
    global.Game = {
      rooms: {},
      map: {
        getRoomTerrain: () => ({
          get: (x: number, y: number) => {
            if (y === 0) return x >= 10 && x <= 15 ? 0 : 1;
            if (x === 0 || x === 49 || y === 49) return 1;
            return 0;
          }
        })
      }
    } as unknown as typeof Game;
  });

  it('seals both shoulders beside a room entrance with a U shape and only one rampart passage', () => {
    const plan = calculatePerimeterPositions('W1N1');
    const walls = new Set(plan.walls.map(p => `${p.x},${p.y}`));
    const ramparts = new Set(plan.ramparts.map(p => `${p.x},${p.y}`));
    const blocked = new Set([...walls, ...ramparts]);

    expect(blocked.has('9,2'), 'left shoulder on inner line').to.equal(true);
    expect(blocked.has('16,2'), 'right shoulder on inner line').to.equal(true);
    expect(walls.has('9,1'), 'left shoulder returns toward the room edge').to.equal(true);
    expect(walls.has('16,1'), 'right shoulder returns toward the room edge').to.equal(true);
    expect(ramparts.size, 'one controlled exit passage per entrance group').to.equal(1);
  });
});
