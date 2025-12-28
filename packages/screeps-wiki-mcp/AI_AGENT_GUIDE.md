# AI Agent Guide for Screeps Wiki MCP Server

## Overview

The Screeps Wiki MCP Server provides AI agents with access to the community-maintained Screeps wiki at https://wiki.screepspl.us/. This server is valuable for discovering community strategies, best practices, bot architectures, and proven patterns that go beyond the official documentation.

## Purpose

This MCP server enables AI agents to:

- **Learn from community experience** - Access proven strategies and patterns
- **Discover bot architectures** - Study successful bot designs
- **Find optimization techniques** - Learn performance tips
- **Understand advanced concepts** - Go beyond basic API usage
- **Access community knowledge** - Benefit from collective wisdom

## Available Tools

### 1. `screeps_wiki_search`

Search the Screeps wiki for articles matching keywords.

**Parameters:**
- `query` (string, required): Search keywords

**Use Cases:**
- Find articles on specific topics
- Discover community strategies
- Search for optimization techniques
- Find examples and tutorials

**Example:**
```json
{
  "query": "remote harvesting strategy"
}
```

**Response Format:**
```json
{
  "results": [
    {
      "title": "Remote Harvesting",
      "url": "https://wiki.screepspl.us/index.php/Remote_Harvesting",
      "snippet": "Remote harvesting is the practice of...",
      "category": "Strategies"
    }
  ]
}
```

**Search Tips:**
- Use specific terms (e.g., "remote harvesting" not "getting energy")
- Try bot-related terms (e.g., "architecture", "design pattern")
- Search for specific features (e.g., "tower defense", "market trading")
- Use community terminology

---

### 2. `screeps_wiki_get_article`

Retrieve full content of a wiki article in markdown format.

**Parameters:**
- `title` (string, required): Article title (case-sensitive)

**Use Cases:**
- Read complete articles
- Study detailed strategies
- Learn implementation details
- Get code examples

**Example:**
```json
{
  "title": "Remote Harvesting"
}
```

**Response Format:**
```json
{
  "title": "Remote Harvesting",
  "content": "# Remote Harvesting\n\nRemote harvesting is...",
  "url": "https://wiki.screepspl.us/index.php/Remote_Harvesting",
  "lastModified": "2024-01-15T10:30:00Z"
}
```

**Content Includes:**
- Strategy explanations
- Implementation details
- Code examples
- Diagrams and tables
- Best practices
- Common pitfalls

**Best Practices:**
- Use exact article title from search results
- Parse markdown content for structured information
- Extract code examples for reference
- Note the last modified date for currency

---

### 3. `screeps_wiki_list_categories`

List all available wiki categories.

**Parameters:** None

**Use Cases:**
- Discover wiki organization
- Browse by topic area
- Find related articles
- Explore wiki structure

**Example:**
```json
{}
```

**Response Format:**
```json
{
  "categories": [
    {
      "name": "Strategies",
      "articleCount": 45,
      "description": "Game strategies and tactics"
    },
    {
      "name": "Bot Architectures",
      "articleCount": 23,
      "description": "Bot design patterns and structures"
    }
  ]
}
```

**Common Categories:**
- **Strategies** - Game strategies and tactics
- **Bot Architectures** - Design patterns and structures
- **Optimization** - Performance and CPU optimization
- **Combat** - Military and defense strategies
- **Economy** - Resource management and trading
- **Tutorials** - Step-by-step guides

---

### 4. `screeps_wiki_get_table`

Extract structured data from wiki tables as JSON.

**Parameters:**
- `title` (string, required): Article title containing the table
- `tableIndex` (number, optional): Table index if article has multiple tables (default: 0)

**Use Cases:**
- Extract structured data (e.g., body part costs, structure stats)
- Get comparison tables
- Parse reference data
- Convert wiki tables to usable format

**Example:**
```json
{
  "title": "Body Parts",
  "tableIndex": 0
}
```

**Response Format:**
```json
{
  "headers": ["Part", "Cost", "Effect"],
  "rows": [
    ["MOVE", "50", "Decreases fatigue by 2 per tick"],
    ["WORK", "100", "Harvests 2 energy per tick"],
    ["CARRY", "50", "Can contain up to 50 resources"]
  ]
}
```

**Use Cases:**
- Reference tables (costs, stats, formulas)
- Comparison tables (structure comparisons)
- Data tables (resource values, market data)

---

## Workflow Patterns

### Pattern 1: Learn Strategy Before Implementation

**Scenario:** You want to implement remote harvesting.

