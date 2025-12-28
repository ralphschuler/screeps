# AI Agent Guide for Screeps Documentation MCP Server

## Overview

The Screeps Documentation MCP Server provides AI agents with access to official Screeps API documentation and game mechanics information. This server is essential for fact-checking, verifying API usage, and understanding game mechanics before implementing bot features.

## Purpose

This MCP server enables AI agents to:

- **Verify API methods** before writing code
- **Check game mechanics** for accurate implementation
- **Search documentation** for specific topics
- **Explore available APIs** and their capabilities
- **Validate assumptions** about game behavior

## Available Tools

### 1. `screeps_docs_search`

Search the Screeps documentation for specific keywords or topics.

**Parameters:**
- `query` (string, required): Search query with keywords

**Use Cases:**
- Find documentation on specific topics
- Discover relevant API methods
- Search for game mechanics information
- Locate examples and tutorials

**Example:**
```json
{
  "query": "creep movement pathfinding"
}
```

**Response Format:**
```json
{
  "results": [
    {
      "title": "Creep.moveTo",
      "type": "api",
      "path": "api/Creep/moveTo",
      "snippet": "Find optimal path and move to target..."
    }
  ]
}
```

**Best Practices:**
- Use specific keywords rather than full questions
- Combine related terms (e.g., "tower attack range")
- Try variations if first search doesn't find what you need
- Use API object names (Game, Room, Creep, etc.) for better results

---

### 2. `screeps_docs_get_api`

Get complete API documentation for a specific game object.

**Parameters:**
- `objectName` (string, required): Name of the API object (e.g., "Game", "Room", "Creep", "StructureTower")

**Use Cases:**
- Get all methods and properties for an object
- Verify method signatures and return types
- Check available constants
- Understand object relationships

**Example:**
```json
{
  "objectName": "Creep"
}
```

**Response Format:**
```json
{
  "name": "Creep",
  "description": "Creeps are your units...",
  "properties": [
    {
      "name": "body",
      "type": "Array<BodyPartDefinition>",
      "description": "An array describing the creep's body..."
    }
  ],
  "methods": [
    {
      "name": "moveTo",
      "params": ["target", "opts"],
      "returns": "number",
      "description": "Find optimal path and move..."
    }
  ]
}
```

**Available Objects:**
- **Core**: Game, Memory, RawMemory, InterShardMemory
- **Room Objects**: Room, RoomPosition, RoomVisual
- **Creeps**: Creep, PowerCreep
- **Structures**: Structure, StructureSpawn, StructureTower, StructureExtension, etc.
- **Resources**: Resource, Mineral, Deposit
- **Other**: PathFinder, Market, etc.

**Best Practices:**
- Use exact object names (case-sensitive)
- Check the full object documentation before using methods
- Verify parameter types and return values
- Note any special conditions or restrictions

---

### 3. `screeps_docs_get_mechanics`

Get documentation for specific game mechanics.

**Parameters:**
- `topic` (string, required): Mechanics topic name

**Use Cases:**
- Understand game systems (control, market, power, etc.)
- Learn about game rules and constraints
- Check formulas and calculations
- Understand multi-room mechanics

**Example:**
```json
{
  "topic": "control"
}
```

**Available Topics:**
- **control** - Room control levels (RCL), controller mechanics
- **market** - Market system, trading, orders
- **power** - Power creeps, power processing
- **defense** - Safe mode, ramparts, towers
- **creeps** - Creep lifecycle, body parts, fatigue
- **resources** - Resource types, harvesting, processing
- **cpu** - CPU limits, bucket, subscriptions
- **respawn** - Respawning mechanics
- **combat** - Combat mechanics, damage calculation
- **terrain** - Terrain types, movement costs

**Response Format:**
```json
{
  "topic": "control",
  "title": "Room Control",
  "content": "Detailed explanation of control mechanics...",
  "sections": [
    {
      "title": "Controller Levels",
      "content": "RCL progression and requirements..."
    }
  ]
}
```

**Best Practices:**
- Read mechanics documentation before implementing features
- Understand formulas and calculations
- Check for special cases and edge conditions
- Verify assumptions about game behavior

---

### 4. `screeps_docs_list_apis`

List all available API objects.

**Parameters:** None

**Use Cases:**
- Discover available APIs
- Browse API structure
- Find related objects
- Explore game capabilities

**Example:**
```json
{}
```

**Response Format:**
```json
{
  "apis": [
    {
      "name": "Game",
      "category": "Core",
      "description": "Main game object..."
    },
    {
      "name": "Creep",
      "category": "Game Objects",
      "description": "Your units..."
    }
  ]
}
```

**Use This When:**
- Starting a new feature and unsure which API to use
- Exploring game capabilities
- Looking for related objects
- Building comprehensive documentation

---

### 5. `screeps_docs_list_mechanics`

List all available mechanics topics.

**Parameters:** None

**Use Cases:**
- Discover game mechanics
- Find relevant topics
- Understand game systems
- Plan bot architecture

