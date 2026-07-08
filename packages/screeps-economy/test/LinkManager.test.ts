/**
 * Link Manager Tests
 * Tests for automated link energy transfer operations
 */

import { expect } from 'chai';
import { clearGameObjectCache } from '@ralphschuler/screeps-cache';
import { LinkManager } from '../src/links/linkManager';

function store(used: number, capacity = 800) {
  return {
    getUsedCapacity: (resource: ResourceConstant) => resource === RESOURCE_ENERGY ? used : 0,
    getFreeCapacity: (resource: ResourceConstant) => resource === RESOURCE_ENERGY ? capacity - used : 0
  };
}

function pos(label: string, ranges: Record<string, number>) {
  return {
    label,
    getRangeTo: (target: any) => ranges[target.label] ?? 99,
    toString: () => label
  };
}

function link(id: string, used: number, ranges: Record<string, number>) {
  const calls: any[] = [];
  return {
    id,
    cooldown: 0,
    store: store(used),
    pos: pos(id, ranges),
    transferEnergy: (target: any, amount?: number) => {
      calls.push({ target: target.id, amount });
      return OK;
    },
    calls
  } as unknown as StructureLink & { calls: any[] };
}

function roomWithLinks(options: { energyAvailable?: number; energyCapacity?: number; spawnBusy?: boolean; links: StructureLink[] }) {
  const storage = { label: 'storage', store: store(50000, 100000) };
  const controller = { label: 'controller', my: true, level: 6 };
  const spawn = { label: 'spawn', spawning: options.spawnBusy ? {} : null };
  const source = { label: 'source' };
  return {
    name: 'W1N1',
    controller,
    storage,
    energyAvailable: options.energyAvailable ?? 300,
    energyCapacityAvailable: options.energyCapacity ?? 800,
    find: (constant: number) => {
      if (constant === FIND_MY_STRUCTURES) return options.links;
      if (constant === FIND_SOURCES) return [source];
      if (constant === FIND_MY_SPAWNS) return [spawn];
      return [];
    }
  } as unknown as Room;
}

