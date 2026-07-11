import { expect } from 'chai';
import {
  DEFENSE_REFUEL_TERMINAL_FLOOR_ENERGY,
  hasEmergencyDefenseRefuelEnergy,
} from '../src/coordination/defenseRefuelPolicy';

describe('defense refuel terminal policy', () => {
  const terminalWithEnergy = (energy: number): StructureTerminal => ({
    store: {
      getUsedCapacity: () => energy,
    },
  } as unknown as StructureTerminal);

  it('requires enough energy for the bounded refill while preserving the floor', () => {
    expect(DEFENSE_REFUEL_TERMINAL_FLOOR_ENERGY).to.equal(5_000);
    expect(hasEmergencyDefenseRefuelEnergy(terminalWithEnergy(5_099))).to.equal(false);
    expect(hasEmergencyDefenseRefuelEnergy(terminalWithEnergy(5_100))).to.equal(true);
  });

  it('rejects missing terminals and stores with no energy', () => {
    expect(hasEmergencyDefenseRefuelEnergy(undefined)).to.equal(false);
    expect(hasEmergencyDefenseRefuelEnergy(terminalWithEnergy(0))).to.equal(false);
  });
});