**Example:**
```json
{}
```

**Response Format:**
```json
{
  "topics": [
    {
      "name": "control",
      "title": "Room Control",
      "description": "Controller and RCL mechanics"
    },
    {
      "name": "market",
      "title": "Market System",
      "description": "Trading and market orders"
    }
  ]
}
```

---

## Workflow Patterns

### Pattern 1: Verify API Before Coding

**Scenario:** You want to implement creep movement logic.

**Steps:**
1. Search for movement documentation:
   ```json
   {"query": "creep movement"}
   ```

2. Get full Creep API documentation:
   ```json
   {"objectName": "Creep"}
   ```

3. Verify `moveTo` method signature:
   - Check parameters: target, opts
   - Check return type: number (error code)
   - Check available options: reusePath, serializeMemory, etc.

4. Implement with confidence knowing exact API

**Why This Matters:**
- Prevents bugs from incorrect API usage
- Avoids trial-and-error coding
- Ensures you use all available options
- Reduces debugging time

---

### Pattern 2: Understand Game Mechanics

**Scenario:** You want to implement market trading.

**Steps:**
1. List mechanics topics to find relevant one:
   ```json
   {}
   ```
   → Find "market" topic

2. Get market mechanics documentation:
   ```json
   {"topic": "market"}
   ```

3. Read about:
   - How orders work
   - Transaction costs
   - Market fees
   - Order lifetime

4. Get Market API:
   ```json
   {"objectName": "Game.market"}
   ```

5. Implement trading logic with full understanding

---

### Pattern 3: Explore Related APIs

**Scenario:** You're working with structures and want to know all structure types.

**Steps:**
1. List all APIs:
   ```json
   {}
   ```

2. Filter for Structure-related objects:
   - Structure (base class)
   - StructureSpawn
   - StructureTower
   - StructureExtension
   - etc.

3. Get documentation for each relevant structure:
   ```json
   {"objectName": "StructureTower"}
   ```

4. Compare capabilities and choose appropriate structures

---

### Pattern 4: Fact-Check Assumptions

**Scenario:** You assume towers can heal creeps at any distance.

**Steps:**
1. Get tower documentation:
   ```json
   {"objectName": "StructureTower"}
   ```

2. Check `heal` method:
   - Find that healing effectiveness decreases with distance
   - Formula: `amount = 400 - 0.4 * distance`

3. Adjust implementation to account for distance

**Why This Matters:**
- Prevents incorrect implementations
- Avoids performance issues
- Ensures optimal bot behavior
- Reduces need for refactoring

---

## Integration with Other MCP Servers

This documentation server should be used in conjunction with:

### screeps-mcp (Live Game API)
- **Use docs server**: To verify API methods before calling them
- **Use live server**: To test and execute verified methods

**Example Flow:**
1. `screeps_docs_get_api` → Verify `Creep.moveTo` signature
2. `screeps_console` → Test movement command in game
3. Implement in bot code with confidence

### screeps-typescript-mcp (Type Definitions)
- **Use docs server**: For high-level API understanding
- **Use types server**: For exact TypeScript type definitions

**Example Flow:**
1. `screeps_docs_get_api` → Understand what `Creep.body` contains
2. `screeps_types_get` → Get exact TypeScript type for `BodyPartDefinition`
3. Write type-safe code

### screeps-wiki-mcp (Community Knowledge)
- **Use docs server**: For official API and mechanics
- **Use wiki server**: For community strategies and patterns

**Example Flow:**
1. `screeps_docs_get_mechanics` → Understand official defense mechanics
2. `screeps_wiki_search` → Find community defense strategies
3. Combine official mechanics with proven patterns

---

## Best Practices for AI Agents

### 1. Always Verify Before Implementing

**❌ Don't:**
```
Assume API methods exist and guess their signatures
```

**✅ Do:**
```
1. Search for the API: screeps_docs_search
2. Get full documentation: screeps_docs_get_api
3. Verify method exists and check signature
4. Implement with correct parameters
```

### 2. Understand Mechanics First

**❌ Don't:**
```
Implement features based on assumptions about game rules
```

**✅ Do:**
```
1. Identify relevant mechanics topic
2. Read mechanics documentation: screeps_docs_get_mechanics
3. Understand constraints and formulas
4. Design implementation based on actual mechanics
```

### 3. Use Specific Searches

**❌ Don't:**
```
{"query": "how do I make creeps move to a target?"}
```

**✅ Do:**
```
{"query": "creep moveTo pathfinding"}
```

### 4. Check Return Values

**❌ Don't:**
```
Assume methods return success/failure
```

**✅ Do:**
```
1. Check method documentation for return type
2. Understand error codes (ERR_NOT_OWNER, ERR_BUSY, etc.)
3. Implement proper error handling
```

### 5. Explore Related Objects

**❌ Don't:**
```
Only check the primary object you're working with
```