**Steps:**
1. Search for remote harvesting:
   ```json
   {"query": "remote harvesting"}
   ```

2. Get the article:
   ```json
   {"title": "Remote Harvesting"}
   ```

3. Read and understand:
   - Why remote harvesting is beneficial
   - How to select remote rooms
   - Creep composition for remote harvesting
   - Defense considerations
   - CPU optimization tips

4. Implement based on proven strategy

**Why This Matters:**
- Avoid reinventing the wheel
- Learn from others' mistakes
- Use proven patterns
- Understand trade-offs

---

### Pattern 2: Study Bot Architectures

**Scenario:** You're designing a new bot architecture.

**Steps:**
1. List categories to find architecture articles:
   ```json
   {}
   ```

2. Search for bot architectures:
   ```json
   {"query": "bot architecture design"}
   ```

3. Get articles on different architectures:
   ```json
   {"title": "Screeps Overmind"}
   ```
   ```json
   {"title": "Kernel-Based Architecture"}
   ```

4. Compare approaches:
   - Centralized vs. distributed
   - Process-based vs. task-based
   - Memory usage patterns
   - CPU allocation strategies

5. Choose or adapt architecture for your needs

---

### Pattern 3: Optimize Performance

**Scenario:** Your bot is hitting CPU limits.

**Steps:**
1. Search for optimization techniques:
   ```json
   {"query": "CPU optimization performance"}
   ```

2. Get optimization articles:
   ```json
   {"title": "CPU Optimization"}
   ```

3. Learn techniques:
   - Caching strategies
   - Pathfinding optimization
   - Memory management
   - Bucket management

4. Apply relevant optimizations

---

### Pattern 4: Extract Reference Data

**Scenario:** You need body part costs for spawn calculations.

**Steps:**
1. Search for body parts:
   ```json
   {"query": "body parts cost"}
   ```

2. Get the article:
   ```json
   {"title": "Body Parts"}
   ```

3. Extract table data:
   ```json
   {"title": "Body Parts", "tableIndex": 0}
   ```

4. Use structured data in calculations

---

## Integration with Other MCP Servers

### screeps-docs-mcp (Official Documentation)
- **Use docs server**: For official API and mechanics
- **Use wiki server**: For community strategies and patterns

**Example Flow:**
1. `screeps_docs_get_mechanics` → Understand official tower mechanics
2. `screeps_wiki_search` → Find community tower defense strategies
3. Combine official mechanics with proven patterns

### screeps-mcp (Live Game API)
- **Use wiki server**: To learn strategies
- **Use live server**: To test strategies in game

**Example Flow:**
1. `screeps_wiki_get_article` → Learn remote harvesting strategy
2. `screeps_console` → Test remote harvesting logic
3. `screeps_memory_get` → Monitor performance

### screeps-typescript-mcp (Type Definitions)
- **Use wiki server**: For high-level patterns
- **Use types server**: For type-safe implementation

**Example Flow:**
1. `screeps_wiki_get_article` → Learn task queue pattern
2. `screeps_types_get` → Get types for task queue implementation
3. Implement type-safe task queue

---

## Best Practices for AI Agents

### 1. Search Before Implementing

**❌ Don't:**
```
Implement complex features from scratch without research
```

**✅ Do:**
```
1. Search wiki for existing strategies
2. Read community approaches
3. Adapt proven patterns to your needs
4. Avoid common pitfalls mentioned in articles
```

### 2. Understand Context

**❌ Don't:**
```
Copy code examples without understanding
```

**✅ Do:**
```
1. Read full article for context
2. Understand why the approach works
3. Consider trade-offs mentioned
4. Adapt to your specific situation
```

### 3. Cross-Reference with Official Docs

**❌ Don't:**
```
Trust wiki as sole source of truth
```

**✅ Do:**
```
1. Use wiki for strategies and patterns
2. Verify API usage with official docs
3. Cross-check mechanics with official documentation
4. Combine community wisdom with official facts
```

### 4. Check Article Currency

**❌ Don't:**
```
Assume all articles are up-to-date
```

**✅ Do:**
```
1. Check lastModified date
2. Verify information with current game version
3. Test strategies in current game environment
4. Update understanding if game has changed
```

---

## Common Use Cases

### Use Case 1: Learning Bot Architectures

**Goal:** Understand different bot architecture patterns

**Approach:**
1. Search: `{"query": "bot architecture"}`
2. Read articles on:
   - Overmind architecture
   - Kernel-based systems
   - Task-based systems
   - Process-based systems
