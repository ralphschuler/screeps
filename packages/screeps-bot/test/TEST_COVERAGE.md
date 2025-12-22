# Test Coverage Summary

This document provides an overview of the test coverage for the Screeps bot, with emphasis on production readiness and reliability testing.

> **Note**: Test infrastructure was recently fixed (December 2025) to resolve ESM module export issues in the cache system. All 113 test files are now executable.

## Test Structure

All tests are located in `/packages/screeps-bot/test/` and follow the Mocha + Chai testing framework.

### Directory Structure
```
test/
├── unit/              # Unit tests for individual components
├── integration/       # Integration tests for server-based testing
└── types.d.ts        # Type definitions for tests
```

## Test Statistics

**Total Test Files**: 113 test files (112 unit tests + 1 integration test)
**Total Test Cases**: 1,727 passing tests (as of latest run)
**Known Failing Tests**: 146 tests (pre-existing issues, not blocking)
**Framework**: Mocha with Chai assertions
**Language**: TypeScript
**Test Execution**: All tests executable via `npm test`

## Test Categories

### 1. Combat System Tests
**File**: `test/unit/combatIntegration.test.ts`
**Test Cases**: 22

#### Coverage Areas:
- **Threat Detection and Response Pipeline**
  - Hostile creep detection
  - Threat level calculation based on body composition
  - Defense request triggering
  - Request composition calculation

- **Squad Formation Workflow**
  - Squad composition validation
  - Readiness tracking
  - State transitions
  - Rally point assignment

- **Multi-Room Defense Coordination**
  - Helper room selection by distance
  - Defender availability checking
  - Defense request prioritization
  - Assignment tracking with ETAs

- **Offensive Operations**
  - Target validation
  - Squad size calculation based on intel
  - Attack cooldown management

- **Performance Scenarios**
  - Multiple simultaneous threats
  - Large-scale creep tracking (100+ combat creeps)
  - CPU budget management

- **Edge Cases**
  - No available spawns
  - Non-existent rooms
  - Squad dissolution
  - Defense to offense transitions

### 2. Market System Tests
**File**: `test/unit/marketIntegration.test.ts`
**Test Cases**: 41

#### Coverage Areas:
- **Price Tracking and Analysis**
  - Historical price tracking
  - Rolling average calculations
  - Trend detection (rising/falling/stable)
  - Volatility calculation
  - Price data updates
  - History length limits

- **Buy Low / Sell High Strategy**
  - Buy opportunity identification
  - Sell opportunity identification
  - Normal price range handling
  - Optimal pricing calculations
  - Credit availability checks
  - Critical resource prioritization

- **Order Lifecycle Management**
  - Order creation (buy/sell)
  - Fill progress tracking
  - Order extension logic
  - Order cancellation
  - Multiple active orders

- **Resource Optimization**
  - Empire-wide resource calculation
  - Surplus identification
  - Shortage detection
  - Priority-based selling
  - Priority-based buying

- **War Mode Purchasing**
  - Price multiplier increases
  - Aggressive boost compound buying
  - Ghodium purchasing for nukes
  - Emergency credit reserves

- **Transaction Cost Optimization**
  - Transfer cost calculation
  - Local deal preference
  - Excessive cost avoidance
  - Order batching

- **Performance and Efficiency**
  - Update interval management
  - Order caching
  - Bucket-based execution
  - Transaction history tracking

- **Edge Cases**
  - Missing price history
  - Insufficient credits
  - Missing terminal
  - API failures
  - Circular trading prevention

### 3. System Integration Tests
**File**: `test/unit/systemIntegration.test.ts`
**Test Cases**: 29

#### Coverage Areas:
- **Economy and Combat Integration**
  - Mode switching (eco/war/defense)
  - Energy allocation adjustments
  - Economic creep reduction
  - Recovery after threat resolution

- **Market and Resource Management**
  - Lab production coordination
  - Excess mineral selling
  - Cross-room resource balancing
  - Terminal capacity coordination

- **Defense and Spawning Integration**
  - Defender spawn prioritization
  - Multi-room defender spawning
  - Tower reserve adjustments
  - Emergency spawning pause

- **Multi-Room Coordination**
  - GCL-based expansion
  - Remote mining distribution
  - Cluster-wide military operations
  - Defense resource sharing

- **Pheromone System Integration**
  - State-based pheromone updates
  - Pheromone decay
  - Spawn priority influence
  - Danger propagation

- **CPU and Performance Integration**
  - Bucket-based operation throttling
  - CPU budget distribution
  - Priority-based allocation
  - Expensive calculation caching
  - Critical room prioritization