**✅ Do:**
```
1. List all APIs to find related objects
2. Check parent classes (e.g., Structure for StructureTower)
3. Look for helper objects (e.g., PathFinder for movement)
```

---

## Common Mistakes to Avoid

### Mistake 1: Assuming API Methods Exist

**Problem:** Implementing code that calls non-existent methods

**Solution:** Always verify with `screeps_docs_get_api` first

**Example:**
```
❌ Assumed: creep.attackTarget(enemy)
✅ Verified: creep.attack(target) - returns error code
```

### Mistake 2: Ignoring Return Values

**Problem:** Not handling error codes from methods

**Solution:** Check documentation for return values and error codes

**Example:**
```
❌ Ignored: creep.moveTo(target)
✅ Handled: 
  const result = creep.moveTo(target)
  if (result !== OK) {
    // Handle error based on error code
  }
```

### Mistake 3: Misunderstanding Mechanics

**Problem:** Implementing features that don't work as expected

**Solution:** Read mechanics documentation before implementing

**Example:**
```
❌ Assumed: Towers have unlimited range
✅ Verified: Tower effectiveness decreases with distance
```

### Mistake 4: Using Wrong Object Names

**Problem:** Searching for "Tower" instead of "StructureTower"

**Solution:** Use `screeps_docs_list_apis` to find correct names

**Example:**
```
❌ Wrong: {"objectName": "Tower"}
✅ Correct: {"objectName": "StructureTower"}
```

---

## Error Handling

### Common Errors

#### 1. Object Not Found

**Error:** "API object 'Creeps' not found"

**Cause:** Incorrect object name (should be "Creep" not "Creeps")

**Solution:**
- Use `screeps_docs_list_apis` to find correct name
- Check capitalization (case-sensitive)
- Use singular form for game objects

#### 2. Topic Not Found

**Error:** "Mechanics topic 'trading' not found"

**Cause:** Incorrect topic name (should be "market" not "trading")

**Solution:**
- Use `screeps_docs_list_mechanics` to find correct topic
- Check available topics list

#### 3. No Search Results

**Error:** "No results found for query"

**Cause:** Query too specific or using wrong keywords

**Solution:**
- Try broader search terms
- Use API object names in query
- Try synonyms or related terms

---

## Performance Tips

### Caching Strategy

Documentation is static, so aggressive caching is recommended:

**Cache Forever:**
- API documentation (doesn't change between game versions)
- Mechanics documentation
- API and mechanics lists

**Cache Implementation:**
```
cache = {}

function getAPI(objectName):
  if objectName in cache:
    return cache[objectName]
  
  result = screeps_docs_get_api(objectName)
  cache[objectName] = result
  return result
```

### Batch Information Gathering

Instead of multiple calls, gather all needed information upfront:

**❌ Inefficient:**
```
1. Get Creep API
2. Implement movement
3. Get Creep API again for attack
4. Implement attack
```

**✅ Efficient:**
```
1. Get Creep API once
2. Extract all needed methods (moveTo, attack, heal, etc.)
3. Implement all features
```

---

## Quick Reference

### When to Use Each Tool

| Need | Tool | Example |
|------|------|---------|
| Find documentation on topic | `screeps_docs_search` | `{"query": "tower defense"}` |
| Get all methods for object | `screeps_docs_get_api` | `{"objectName": "Creep"}` |
| Understand game system | `screeps_docs_get_mechanics` | `{"topic": "control"}` |
| Discover available APIs | `screeps_docs_list_apis` | `{}` |
| Find mechanics topics | `screeps_docs_list_mechanics` | `{}` |

### Common API Objects

| Object | Purpose |
|--------|---------|
| Game | Global game object, access to all game data |
| Room | Room-specific data and operations |
| Creep | Your units, movement, actions |
| StructureSpawn | Spawn creeps |
| StructureTower | Defense and healing |
| StructureExtension | Energy storage for spawning |
| Memory | Persistent data storage |
| PathFinder | Advanced pathfinding |
| Market | Trading system |

### Common Mechanics Topics

| Topic | Content |
|-------|---------|
| control | RCL, controller, room ownership |
| market | Trading, orders, transactions |
| power | Power creeps, power processing |
| defense | Safe mode, ramparts, towers |
| creeps | Body parts, fatigue, lifecycle |
| cpu | CPU limits, bucket, optimization |

---

## Resources

- **Screeps Official Docs**: https://docs.screeps.com/
- **Screeps API Reference**: https://docs.screeps.com/api/
- **Game Mechanics**: https://docs.screeps.com/control.html
- **MCP Protocol**: https://modelcontextprotocol.io/

---

## Summary

The Screeps Documentation MCP Server is essential for AI agents to:

1. ✅ Verify API methods before implementation
2. ✅ Understand game mechanics accurately
3. ✅ Avoid common mistakes and bugs
4. ✅ Implement features with confidence
5. ✅ Reduce trial-and-error coding
6. ✅ Build robust, correct bot implementations

Always consult documentation before implementing features to ensure correctness and efficiency.
