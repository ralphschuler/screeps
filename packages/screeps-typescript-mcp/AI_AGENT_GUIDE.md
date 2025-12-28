# AI Agent Guide for Screeps TypeScript MCP Server

## Overview

The Screeps TypeScript MCP Server provides AI agents with access to TypeScript type definitions from the [typed-screeps](https://github.com/screepers/typed-screeps) project. This server is essential for understanding exact type structures, interfaces, and type relationships when writing or analyzing TypeScript Screeps bots.

## Purpose

This MCP server enables AI agents to:

- **Verify TypeScript types** before writing code
- **Understand type structures** for game objects
- **Discover type relationships** (extends, implements)
- **Check interface definitions** for proper implementation
- **Ensure type safety** in bot code

## Available Tools

### 1. `screeps_types_search`

Search for TypeScript type definitions by name or keyword.

**Parameters:**
- `query` (string, required): Search term (type name or keyword)

**Use Cases:**
- Find type definitions by name
- Search for related types
- Discover available types
- Locate specific interfaces

**Example:**
```json
{
  "query": "Creep"
}
```

**Response Format:**
```json
{
  "results": [
    {
      "name": "Creep",
      "kind": "interface",
      "category": "Game Objects",
      "file": "src/creep.d.ts",
      "description": "Creeps are your units..."
    },
    {
      "name": "CreepMemory",
      "kind": "interface",
      "category": "Memory",
      "file": "src/memory.d.ts"
    }
  ]
}
```

**Search Tips:**
- Use exact type names for best results (e.g., "StructureTower")
- Search by category (e.g., "Structure", "Creep", "Memory")
- Use partial names (e.g., "Tower" finds "StructureTower", "TowerDefinition")
- Try related terms (e.g., "body" finds "BodyPartDefinition")

---

### 2. `screeps_types_get`

Get complete type definition for a specific type.

**Parameters:**
- `name` (string, required): Exact type name (case-sensitive)

**Use Cases:**
- Get full type definition
- Check all properties and methods
- Verify type signatures
- Understand type structure

**Example:**
```json
{
  "name": "Creep"
}
```

**Response Format:**
```json
{
  "name": "Creep",
  "kind": "interface",
  "extends": ["RoomObject"],
  "description": "Creeps are your units. They can move, harvest energy, construct structures, attack another creeps, and perform other actions.",
  "properties": [
    {
      "name": "body",
      "type": "BodyPartDefinition[]",
      "readonly": true,
      "description": "An array describing the creep's body."
    },
    {
      "name": "fatigue",
      "type": "number",
      "readonly": true,
      "description": "The movement fatigue indicator."
    }
  ],
  "methods": [
    {
      "name": "attack",
      "signature": "(target: AnyCreep | Structure) => CreepActionReturnCode",
      "description": "Attack another creep or structure in a short-ranged attack.",
      "parameters": [
        {
          "name": "target",
          "type": "AnyCreep | Structure",
          "description": "The target object to be attacked."
        }
      ],
      "returns": {
        "type": "CreepActionReturnCode",
        "description": "One of the error codes: OK, ERR_NOT_OWNER, ERR_BUSY, ERR_INVALID_TARGET, ERR_NOT_IN_RANGE, ERR_NO_BODYPART"
      }
    }
  ]
}
```

**What You Get:**
- Full type definition
- All properties with types
- All methods with signatures
- Parameter types and descriptions
- Return types
- Readonly/optional indicators
- Type relationships (extends, implements)

---

### 3. `screeps_types_list`

List all available types with optional filtering.

**Parameters:**
- `category` (string, optional): Filter by category
- `kind` (string, optional): Filter by kind (interface, type, enum, const)

**Use Cases:**
- Browse available types
- Discover types by category
- Find all interfaces or enums
- Explore type system

**Example:**
```json
{
  "category": "Structures",
  "kind": "interface"
}
```

**Response Format:**
```json
{
  "types": [
    {
      "name": "Structure",
      "kind": "interface",
      "category": "Structures",
      "file": "src/structure.d.ts"
    },
    {
      "name": "StructureTower",
      "kind": "interface",
      "category": "Structures",
      "file": "src/structure-tower.d.ts"
    }
  ],
  "total": 45
}
```

**Available Categories:**
- **Core** - Game, Memory, RawMemory
- **Game Objects** - Room, RoomPosition, Creep
- **Structures** - Structure, StructureTower, etc.
- **Resources** - Resource, Mineral, Deposit
- **Constants** - Error codes, body parts, etc.
- **Memory** - Memory interfaces
- **Pathfinding** - PathFinder, CostMatrix

**Available Kinds:**
- **interface** - TypeScript interfaces
- **type** - Type aliases
- **enum** - Enumerations
- **const** - Constants

---

### 4. `screeps_types_related`

Get types related to a specific type through extends/implements relationships.

**Parameters:**
- `name` (string, required): Type name to find relations for

**Use Cases:**
- Understand type hierarchy
- Find parent types
- Discover child types
- Explore type relationships

**Example:**
```json
{
  "name": "Structure"
}
```

**Response Format:**
```json
{
  "type": "Structure",
  "extends": ["RoomObject"],
  "extendedBy": [
    "StructureTower",
    "StructureSpawn",
    "StructureExtension",
    "StructureRampart",
    "..."
  ],
  "implements": [],
  "implementedBy": []
}
```

**Use This To:**
- Understand inheritance hierarchy
- Find all structure types
- Check what a type extends
- Discover related types

---

### 5. `screeps_types_by_file`

Get all types defined in a specific source file.

**Parameters:**
- `file` (string, required): File path (e.g., "src/creep.d.ts")

**Use Cases:**
- Browse types by file
- Understand file organization
- Find related types in same file

**Example:**
```json
{
  "file": "src/creep.d.ts"
}
```

**Response Format:**
```json
{
  "file": "src/creep.d.ts",
  "types": [
    {
      "name": "Creep",
      "kind": "interface"
    },
    {
      "name": "CreepMemory",
      "kind": "interface"
    }
  ]
}
```

---

## Workflow Patterns

### Pattern 1: Verify Type Before Using

**Scenario:** You want to use the Creep.body property.

**Steps:**
1. Get Creep type definition:
   ```json
   {"name": "Creep"}
   ```

2. Check body property:
   - Type: `BodyPartDefinition[]`
   - Readonly: true
   - Description: "An array describing the creep's body"

3. Get BodyPartDefinition type:
   ```json
   {"name": "BodyPartDefinition"}
   ```

4. Understand structure:
   ```typescript
   interface BodyPartDefinition {
     type: BodyPartConstant;
     hits: number;
   }
   ```

5. Write type-safe code:
   ```typescript
   const bodyParts: BodyPartDefinition[] = creep.body;
   const workParts = bodyParts.filter(p => p.type === WORK);
   ```

---

### Pattern 2: Understand Method Signatures

**Scenario:** You want to use Creep.moveTo method.

**Steps:**
1. Get Creep type:
   ```json
   {"name": "Creep"}
   ```

2. Find moveTo method:
   - Signature: `moveTo(target: RoomPosition | RoomObject, opts?: MoveToOpts) => CreepMoveReturnCode`
   - Parameters: target (position or object), opts (optional)
   - Returns: CreepMoveReturnCode

3. Get MoveToOpts type:
   ```json
   {"name": "MoveToOpts"}
   ```

4. Understand options:
   ```typescript
   interface MoveToOpts {
     reusePath?: number;
     serializeMemory?: boolean;
     noPathFinding?: boolean;
     visualizePathStyle?: PolyStyle;
     // ...
   }
   ```

5. Use correctly:
   ```typescript
   const result: CreepMoveReturnCode = creep.moveTo(target, {
     reusePath: 5,
     visualizePathStyle: { stroke: '#ffffff' }
   });
   ```

---

### Pattern 3: Explore Type Hierarchy

**Scenario:** You want to understand all structure types.

**Steps:**
1. Get Structure type:
   ```json
   {"name": "Structure"}
   ```

2. Find related types:
   ```json
   {"name": "Structure"}
   ```
   → Returns all types that extend Structure

3. Explore specific structures:
   ```json
   {"name": "StructureTower"}
   ```
   ```json
   {"name": "StructureSpawn"}
   ```

4. Understand hierarchy:
   ```
   RoomObject
     └─ Structure
          ├─ OwnedStructure
          │    ├─ StructureTower
          │    ├─ StructureSpawn
          │    └─ ...
          └─ StructureWall
          └─ StructureRoad
          └─ ...
   ```

---

### Pattern 4: Implement Interface Correctly

**Scenario:** You want to create custom memory interfaces.

**Steps:**
1. Get Memory type:
   ```json
   {"name": "Memory"}
   ```

2. Understand structure:
   ```typescript
   interface Memory {
     creeps: { [name: string]: CreepMemory };
     rooms: { [name: string]: RoomMemory };
     spawns: { [name: string]: SpawnMemory };
     // ...
   }
   ```

3. Get CreepMemory:
   ```json
   {"name": "CreepMemory"}
   ```

4. Extend properly:
   ```typescript
   interface CreepMemory {
     role: string;
     room: string;
     working: boolean;
     // Add custom properties
   }
   ```

---

## Integration with Other MCP Servers

### screeps-docs-mcp (Official Documentation)
- **Use docs server**: For high-level API understanding
- **Use types server**: For exact type definitions

**Example Flow:**
1. `screeps_docs_get_api` → Understand what Creep.attack does
2. `screeps_types_get` → Get exact type signature
3. Write type-safe code with correct types

### screeps-mcp (Live Game API)
- **Use types server**: To understand data structures
- **Use live server**: To inspect actual data

**Example Flow:**
1. `screeps_types_get` → Understand Memory structure
2. `screeps_memory_get` → Inspect actual memory data
3. Verify data matches expected types

### screeps-wiki-mcp (Community Knowledge)
- **Use wiki server**: For implementation patterns
- **Use types server**: For type-safe implementation

**Example Flow:**
1. `screeps_wiki_get_article` → Learn task queue pattern
2. `screeps_types_get` → Get types for task structures
3. Implement type-safe task queue

---

## Best Practices for AI Agents

### 1. Always Check Types Before Using

**❌ Don't:**
```typescript
// Assuming property exists and type
const body = creep.body; // What type is this?
```

**✅ Do:**
```typescript
// Verify with screeps_types_get first
const body: BodyPartDefinition[] = creep.body;
```

### 2. Understand Return Types

**❌ Don't:**
```typescript
// Ignoring return type
creep.attack(target);
```

**✅ Do:**
```typescript
// Check return type with screeps_types_get
const result: CreepActionReturnCode = creep.attack(target);
if (result === OK) {
  // Success
} else if (result === ERR_NOT_IN_RANGE) {
  // Move closer
}
```

### 3. Use Type Relationships

**❌ Don't:**
```typescript
// Not understanding type hierarchy
function handleStructure(structure: any) { }
```

**✅ Do:**
```typescript
// Use screeps_types_related to understand hierarchy
function handleStructure(structure: Structure) {
  if (structure instanceof StructureTower) {
    // TypeScript knows this is StructureTower
  }
}
```

### 4. Extend Interfaces Properly

**❌ Don't:**
```typescript
// Creating incompatible interfaces
interface MyCreepMemory {
  customProp: string;
}
```

**✅ Do:**
```typescript
// Use screeps_types_get to see CreepMemory structure
interface CreepMemory {
  role: string;
  working: boolean;
  // Extends properly
}
```

---

## Common Type Patterns

### Pattern 1: Game Object Types

All game objects extend from `RoomObject`:

```
RoomObject
  ├─ Creep
  ├─ Structure
  │    ├─ OwnedStructure
  │    └─ ...
  ├─ Resource
  ├─ Tombstone
  └─ ...
```

**Use `screeps_types_related` to explore hierarchy**

### Pattern 2: Return Code Types

Methods return specific error code types:

- `CreepActionReturnCode` - For creep actions
- `CreepMoveReturnCode` - For movement
- `ScreepsReturnCode` - Generic return codes

**Use `screeps_types_get` to see all possible values**

### Pattern 3: Constant Types

Constants use specific types:

- `BodyPartConstant` - Body part types (MOVE, WORK, etc.)
- `StructureConstant` - Structure types
- `ResourceConstant` - Resource types

**Use `screeps_types_list` with kind="const" to find constants**

### Pattern 4: Memory Interfaces

Memory uses index signatures:

```typescript
interface Memory {
  [key: string]: any; // Extensible
  creeps: { [name: string]: CreepMemory };
  rooms: { [name: string]: RoomMemory };
}
```

**Extend these interfaces for type safety**

---

## Type Safety Tips

### 1. Use Strict Type Checking

When writing TypeScript code:
- Enable `strict` mode in tsconfig.json
- Use `noImplicitAny`
- Check types with this MCP server

### 2. Avoid `any` Type

**❌ Don't:**
```typescript
function process(data: any) { }
```

**✅ Do:**
```typescript
// Get exact type with screeps_types_get
function process(data: BodyPartDefinition[]) { }
```

### 3. Use Type Guards

```typescript
function isCreep(obj: RoomObject): obj is Creep {
  return obj instanceof Creep;
}

if (isCreep(target)) {
  // TypeScript knows target is Creep
  target.moveTo(destination);
}
```

### 4. Leverage Union Types

```typescript
// From type definitions
type AnyCreep = Creep | PowerCreep;
type AnyStructure = Structure;

function attackTarget(target: AnyCreep | AnyStructure) {
  // Type-safe handling
}
```

---

## Quick Reference

### Common Types to Know

| Type | Purpose |
|------|---------|
| `Creep` | Your units |
| `Structure` | Base structure type |
| `StructureTower` | Tower structures |
| `StructureSpawn` | Spawn structures |
| `Room` | Room object |
| `RoomPosition` | Position in room |
| `Memory` | Memory root |
| `CreepMemory` | Creep memory |
| `BodyPartDefinition` | Body part info |
| `PathFinderOpts` | Pathfinding options |

### Common Return Types

| Type | Used By |
|------|---------|
| `ScreepsReturnCode` | Generic operations |
| `CreepActionReturnCode` | Creep actions |
| `CreepMoveReturnCode` | Movement |
| `OK` | Success constant |
| `ERR_*` | Error constants |

### When to Use Each Tool

| Need | Tool | Example |
|------|------|---------|
| Find type by name | `screeps_types_search` | `{"query": "Creep"}` |
| Get full type definition | `screeps_types_get` | `{"name": "Creep"}` |
| Browse all types | `screeps_types_list` | `{"category": "Structures"}` |
| Understand hierarchy | `screeps_types_related` | `{"name": "Structure"}` |
| Browse by file | `screeps_types_by_file` | `{"file": "src/creep.d.ts"}` |

---

## Resources

- **typed-screeps**: https://github.com/screepers/typed-screeps
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Screeps API**: https://docs.screeps.com/api/

---

## Summary

The Screeps TypeScript MCP Server helps AI agents:

1. ✅ Write type-safe code
2. ✅ Understand exact type structures
3. ✅ Verify method signatures
4. ✅ Explore type relationships
5. ✅ Implement interfaces correctly
6. ✅ Avoid type-related bugs

Always verify types before writing code to ensure type safety and correctness.