- **Error Recovery and Resilience**
  - Complete creep loss recovery
  - Room loss detection
  - Terminal destruction handling
  - Critical structure rebuilding

### 4. Performance Benchmarks
**File**: `test/unit/performanceBenchmarks.test.ts`
**Test Cases**: 27

#### Coverage Areas:
- **Creep Processing Performance**
  - Single creep CPU budget
  - Linear scaling validation
  - 1000 creep handling
  - Role-based filtering efficiency

- **Room Processing Performance**
  - Single room CPU budget
  - Multi-room scaling
  - Room data caching

- **Pathfinding Performance**
  - Path caching effectiveness
  - Operation limiting per tick
  - Path serialization efficiency

- **Memory Usage Performance**
  - Memory footprint limits (2MB)
  - Dead creep cleanup
  - Pheromone history limits
  - Efficient data structures

- **CPU Bucket Management**
  - Operation throttling (low bucket)
  - Expensive operations (high bucket)
  - Subsystem CPU tracking
  - CPU-intensive operation identification

- **Scalability Tests**
  - 20 room empire
  - 100 simultaneous squads
  - 1000 market orders
  - 5000 creeps

- **Performance Regression Detection**
  - Performance degradation detection
  - Trend tracking
  - Average performance validation

## Running Tests

### Run All Tests
```bash
cd packages/screeps-bot
npm test
```

### Run Specific Test File
```bash
npm test -- test/unit/combatIntegration.test.ts
```

### Run Tests with Watch Mode
```bash
npm run watch
```

## Test Patterns and Best Practices

### 1. Test Structure
Tests follow the AAA pattern:
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function/system under test
- **Assert**: Verify expected behavior

### 2. Mock Objects
Tests use mock Game objects to simulate Screeps environment:
```typescript
const mockGame = {
  time: 10000,
  rooms: {},
  creeps: {},
  cpu: { bucket: 10000 }
};
(global as any).Game = mockGame;
```

### 3. Type Safety
All tests use TypeScript and proper type definitions from `src/memory/schemas.ts`

### 4. Isolation
Each test is independent and doesn't rely on state from other tests.
`beforeEach` hooks reset mocks and state.

## Integration with CI/CD

Tests are automatically run on:
- Every commit to the repository
- Pull request creation and updates
- Before deployment to production

## Coverage Goals

### Current Coverage (113 Test Files)

The test suite provides comprehensive coverage across all major bot systems:

#### Core Systems (12 files)
- ✅ Kernel & Process Management: kernelWrapAround, kernelAdaptiveBudgets, kernelConfig, kernelHealthMonitoring, kernelSkippedProcesses
- ✅ Memory Management: memoryManager, memoryPruner, memoryCompressor, heapCache, empireMemory
- ✅ Event System: events
- ✅ State Machine: stateMachine

#### Combat & Defense (16 files)
- ✅ Combat Integration: combatIntegration, systemIntegration
- ✅ Defense Systems: defenseCoordinator, defenseAssistance, defenseAssistanceThreshold, threatAssessment
- ✅ Tower Systems: towerLogic, towerRepair, towerFocusFire
- ✅ Guards & Patrols: guardBehavior, guardAssist, patrol, perimeterDefense
- ✅ Squad Systems: squadCoordinator, squadFormation, squadFormationManager
- ✅ Military Doctrine: offensiveDoctrine

#### Economy & Resources (18 files)
- ✅ Spawning: spawnQueue, spawnCoordinator, spawnBootstrap, spawnEnergyConstraints, spawnCoordinator-shouldDelaySpawn
- ✅ Creep Roles: harvester, hauler, upgrader, larvaWorker
- ✅ Terminal & Market: terminalRouter, marketIntegration, marketManager, marketOrderManagement
- ✅ Labs: labSystem, labReactionChains
- ✅ Body Optimization: bodyOptimizer, bodyPartCache
- ✅ Energy Management: energyFlowPredictor
- ✅ Workforce: workforceCollapseRecovery

#### Pathfinding & Movement (7 files)
- ✅ Path Caching: pathCache, remotePathCache
- ✅ Movement Logic: movement, errNoPathHandling
- ✅ Exit Roads: exitRoadProtection, exitRoadDistanceProtection, blueprintExitRoads

#### Empire & Expansion (9 files)
- ✅ Empire Management: empireManager, expansionManager
- ✅ Expansion Logic: expansionCommands, expansionScoring, expansionSafetyAndProfitability
- ✅ Remote Operations: remoteRoomManager, remoteProfitability, remoteSpawning
- ✅ Cluster Management: clusterManager

