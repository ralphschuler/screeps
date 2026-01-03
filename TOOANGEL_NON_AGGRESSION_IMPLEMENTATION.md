# Allied Players Non-Aggression Policy Implementation

**Issue**: #910 - Ensure we do not attack allied players (TooAngel, TedRoastBeef)

## Overview

This implementation ensures that the Screeps bot **NEVER** attacks or targets allied players or their entities (creeps, structures) under any circumstances. The following players are permanent allies (ROADMAP Section 25):
- **TooAngel** - Cooperative relationship through diplomacy and quest system
- **TedRoastBeef** - Permanent ally

## Changes Made

### 1. Agent Instructions Updated

All AI agent instruction documents now include explicit non-aggression policy for all allied players:

#### Core Documentation
- **AGENTS.md**: Added non-aggression policy to Core Principles and Safety Guidelines
- **.github/copilot-instructions.md**: Added non-aggression policy to Core Principles and Never Autonomous section

#### Custom Agents
- **maintainer.agent.md**: Added guardrail to never approve/merge code that attacks allied players
- **review.agent.md**: Added constraint to never suggest code that attacks allied players
- **strategic-planner.agent.md**: Added prohibition against proposing military action against allied players
- **triage.agent.md**: Added guardrail to ensure defense/combat fixes never target allied players

### 2. Code-Level Safeguards

#### New Utility Module: `allyFilter.ts`

Created `/packages/screeps-defense/src/tooangel/allyFilter.ts` with utilities to filter allied entities:

**Note**: Originally created in `screeps-bot` package but moved to `screeps-defense` to fix cross-package dependency. The bot package re-exports from defense for convenience.

**Functions**:
- `isAllyCreep(creep)` - Check if creep belongs to an allied player
- `isAllyStructure(structure)` - Check if structure belongs to an allied player
- `filterAllyCreeps(hostiles[])` - Filter allied players from creep array
- `filterAllyStructures(structures[])` - Filter allied players from structure array
- `getActualHostileCreeps(room)` - Safe wrapper for FIND_HOSTILE_CREEPS
- `getActualHostileStructures(room)` - Safe wrapper for FIND_HOSTILE_STRUCTURES
- `hasActualHostiles(room)` - Check for non-allied hostiles

**Legacy Functions** (deprecated, kept for backward compatibility):
- `isTooAngelCreep(creep)` - Use `isAllyCreep` instead
- `isTooAngelStructure(structure)` - Use `isAllyStructure` instead
- `filterTooAngelCreeps(hostiles[])` - Use `filterAllyCreeps` instead
- `filterTooAngelStructures(structures[])` - Use `filterAllyStructures` instead

**Constants**:
- `ALLIED_PLAYERS = ["TooAngel", "TedRoastBeef"]` - List of all allied players
- `TOOANGEL_PLAYER_NAME = "TooAngel"` - TooAngel identifier
- `TEDROASTBEEF_PLAYER_NAME = "TedRoastBeef"` - TedRoastBeef identifier

#### Defense Systems Updated

All defense and combat systems now use ally filtering:

1. **threatAssessment.ts** (`packages/screeps-defense/src/threat/`)
   - Filters allied creeps before threat analysis
   - Ensures threat scores only reflect actual hostile entities

2. **defenseCoordinator.ts** (`packages/screeps-defense/src/coordination/`)
   - Three filtering locations:
     - Helper room selection (prefer safer rooms)
     - Assignment cleanup (release defenders when no threats)
     - All hostile detection for defense coordination

3. **emergencyResponse.ts** (`packages/screeps-defense/src/emergency/`)
   - Filters allied players when calculating emergency levels
   - Prevents false escalation from allied presence

4. **safeModeManager.ts** (`packages/screeps-defense/src/emergency/`)
   - Filters allied players when checking if safe mode should trigger
   - Prevents wasting safe mode on allied entities

5. **evacuationManager.ts** (`packages/screeps-defense/src/emergency/`)
   - Two filtering locations:
     - Siege detection (only evacuate for actual threats)
     - Evacuation target selection (avoid rooms under attack)

### 3. Documentation Updates

#### TooAngel README
- Added **CRITICAL NON-AGGRESSION POLICY** section mentioning all allied players
- Documented ally filter utilities with usage examples
- Added warnings about using filtered vs unfiltered hostile detection

#### Module Structure
- Updated module structure diagram to include `allyFilter.ts`
- Added import path: `@ralphschuler/screeps-defense`

### 4. Testing

Created comprehensive unit tests in `packages/screeps-bot/test/unit/allyFilter.test.ts`:

**Test Coverage**:
- ✅ isAllyCreep correctly identifies allied creeps (backward compatible with isTooAngelCreep)
- ✅ filterAllyCreeps removes all allied players from hostile lists
- ✅ getActualHostileCreeps wrapper filters correctly
- ✅ Edge cases: all TooAngel, no TooAngel, mixed scenarios