3. Compare pros/cons
4. Choose or design architecture

**Articles to Read:**
- "Screeps Overmind"
- "Kernel Architecture"
- "Task System"
- "Process Management"

---

### Use Case 2: Implementing Combat

**Goal:** Build effective combat system

**Approach:**
1. Search: `{"query": "combat military strategy"}`
2. Read articles on:
   - Tower defense
   - Rampart placement
   - Creep combat
   - Boost usage
3. Learn proven tactics
4. Implement adapted strategy

**Articles to Read:**
- "Tower Defense"
- "Combat Creeps"
- "Boost Management"
- "Defense Strategies"

---

### Use Case 3: Market Trading

**Goal:** Implement automated trading

**Approach:**
1. Search: `{"query": "market trading economy"}`
2. Read articles on:
   - Market mechanics
   - Trading strategies
   - Price analysis
   - Profit optimization
3. Understand market patterns
4. Implement trading logic

**Articles to Read:**
- "Market Trading"
- "Economy Management"
- "Resource Balancing"

---

### Use Case 4: CPU Optimization

**Goal:** Reduce CPU usage

**Approach:**
1. Search: `{"query": "CPU optimization performance"}`
2. Read articles on:
   - Caching strategies
   - Pathfinding optimization
   - Memory management
   - Profiling techniques
3. Identify bottlenecks
4. Apply optimizations

**Articles to Read:**
- "CPU Optimization"
- "Pathfinding Performance"
- "Caching Strategies"
- "Profiling"

---

## Tips for Effective Wiki Usage

### 1. Use Specific Search Terms

**Less Effective:**
- "how to play"
- "getting started"
- "creeps"

**More Effective:**
- "remote harvesting strategy"
- "tower defense optimization"
- "market trading algorithm"

### 2. Read Related Articles

Don't stop at one article. Read related topics:
- If reading about remote harvesting, also read about:
  - Creep composition
  - Path caching
  - Defense strategies
  - CPU optimization

### 3. Extract Code Examples

Many articles include code examples:
- Copy examples as reference
- Understand the logic, don't just copy
- Adapt to your architecture
- Test before deploying

### 4. Note Best Practices

Articles often mention:
- ✅ Recommended approaches
- ❌ Common mistakes
- ⚠️ Gotchas and edge cases
- 💡 Optimization tips

---

## Limitations and Considerations

### Wiki Content is Community-Maintained

**Implications:**
- May not always be up-to-date
- Quality varies by article
- Some information may be outdated
- Not official documentation

**Mitigation:**
- Cross-reference with official docs
- Check article dates
- Test strategies in current game
- Verify API usage

### Strategies May Not Fit Your Bot

**Implications:**
- Different architectures have different needs
- Strategies may assume certain bot designs
- CPU budgets vary by account

**Mitigation:**
- Understand the strategy's context
- Adapt to your architecture
- Consider your constraints
- Test and measure results

### Code Examples May Be Incomplete

**Implications:**
- Examples may be pseudocode
- May not include error handling
- May assume certain helper functions

**Mitigation:**
- Use examples as reference, not complete solutions
- Add proper error handling
- Adapt to your codebase
- Test thoroughly

---

## Quick Reference

### When to Use Wiki Server

| Situation | Use Wiki For |
|-----------|--------------|
| Designing bot architecture | Study proven architectures |
| Implementing complex feature | Learn community strategies |
| Optimizing performance | Find optimization techniques |
| Planning expansion | Learn expansion strategies |
| Building combat system | Study combat tactics |
| Setting up economy | Learn resource management |

### Complementary MCP Servers

| Task | Primary Server | Supporting Server |
|------|----------------|-------------------|
| Learn strategy | Wiki | Docs (verify API) |
| Implement feature | Docs (API) | Wiki (patterns) |
| Optimize code | Wiki (techniques) | Live (measure) |
| Debug issues | Live (inspect) | Wiki (solutions) |

---

## Resources

- **Screeps Wiki**: https://wiki.screepspl.us/
- **Official Docs**: https://docs.screeps.com/
- **Screeps Slack**: https://chat.screeps.com/
- **Reddit**: https://reddit.com/r/screeps/

---

## Summary

The Screeps Wiki MCP Server helps AI agents:

1. ✅ Learn from community experience
2. ✅ Discover proven strategies and patterns
3. ✅ Avoid common mistakes
4. ✅ Optimize bot performance
5. ✅ Understand advanced concepts
6. ✅ Benefit from collective wisdom

Use the wiki to learn strategies, then verify API usage with official documentation and test with the live game server.
