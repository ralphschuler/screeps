/**
 * Defense Package Export Tests
 * 
 * Validates that all defense subsystem exports are accessible
 * and have the expected types.
 */

import { expect } from 'chai';
import {
  // Threat Assessment
  assessThreat,
  calculateTowerDamage,
  calculateDangerLevel,
  estimateDefenderCost,
  logThreatAnalysis,
  
  // Structure Defense
  placeRampartsOnCriticalStructures,
  calculateWallRepairTarget,
  placePerimeterDefense,
  placeRoadAwarePerimeterDefense,
  
  // Coordination
  defenseCoordinator,
  DefenseCoordinator,
  checkAndExecuteRetreat,
  ClusterDefenseCoordinator,
  
  // Emergency
  emergencyResponseManager,
  EmergencyResponseManager,
  EmergencyLevel,
  safeModeManager,
  SafeModeManager,
  evacuationManager,
  EvacuationManager
} from '../src/index';

describe('@ralphschuler/screeps-defense', () => {
  describe('Package Exports', () => {
    
    it('should export threat assessment functions', () => {
      expect(assessThreat).to.be.a('function');
      expect(calculateTowerDamage).to.be.a('function');
      expect(calculateDangerLevel).to.be.a('function');
      expect(estimateDefenderCost).to.be.a('function');
      expect(logThreatAnalysis).to.be.a('function');
    });
    
    it('should export structure defense functions', () => {
      expect(placeRampartsOnCriticalStructures).to.be.a('function');
      expect(calculateWallRepairTarget).to.be.a('function');
      expect(placePerimeterDefense).to.be.a('function');
      expect(placeRoadAwarePerimeterDefense).to.be.a('function');
    });
    
    it('should export coordination classes and functions', () => {
      expect(DefenseCoordinator).to.be.a('function'); // Constructor
      expect(defenseCoordinator).to.be.an('object');
      expect(checkAndExecuteRetreat).to.be.a('function');
      expect(ClusterDefenseCoordinator).to.be.a('function'); // Constructor
    });
    
    it('should export emergency response components', () => {
      expect(EmergencyResponseManager).to.be.a('function'); // Constructor
      expect(emergencyResponseManager).to.be.an('object');
      expect(EmergencyLevel).to.be.an('object');
      expect(SafeModeManager).to.be.a('function'); // Constructor
      expect(safeModeManager).to.be.an('object');
      expect(EvacuationManager).to.be.a('function'); // Constructor
      expect(evacuationManager).to.be.an('object');
    });
  });
  
  describe('Threat Assessment', () => {
    
    it('should calculate tower damage correctly at various ranges', () => {
      // At close range (≤5)
      expect(calculateTowerDamage(0)).to.equal(600);
      expect(calculateTowerDamage(5)).to.equal(600);
      
      // At far range (≥20)
      expect(calculateTowerDamage(20)).to.equal(150);
      expect(calculateTowerDamage(25)).to.equal(150);
      
      // In between (linear interpolation)
      expect(calculateTowerDamage(10)).to.equal(450); // Midpoint
      expect(calculateTowerDamage(15)).to.equal(300); // Three-quarters
    });
    
    it('should calculate danger level from threat score', () => {
      expect(calculateDangerLevel(0)).to.equal(0);    // Calm
      expect(calculateDangerLevel(100)).to.equal(1);  // Hostile sighted
      expect(calculateDangerLevel(500)).to.equal(2);  // Active attack
      expect(calculateDangerLevel(1000)).to.equal(3); // Siege
    });
  });
  
  describe('Emergency Levels', () => {
    
    it('should define all emergency levels', () => {
      expect(EmergencyLevel.NONE).to.equal(0);
      expect(EmergencyLevel.LOW).to.equal(1);
      expect(EmergencyLevel.MEDIUM).to.equal(2);
      expect(EmergencyLevel.HIGH).to.equal(3);
      expect(EmergencyLevel.CRITICAL).to.equal(4);
    });
  });
});
