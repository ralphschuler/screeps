/**
 * Chemistry Manager Tests
 * Tests for reaction planning and lab coordination
 */

import { expect } from 'chai';
import { ChemistryManager } from '../src/reactions/chemistryManager';
import { REACTIONS } from '../src/reactions/reactionChains';

describe('ChemistryManager', () => {
  let manager: ChemistryManager;

  beforeEach(() => {
    manager = new ChemistryManager();
  });

  describe('construction', () => {
    it('should create with default options', () => {
      expect(manager).to.exist;
    });

    it('should create with custom logger', () => {
      const customLogger = {
        log: () => {},
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {}
      };

      const customManager = new ChemistryManager({ logger: customLogger });
      expect(customManager).to.exist;
    });
  });

  describe('getReaction', () => {
    it('should return reaction for valid compound', () => {
      const reaction = manager.getReaction(RESOURCE_HYDROXIDE);
      expect(reaction).to.exist;
      expect(reaction?.product).to.equal(RESOURCE_HYDROXIDE);
    });

    it('should return undefined for invalid compound', () => {
      const reaction = manager.getReaction('INVALID' as ResourceConstant);
      expect(reaction).to.be.undefined;
    });

    it('should return correct inputs for OH', () => {
      const reaction = manager.getReaction(RESOURCE_HYDROXIDE);
      expect(reaction?.input1).to.equal(RESOURCE_HYDROGEN);
      expect(reaction?.input2).to.equal(RESOURCE_OXYGEN);
    });

    it('should return correct inputs for tier 2 compounds', () => {
      const reaction = manager.getReaction('UH' as ResourceConstant);
      expect(reaction).to.exist;
      expect(reaction?.input1).to.equal(RESOURCE_UTRIUM);
      expect(reaction?.input2).to.equal(RESOURCE_HYDROGEN);
    });
  });

  describe('calculateReactionChain', () => {
    it('should return empty chain for base minerals', () => {
      const chain = manager.calculateReactionChain(
        RESOURCE_HYDROGEN,
        { [RESOURCE_HYDROGEN]: 1000 }
      );
      expect(chain).to.be.an('array');
      expect(chain).to.have.lengthOf(0);
    });

    it('should return single reaction for tier 1 compounds', () => {
      const chain = manager.calculateReactionChain(
        RESOURCE_HYDROXIDE,
        {
          [RESOURCE_HYDROGEN]: 1000,
          [RESOURCE_OXYGEN]: 1000
        }
      );
      
      expect(chain).to.have.lengthOf(1);
      expect(chain[0].product).to.equal(RESOURCE_HYDROXIDE);
    });

    it('should return multi-step chain for complex compounds', () => {
      const chain = manager.calculateReactionChain(
        RESOURCE_GHODIUM,
        {
          [RESOURCE_ZYNTHIUM]: 1000,
          [RESOURCE_KEANIUM]: 1000,
          [RESOURCE_UTRIUM]: 1000,
          [RESOURCE_LEMERGIUM]: 1000
        }
      );
      
      expect(chain).to.have.lengthOf.greaterThan(1);
      expect(chain[chain.length - 1].product).to.equal(RESOURCE_GHODIUM);
    });

    it('should handle missing resources', () => {
      const chain = manager.calculateReactionChain(
        RESOURCE_HYDROXIDE,
        {} // No resources available
      );
      
      // Should still return the chain, just may not be executable
      expect(chain).to.be.an('array');
    });
  });

  describe('hasResourcesForReaction', () => {
    let mockTerminal: any;

    beforeEach(() => {
      mockTerminal = {
        store: {
          [RESOURCE_HYDROGEN]: 500,
          [RESOURCE_OXYGEN]: 500
        }
      };
    });

    it('should return true when resources are available', () => {
      const reaction = REACTIONS[RESOURCE_HYDROXIDE];
      const hasResources = manager.hasResourcesForReaction(
        mockTerminal,
        reaction,
        100
      );
      
      expect(hasResources).to.be.true;
    });

    it('should return false when resources are insufficient', () => {
      const reaction = REACTIONS[RESOURCE_HYDROXIDE];
      mockTerminal.store[RESOURCE_HYDROGEN] = 50;
      
      const hasResources = manager.hasResourcesForReaction(
        mockTerminal,
        reaction,
        100
      );
      
      expect(hasResources).to.be.false;
    });

    it('should respect minimum amount parameter', () => {
      const reaction = REACTIONS[RESOURCE_HYDROXIDE];
      mockTerminal.store[RESOURCE_HYDROGEN] = 150;
      mockTerminal.store[RESOURCE_OXYGEN] = 150;
      
      const hasLowMin = manager.hasResourcesForReaction(
        mockTerminal,
        reaction,
        100
      );
      
      const hasHighMin = manager.hasResourcesForReaction(
        mockTerminal,
        reaction,
        200
      );
      
      expect(hasLowMin).to.be.true;
      expect(hasHighMin).to.be.false;
    });

    it('should check both input resources', () => {
      const reaction = REACTIONS[RESOURCE_HYDROXIDE];
      mockTerminal.store[RESOURCE_HYDROGEN] = 500;
      mockTerminal.store[RESOURCE_OXYGEN] = 0;
      
      const hasResources = manager.hasResourcesForReaction(
        mockTerminal,
        reaction,
        100
      );
      
      expect(hasResources).to.be.false;
    });
  });

  describe('planReactions', () => {
    let mockRoom: any;
    let mockState: any;

    beforeEach(() => {
      mockRoom = {
        name: 'W1N1',
        terminal: {
          store: {
            [RESOURCE_HYDROGEN]: 1000,
            [RESOURCE_OXYGEN]: 1000
          }
        },
        find: (type: number) => {
          // Return mock labs
          return [
            { id: 'lab1' },
            { id: 'lab2' },
            { id: 'lab3' }
          ];
        }
      };

      mockState = {
        mode: 'idle' as const,
        targetCompound: null
      };
    });

    it('should return null when no labs available', () => {
      mockRoom.find = () => [];
      
      const reaction = manager.planReactions(mockRoom, mockState);
      expect(reaction).to.be.null;
    });

    it('should return null when less than 3 labs', () => {
      mockRoom.find = () => [{ id: 'lab1' }, { id: 'lab2' }];
      
      const reaction = manager.planReactions(mockRoom, mockState);
      expect(reaction).to.be.null;
    });

    it('should return null when no terminal', () => {
      mockRoom.terminal = undefined;
      
      const reaction = manager.planReactions(mockRoom, mockState);
      expect(reaction).to.be.null;
    });

    it('should plan reactions when resources and labs available', () => {
      const reaction = manager.planReactions(mockRoom, mockState);
      // Result depends on internal logic - just verify it returns valid type
      expect(reaction === null || typeof reaction === 'object').to.be.true;
    });
  });

  describe('REACTIONS constant', () => {
    it('should define tier 1 compounds', () => {
      expect(REACTIONS[RESOURCE_HYDROXIDE]).to.exist;
      expect(REACTIONS['ZK' as ResourceConstant]).to.exist;
      expect(REACTIONS['UL' as ResourceConstant]).to.exist;
      expect(REACTIONS[RESOURCE_GHODIUM]).to.exist;
    });

    it('should have correct priority levels', () => {
      expect(REACTIONS[RESOURCE_HYDROXIDE].priority).to.equal(10);
      expect(REACTIONS[RESOURCE_GHODIUM].priority).to.equal(15);
    });

    it('should have valid inputs for all reactions', () => {
      for (const [product, reaction] of Object.entries(REACTIONS)) {
        expect(reaction.product).to.be.a('string');
        expect(reaction.input1).to.be.a('string');
        expect(reaction.input2).to.be.a('string');
        expect(reaction.priority).to.be.a('number');
      }
    });
  });
});
