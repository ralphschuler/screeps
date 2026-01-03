# TooAngel Non-Aggression Policy Implementation

**Issue**: #910 - Ensure we do not attack the player TooAngel

## Overview

This implementation ensures that the Screeps bot **NEVER** attacks or targets the player "TooAngel" or their entities (creeps, structures) under any circumstances. TooAngel is a permanent ally (ROADMAP Section 25) with whom the bot has a cooperative relationship through the diplomacy and quest system.

## Changes Made

### 1. Agent Instructions Updated

All AI agent instruction documents now include explicit non-aggression policy:

#### Core Documentation
- **AGENTS.md**: Added non-aggression policy to Core Principles and Safety Guidelines
- **.github/copilot-instructions.md**: Added non-aggression policy to Core Principles and Never Autonomous section

#### Custom Agents
- **maintainer.agent.md**: Added guardrail to never approve/merge code that attacks TooAngel
- **review.agent.md**: Added constraint to never suggest code that attacks TooAngel
- **strategic-planner.agent.md**: Added prohibition against proposing military action against TooAngel
- **triage.agent.md**: Added guardrail to ensure defense/combat fixes never target TooAngel

### 2. Code-Level Safeguards

#### New Utility Module: `allyFilter.ts`

Created `/packages/screeps-bot/src/empire/tooangel/allyFilter.ts` with utilities to filter TooAngel entities:

**Functions**:
- `isTooAngelCreep(creep)` - Check if creep belongs to TooAngel
- `isTooAngelStructure(structure)` - Check if structure belongs to TooAngel
- `filterTooAngelCreeps(hostiles[])` - Filter TooAngel from creep array
- `filterTooAngelStructures(structures[])` - Filter TooAngel from structure array
- `getActualHostileCreeps(room)` - Safe wrapper for FIND_HOSTILE_CREEPS
- `getActualHostileStructures(room)` - Safe wrapper for FIND_HOSTILE_STRUCTURES
- `hasActualHostiles(room)` - Check for non-TooAngel hostiles

**Constant**:
- `TOOANGEL_PLAYER_NAME = "TooAngel"` - Primary identifier

#### Defense Systems Updated

All defense and combat systems now use ally filtering:

1. **threatAssessment.ts** (`packages/screeps-defense/src/threat/`)
   - Filters TooAngel creeps before threat analysis
   - Ensures threat scores only reflect actual hostile entities

2. **defenseCoordinator.ts** (`packages/screeps-defense/src/coordination/`)
   - Three filtering locations:
     - Helper room selection (prefer safer rooms)
     - Assignment cleanup (release defenders when no threats)
     - All hostile detection for defense coordination

3. **emergencyResponse.ts** (`packages/screeps-defense/src/emergency/`)
   - Filters TooAngel when calculating emergency levels
   - Prevents false escalation from allied presence

4. **safeModeManager.ts** (`packages/screeps-defense/src/emergency/`)
   - Filters TooAngel when checking if safe mode should trigger
   - Prevents wasting safe mode on allied entities

5. **evacuationManager.ts** (`packages/screeps-defense/src/emergency/`)
   - Two filtering locations:
     - Siege detection (only evacuate for actual threats)
     - Evacuation target selection (avoid rooms under attack)

### 3. Documentation Updates

#### TooAngel README
- Added **CRITICAL NON-AGGRESSION POLICY** section at the top
- Documented ally filter utilities with usage examples
- Added warnings about using filtered vs unfiltered hostile detection

#### Module Structure
- Updated module structure diagram to include `allyFilter.ts`
- Added import path: `@bot/empire/tooangel`

### 4. Testing

Created comprehensive unit tests in `packages/screeps-bot/test/unit/allyFilter.test.ts`:

**Test Coverage**:
- ✅ isTooAngelCreep correctly identifies TooAngel creeps
- ✅ filterTooAngelCreeps removes TooAngel from hostile lists
- ✅ getActualHostileCreeps wrapper filters correctly
- ✅ Edge cases: all TooAngel, no TooAngel, mixed scenarios

**Compilation Verification**:
- ✅ Defense package compiles successfully
- ✅ No TypeScript errors in modified files
- ✅ Module exports correctly configured

## Usage Patterns

### ✅ CORRECT: Use filtered hostile detection

```typescript
import { getActualHostileCreeps } from "@bot/empire/tooangel";

// Get hostiles excluding TooAngel
const hostiles = getActualHostileCreeps(room);

// Or manual filtering
const allHostiles = room.find(FIND_HOSTILE_CREEPS);
const actualHostiles = filterTooAngelCreeps(allHostiles);
```

### ❌ WRONG: Direct hostile detection without filtering

```typescript
// DON'T DO THIS - May include TooAngel!
const hostiles = room.find(FIND_HOSTILE_CREEPS);
const structures = room.find(FIND_HOSTILE_STRUCTURES);
```

## Impact

### Behavioral Changes
1. **Threat Assessment**: TooAngel creeps no longer contribute to threat scores
2. **Defense Coordination**: TooAngel presence doesn't trigger defense assistance
3. **Emergency Response**: TooAngel entities don't trigger emergency escalation
4. **Safe Mode**: TooAngel entities won't cause safe mode activation
5. **Evacuation**: TooAngel presence doesn't trigger room evacuation

### Safety Guarantees
- **Multi-layer protection**: Both AI instructions and code-level filters
- **Automatic filtering**: All defense systems automatically exclude TooAngel
- **Logged filtering**: Filter operations are logged for monitoring
- **Test coverage**: Comprehensive tests ensure filtering works correctly

## Maintenance

### When Adding New Defense/Combat Code

Always use the ally filter utilities:

1. Import the filter: `import { getActualHostileCreeps } from "@bot/empire/tooangel";`
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
- `packages/screeps-bot/src/empire/tooangel/allyFilter.ts` (new)
- `packages/screeps-bot/src/empire/tooangel/index.ts`
- `packages/screeps-defense/src/threat/threatAssessment.ts`
- `packages/screeps-defense/src/coordination/defenseCoordinator.ts`
- `packages/screeps-defense/src/emergency/emergencyResponse.ts`
- `packages/screeps-defense/src/emergency/safeModeManager.ts`
- `packages/screeps-defense/src/emergency/evacuationManager.ts`

### Tests
- `packages/screeps-bot/test/unit/allyFilter.test.ts` (new)

## Conclusion

The bot now has comprehensive protection against attacking TooAngel:

1. **AI agents** are instructed to never create or approve such code
2. **Code-level filters** automatically exclude TooAngel from hostile detection
3. **All defense systems** use filtered hostile detection
4. **Tests verify** the filtering works correctly
5. **Documentation** ensures future maintainers understand the policy

TooAngel is a **permanent ally** and this implementation ensures they are **never** targeted for attack under any circumstances.