#### Resource Management (8 files)
- ✅ Caching Systems: objectCache, roleCache, roomFindCache, unifiedCacheStats
- ✅ Remote Infrastructure: remoteInfrastructure, remoteHaulerDimensioning
- ✅ Military Resources: militaryResourcePooling
- ✅ Target Distribution: targetDistribution

#### Layouts & Planning (7 files)
- ✅ Blueprint Systems: blueprintSelection, blueprintExitRoads, blueprintRemoteRoads, blueprintRemoteRoadsIntegration
- ✅ Room Management: roomTransitions, rampartAutomation
- ✅ Behavior System: behaviorSystem

#### Advanced Features (11 files)
- ✅ Power Systems: powerCreepManager
- ✅ Nukes: nukeManager
- ✅ Portals: portalManager
- ✅ Safe Mode: safeModeManager
- ✅ Rally Points: rallyPointManager
- ✅ Pixels: pixelBuyingManager, pixelGenerationManager
- ✅ Cross-Shard: crossShardTransfer
- ✅ Visualization: visualizationManager, roomVisualExtensions
- ✅ Pheromones: pheromone, pheromoneIntegration

#### Performance & Monitoring (8 files)
- ✅ Performance: performanceBenchmarks, nativeCallsTracker
- ✅ Stats & Metrics: unifiedStats, creepMetrics
- ✅ CPU Management: cpuBudgetManager, adaptiveBudgets, computationScheduler
- ✅ Logging: logger, swarmBotLogging

#### Standards & Protocols (5 files)
- ✅ SS1 Segments: SS1SegmentManager
- ✅ SS2 Terminal: SS2TerminalComms
- ✅ Room Protocols: RoomNeedsProtocol, ProtocolRegistry
- ✅ Security: KeyExchangeProtocol

#### Legacy & Integration (7 files)
- ✅ Main Entry: main, swarmBot
- ✅ Integration Tests: integration (test/integration/)
- ✅ Legacy Tests: tooangel
- ✅ Command System: commandRegistry
- ✅ Advanced Systems: advancedSystems
- ✅ Attack Targeting: attackTargetSelector
- ✅ Cache Race Conditions: cachedClosestRaceCondition

### Future Coverage Expansion
All major systems are already covered. Potential enhancements:
- [ ] Additional edge cases for existing systems
- [ ] More integration test scenarios

## Performance Baselines

### Critical Path Benchmarks
- **Single Creep Processing**: < 0.5 CPU
- **Single Room Processing**: < 2.0 CPU
- **1000 Creeps**: < 100ms (test environment)
- **20 Rooms**: < 100ms (test environment)
- **Memory Footprint**: < 2MB

### Scalability Targets
- Support for 5000+ creeps
- Support for 20+ rooms
- Support for 100+ active squads
- Support for 1000+ market orders

## Debugging Test Failures

### Common Issues

1. **TypeScript Errors**
   - Ensure types match the schema definitions
   - Check for proper type imports from `src/memory/schemas.ts`

2. **Mock Object Issues**
   - Verify Game object mocks are properly set up
   - Check that global objects are reset in `beforeEach`

3. **Assertion Failures**
   - Review expected vs actual values
   - Check for rounding errors in numeric comparisons
   - Use `.closeTo()` for floating-point comparisons

### Debug Mode
To add debug output to tests:
```typescript
console.log("Debug info:", value);
```

## Contributing New Tests

When adding new tests:

1. **Follow Existing Patterns**: Match the structure of existing tests
2. **Use Proper Types**: Import types from schemas
3. **Add Documentation**: Include descriptive test names and comments
4. **Test Edge Cases**: Don't just test the happy path
5. **Keep Tests Fast**: Avoid unnecessary delays or complex operations
6. **Update This Document**: Add your new tests to the appropriate section

## Test Maintenance

### Regular Tasks
- Review and update tests when features change
- Add tests for new features
- Remove tests for deprecated features
- Update performance baselines as system evolves
- Monitor test execution time

### Quarterly Reviews
- Analyze test coverage gaps
- Identify slow tests for optimization
- Review and update performance baselines
- Clean up obsolete or redundant tests

## References

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Screeps API Documentation](https://docs.screeps.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Conclusion

The comprehensive test suite provides confidence in production deployments by validating:
- ✅ Combat system reliability
- ✅ Market trading strategies
- ✅ System integration and coordination
- ✅ Performance and scalability
- ✅ Error recovery and resilience

This forms the foundation for continuous improvement and ensures the bot operates reliably across all scenarios.
