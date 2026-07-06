import { expect } from 'chai';
import {
  MATURE_ROOM_STORAGE_RESERVE_ENERGY,
  MATURE_ROOM_TERMINAL_RESERVE_ENERGY,
  getMatureRoomEnergyReserveState,
  hasDepletedMatureEnergyReserve
} from '../src/index';

(globalThis as unknown as { RESOURCE_ENERGY: ResourceConstant }).RESOURCE_ENERGY = 'energy' as ResourceConstant;

function makeEnergyStore(energy: number): Pick<StoreDefinition, 'getUsedCapacity'> {
  return {
    getUsedCapacity: (resource?: ResourceConstant) => resource === undefined || resource === RESOURCE_ENERGY ? energy : 0
  };
}

function makeRoom(level: number, storageEnergy?: number, terminalEnergy?: number): Room {
  return {
    name: 'W1N1',
    controller: { my: true, level },
    storage: storageEnergy === undefined ? undefined : { store: makeEnergyStore(storageEnergy) },
    terminal: terminalEnergy === undefined ? undefined : { store: makeEnergyStore(terminalEnergy) }
  } as unknown as Room;
}

describe('mature room energy reserves', () => {
  it('flags mature owned rooms below storage reserve', () => {
    const room = makeRoom(6, 0, MATURE_ROOM_TERMINAL_RESERVE_ENERGY);

    const state = getMatureRoomEnergyReserveState(room);

    expect(state.hasStorageReserveDeficit).to.equal(true);
    expect(state.hasTerminalReserveDeficit).to.equal(false);
    expect(hasDepletedMatureEnergyReserve(room)).to.equal(true);
  });

  it('flags terminal reserve deficits only for built RCL6 terminals', () => {
    const room = makeRoom(6, MATURE_ROOM_STORAGE_RESERVE_ENERGY, 0);

    const state = getMatureRoomEnergyReserveState(room);

    expect(state.hasStorageReserveDeficit).to.equal(false);
    expect(state.hasTerminalReserveDeficit).to.equal(true);
    expect(hasDepletedMatureEnergyReserve(room)).to.equal(true);
  });

  it('does not treat early rooms or recovered mature rooms as reserve depleted', () => {
    expect(hasDepletedMatureEnergyReserve(makeRoom(3, 0, 0))).to.equal(false);
    expect(hasDepletedMatureEnergyReserve(makeRoom(6, MATURE_ROOM_STORAGE_RESERVE_ENERGY, MATURE_ROOM_TERMINAL_RESERVE_ENERGY))).to.equal(false);
  });
});
