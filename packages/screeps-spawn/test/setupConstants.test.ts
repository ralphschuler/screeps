import { expect } from 'chai';

describe('spawn test Screeps constants', () => {
  it('matches canonical Screeps FIND constants from @types/screeps', () => {
    expect(FIND_EXIT_TOP).to.equal(1);
    expect(FIND_EXIT_RIGHT).to.equal(3);
    expect(FIND_EXIT_BOTTOM).to.equal(5);
    expect(FIND_EXIT_LEFT).to.equal(7);
    expect(FIND_EXIT).to.equal(10);
    expect(FIND_CREEPS).to.equal(101);
    expect(FIND_MY_CREEPS).to.equal(102);
    expect(FIND_HOSTILE_CREEPS).to.equal(103);
    expect(FIND_SOURCES_ACTIVE).to.equal(104);
    expect(FIND_SOURCES).to.equal(105);
    expect(FIND_DROPPED_RESOURCES).to.equal(106);
    expect(FIND_STRUCTURES).to.equal(107);
    expect(FIND_MY_STRUCTURES).to.equal(108);
    expect(FIND_HOSTILE_STRUCTURES).to.equal(109);
    expect(FIND_FLAGS).to.equal(110);
    expect(FIND_CONSTRUCTION_SITES).to.equal(111);
    expect(FIND_MY_SPAWNS).to.equal(112);
    expect(FIND_HOSTILE_SPAWNS).to.equal(113);
    expect(FIND_MY_CONSTRUCTION_SITES).to.equal(114);
    expect(FIND_HOSTILE_CONSTRUCTION_SITES).to.equal(115);
    expect(FIND_MINERALS).to.equal(116);
    expect(FIND_NUKES).to.equal(117);
    expect(FIND_TOMBSTONES).to.equal(118);
    expect(FIND_POWER_CREEPS).to.equal(119);
    expect(FIND_MY_POWER_CREEPS).to.equal(120);
    expect(FIND_HOSTILE_POWER_CREEPS).to.equal(121);
    expect(FIND_DEPOSITS).to.equal(122);
    expect(FIND_RUINS).to.equal(123);
  });
});