**Compilation Verification**:
- ✅ Defense package compiles successfully
- ✅ No TypeScript errors in modified files
- ✅ Module exports correctly configured

## Usage Patterns

### ✅ CORRECT: Use filtered hostile detection

```typescript
import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";
// Or from bot package (re-exports from defense):
// import { getActualHostileCreeps } from "@bot/empire/tooangel";

// Get hostiles excluding all allied players
const hostiles = getActualHostileCreeps(room);

// Or manual filtering (new preferred method)
const allHostiles = room.find(FIND_HOSTILE_CREEPS);
const actualHostiles = filterAllyCreeps(allHostiles);

// Legacy (still works, deprecated)
const actualHostiles2 = filterTooAngelCreeps(allHostiles);
```

### ❌ WRONG: Direct hostile detection without filtering

```typescript
// DON'T DO THIS - May include allied players!
const hostiles = room.find(FIND_HOSTILE_CREEPS);
const structures = room.find(FIND_HOSTILE_STRUCTURES);
```

## Impact

### Behavioral Changes
1. **Threat Assessment**: Allied creeps no longer contribute to threat scores
2. **Defense Coordination**: Allied presence doesn't trigger defense assistance
3. **Emergency Response**: Allied entities don't trigger emergency escalation
4. **Safe Mode**: Allied entities won't cause safe mode activation
5. **Evacuation**: Allied presence doesn't trigger room evacuation

### Safety Guarantees
- **Multi-layer protection**: Both AI instructions and code-level filters
- **Automatic filtering**: All defense systems automatically exclude all allied players
- **Logged filtering**: Filter operations are logged for monitoring
- **Test coverage**: Comprehensive tests ensure filtering works correctly
- **Backward compatibility**: Legacy TooAngel-specific functions still work

## Maintenance

### When Adding New Defense/Combat Code

Always use the ally filter utilities:

1. Import the filter: `import { getActualHostileCreeps } from "@ralphschuler/screeps-defense";`
2. Use filtered detection: `const hostiles = getActualHostileCreeps(room);`
3. Add comment: `// Filter TooAngel entities - they are permanent allies (ROADMAP Section 25)`
4. Test with TooAngel present

### When Reviewing PRs

Check for:
- ❌ Direct use of `FIND_HOSTILE_CREEPS` without filtering
- ❌ Direct use of `FIND_HOSTILE_STRUCTURES` without filtering
- ❌ Attack/target logic that doesn't check player ownership
- ✅ Use of `getActualHostileCreeps()` or `filterTooAngelCreeps()`
- ✅ Appropriate comments about TooAngel filtering

## References

- **ROADMAP.md Section 25**: TooAngel Diplomacy & Quest System
- **TooAngel API**: https://github.com/TooAngel/screeps/blob/master/doc/API.md
- **Module**: `/packages/screeps-bot/src/empire/tooangel/`
- **Tests**: `/packages/screeps-bot/test/unit/allyFilter.test.ts`

## Files Modified

### Documentation
- `AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/agents/maintainer.agent.md`
- `.github/agents/review.agent.md`
- `.github/agents/strategic-planner.agent.md`
- `.github/agents/triage.agent.md`
- `packages/screeps-bot/src/empire/tooangel/README.md`

### Code
- `packages/screeps-defense/src/tooangel/allyFilter.ts` (new - moved from bot package)
- `packages/screeps-bot/src/empire/tooangel/index.ts` (updated to re-export from defense)
- `packages/screeps-defense/src/index.ts` (updated to export ally filter)
- `packages/screeps-defense/src/threat/threatAssessment.ts`
- `packages/screeps-defense/src/coordination/defenseCoordinator.ts`
- `packages/screeps-defense/src/emergency/emergencyResponse.ts`
- `packages/screeps-defense/src/emergency/safeModeManager.ts`
- `packages/screeps-defense/src/emergency/evacuationManager.ts`

### Tests
- `packages/screeps-bot/test/unit/allyFilter.test.ts` (new)

## Conclusion

The bot now has comprehensive protection against attacking any allied players:

1. **AI agents** are instructed to never create or approve code that attacks allied players
2. **Code-level filters** automatically exclude all allied players (TooAngel, TedRoastBeef) from hostile detection
3. **All defense systems** use filtered hostile detection
4. **Tests verify** the filtering works correctly
5. **Documentation** ensures future maintainers understand the policy
6. **Proper architecture** - ally filter lives in defense package with no cross-package dependencies
7. **Backward compatibility** - legacy TooAngel-specific functions still work

Allied players are **permanent allies** and this implementation ensures they are **never** targeted for attack under any circumstances.

## Architectural Notes

The ally filter was initially created in the `screeps-bot` package but was moved to `screeps-defense` to avoid cross-package dependencies (defense package importing from bot package). The bot package now re-exports the utilities from the defense package for convenience, maintaining backward compatibility while following proper package architecture.

The filter now supports multiple allied players through the `ALLIED_PLAYERS` constant, making it easy to add more allies in the future without changing the filtering logic.