describe('LinkManager', () => {
  let linkManager: LinkManager;

  beforeEach(() => {
    clearGameObjectCache();
    linkManager = new LinkManager();
    (global as any).Game.cpu.bucket = 10000;
    (global as any).Game.rooms = {};
  });

  describe('construction', () => {
    it('should create with default config', () => {
      const manager = new LinkManager();
      expect(manager).to.exist;
    });

    it('should create with custom config', () => {
      const manager = new LinkManager({
        minBucket: 5000,
        minSourceLinkEnergy: 500,
        controllerLinkMaxEnergy: 600
      });
      expect(manager).to.exist;
    });
  });

  describe('link role identification', () => {
    it('should identify source links near energy sources', () => {
      const sourceLink = link('sourceLink', 500, { source: 1 });
      const room = roomWithLinks({ links: [sourceLink] });
      (sourceLink as any).room = room;
      expect(linkManager.getLinkRole(sourceLink)).to.equal('source');
    });

    it('should identify controller links near controller', () => {
      const controllerLink = link('controllerLink', 0, { controller: 1 });
      const room = roomWithLinks({ links: [controllerLink] });
      (controllerLink as any).room = room;
      expect(linkManager.getLinkRole(controllerLink)).to.equal('controller');
    });

    it('should identify storage links near storage', () => {
      const storageLink = link('storageLink', 500, { storage: 1 });
      const room = roomWithLinks({ links: [storageLink] });
      (storageLink as any).room = room;
      expect(linkManager.getLinkRole(storageLink)).to.equal('storage');
    });

    it('should identify spawn links near spawns', () => {
      const spawnLink = link('spawnLink', 0, { spawn: 1 });
      const room = roomWithLinks({ links: [spawnLink] });
      (spawnLink as any).room = room;
      expect(linkManager.getLinkRole(spawnLink)).to.equal('spawn');
    });

    it('should prefer adjacent source classification over nearby storage classification', () => {
      const sourceLink = link('sourceLink', 500, { source: 1, storage: 2 });
      const room = roomWithLinks({ links: [sourceLink] });
      (sourceLink as any).room = room;
      expect(linkManager.getLinkRole(sourceLink)).to.equal('source');
    });
  });

  describe('energy transfer logic', () => {
    it('should process owned RCL5 rooms from the framework room cache', () => {
      const sourceLink = link('sourceLink', 500, { source: 1 });
      const controllerLink = link('controllerLink', 0, { controller: 1 });
      const storageLink = link('storageLink', 500, { storage: 1 });
      const room = roomWithLinks({ energyAvailable: 800, links: [sourceLink, controllerLink, storageLink] });
      (Game.rooms as Record<string, Room>).W1N1 = room;

      linkManager.run();

      expect(sourceLink.calls).to.deep.equal([{ target: 'controllerLink', amount: 500 }]);
    });

    it('should transfer from source link to controller link by default', () => {
      const sourceLink = link('sourceLink', 500, { source: 1 });
      const controllerLink = link('controllerLink', 0, { controller: 1 });
      const storageLink = link('storageLink', 500, { storage: 1 });
      const room = roomWithLinks({ energyAvailable: 800, links: [sourceLink, controllerLink, storageLink] });

      linkManager.processRoomLinks(room);

      expect(sourceLink.calls).to.deep.equal([{ target: 'controllerLink', amount: 500 }]);
    });

    it('should route adjacent source links even when they are also near storage', () => {
      const sourceLink = link('sourceLink', 500, { source: 1, storage: 2 });
      const controllerLink = link('controllerLink', 0, { controller: 1 });
      const storageLink = link('storageLink', 500, { storage: 1 });
      const room = roomWithLinks({ energyAvailable: 800, links: [sourceLink, controllerLink, storageLink] });

      linkManager.processRoomLinks(room);

      expect(sourceLink.calls).to.deep.equal([{ target: 'controllerLink', amount: 500 }]);
    });

    it('should cap source link transfers to receiver free capacity', () => {
      const sourceLink = link('sourceLink', 700, { source: 1 });
      const controllerLink = link('controllerLink', 650, { controller: 1 });
      const storageLink = link('storageLink', 500, { storage: 1 });
      const room = roomWithLinks({ energyAvailable: 800, links: [sourceLink, controllerLink, storageLink] });

      linkManager.processRoomLinks(room);

      expect(sourceLink.calls).to.deep.equal([{ target: 'controllerLink', amount: 150 }]);
    });

    it('should send storage link energy to spawn link during spawn energy deficit', () => {
      const storageLink = link('storageLink', 700, { storage: 1 });
      const spawnLink = link('spawnLink', 0, { spawn: 1 });
      const controllerLink = link('controllerLink', 0, { controller: 1 });
      const room = roomWithLinks({ energyAvailable: 300, energyCapacity: 800, links: [storageLink, spawnLink, controllerLink] });

      linkManager.processRoomLinks(room);

      expect(storageLink.calls).to.deep.equal([{ target: 'spawnLink', amount: 700 }]);
    });

    it('should send storage link energy to controller link when spawn is full', () => {
      const storageLink = link('storageLink', 700, { storage: 1 });
      const spawnLink = link('spawnLink', 0, { spawn: 1 });
      const controllerLink = link('controllerLink', 0, { controller: 1 });
      const room = roomWithLinks({ energyAvailable: 800, energyCapacity: 800, links: [storageLink, spawnLink, controllerLink] });

      linkManager.processRoomLinks(room);

      expect(storageLink.calls).to.deep.equal([{ target: 'controllerLink', amount: 700 }]);
    });

    it('should not report source plus spawn-only links as a functional source receiver network', () => {
      const sourceLink = link('sourceLink', 700, { source: 1 });
      const spawnLink = link('spawnLink', 0, { spawn: 1 });
      const room = roomWithLinks({ links: [sourceLink, spawnLink] });

      expect(linkManager.hasLinkNetwork(room)).to.equal(false);
    });
  });

  describe('config validation', () => {
    it('should accept valid minBucket', () => {
      const manager = new LinkManager({ minBucket: 1000 });
      expect(manager).to.exist;
    });

    it('should accept valid energy thresholds', () => {
      const manager = new LinkManager({
        minSourceLinkEnergy: 400,
        controllerLinkMaxEnergy: 700,
        transferThreshold: 100,
        storageLinkReserve: 100
      });
      expect(manager).to.exist;
    });
  });
});
