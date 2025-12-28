# AI Agent Improvements for Screeps MCP Server

## Overview

This document describes the improvements made to the Screeps MCP Server to enhance usability for AI agents. These improvements focus on better error handling, comprehensive documentation, enhanced validation, and clearer tool descriptions.

## What Changed

### 1. Comprehensive AI Agent Guide

**File**: `AI_AGENT_GUIDE.md`

A complete guide specifically written for AI agents that includes:

- **Detailed tool documentation** with use cases, examples, and response formats
- **Error handling patterns** with common error scenarios and solutions
- **Best practices** for tool selection, performance optimization, and safety
- **Common patterns** for typical workflows (memory updates, room analysis, market trading)
- **Troubleshooting guide** for common issues
- **Decision trees** to help AI agents select the right tool for each task

**Benefits for AI Agents:**
- Reduces trial-and-error by providing clear usage examples
- Helps agents understand when to use each tool
- Provides context for error messages and recovery strategies
- Documents expected response formats for easier parsing

### 2. Enhanced Tool Schemas

**File**: `src/handlers/enhanced-schemas.ts`

Improved Zod validation schemas with:

- **Detailed descriptions** for every parameter explaining format, constraints, and examples
- **Better validation rules** with clear error messages
- **Input sanitization** to prevent common mistakes
- **Format validation** for room names, user IDs, and other structured data
- **Helpful error messages** that explain what went wrong and how to fix it

**Example improvements:**

**Before:**
```typescript
room: z.string().describe("Room name (e.g., 'W1N1')")
```

**After:**
```typescript
room: z.string()
  .regex(/^[WE]\d+[NS]\d+$/, "Room name must be in format like 'W1N1' or 'E5S10'")
  .describe(
    "Room name in Screeps coordinate format (e.g., 'W1N1', 'E5S10'). " +
    "Returns 50x50 grid of terrain data where: " +
    "0 = plain, 1 = wall, 2 = swamp. " +
    "Terrain is static and never changes (safe to cache)."
  )
```

**Benefits for AI Agents:**
- Immediate validation feedback with actionable error messages
- Clear understanding of expected input formats
- Reduced errors from malformed inputs
- Better context for parameter usage

### 3. Standardized Error Handling

**File**: `src/utils/error-handler.ts`

A comprehensive error handling system that provides:

- **Standardized error response format** across all tools
- **Error categorization** (validation, authentication, network, API, etc.)
- **Error codes** for programmatic error handling
- **Contextual suggestions** for how to resolve each error type
- **Validation utilities** for common input types (room names, user IDs, etc.)

**Error Response Format:**
```json
{
  "content": [{
    "type": "text",
    "text": "VALIDATION_ERROR: Invalid room name format: \"W1N\"\n\n" +
            "Context: Validating room terrain request\n\n" +
            "Suggestions:\n" +
            "  - Room names must be in format like 'W1N1' or 'E5S10'\n" +
            "  - First character: W (west) or E (east)\n" +
            "  - Followed by a number\n" +
            "  - Then: N (north) or S (south)\n" +
            "  - Followed by a number"
  }],
  "isError": true,
  "errorCode": "E1002",
  "errorType": "VALIDATION_ERROR"
}
```

**Benefits for AI Agents:**
- Consistent error format makes parsing easier
- Error codes enable programmatic error handling
- Suggestions help agents recover from errors automatically
- Categorization helps agents understand error severity and type

### 4. Improved Documentation Structure

**Updates to existing README.md:**

- Added reference to AI_AGENT_GUIDE.md for AI agents
- Clarified authentication methods and environment variables
- Documented all 27 available tools with brief descriptions
- Added troubleshooting section
- Included links to additional resources

## How AI Agents Benefit

### Before These Improvements

**Typical AI Agent Experience:**
1. Agent tries to use `screeps_room_terrain` with room name "W1N"
2. Gets generic error: "Invalid input"
3. Agent doesn't know what's wrong
4. Agent tries variations: "w1n1", "W1-N1", etc.
5. Eventually gives up or asks user for help

### After These Improvements

**Improved AI Agent Experience:**
1. Agent reads AI_AGENT_GUIDE.md to understand tool usage
2. Sees example: room names like "W1N1", "E5S10"
3. Agent tries to use `screeps_room_terrain` with room name "W1N"
4. Gets detailed error with validation message and suggestions
5. Agent immediately corrects to "W1N1" and succeeds

### Specific Improvements

#### 1. Tool Selection

**Before:** Agent guesses which tool to use based on name

**After:** Agent uses decision tree in guide:
- Need to execute code? → `screeps_console`
- Need to read room data? → `screeps_room_*` tools
- Need to read memory? → `screeps_memory_get`

#### 2. Error Recovery

**Before:** Generic errors with no recovery path

**After:** Categorized errors with specific suggestions:
- Authentication error → Check token, regenerate if expired
- Validation error → Fix input format with examples
- Rate limit error → Implement backoff strategy
- Network error → Retry with timeout

#### 3. Parameter Understanding

**Before:** Minimal parameter descriptions

**After:** Comprehensive parameter documentation:
- What the parameter is for
- Expected format with examples
- Constraints and limits
- Common mistakes to avoid

#### 4. Response Parsing

**Before:** Unclear response formats

**After:** Documented response structures:
- Example responses for each tool
- Explanation of response fields
- Notes on data types and formats

## Integration Guide for AI Agents

### Step 1: Read the AI Agent Guide

Before using any tools, AI agents should:

1. Read `AI_AGENT_GUIDE.md` completely
2. Understand the tool categories and their purposes
3. Review the decision tree for tool selection
4. Study the common patterns section

### Step 2: Implement Error Handling

AI agents should implement error handling that:

1. Parses the `errorType` and `errorCode` fields
2. Reads the suggestions array for recovery strategies
3. Implements retry logic with exponential backoff
4. Logs errors for debugging

**Example pseudo-code:**
```
function callTool(toolName, params):
  try:
    response = mcpServer.call(toolName, params)
    if response.isError:
      handleError(response)
    else:
      return response.content
  catch error:
    handleUnexpectedError(error)

function handleError(errorResponse):
  errorType = errorResponse.errorType
  suggestions = parseSuggestions(errorResponse.content[0].text)
  
  if errorType == "VALIDATION_ERROR":
    // Fix input based on suggestions
    correctedParams = fixValidation(params, suggestions)
    return callTool(toolName, correctedParams)
  
  else if errorType == "RATE_LIMIT_ERROR":
    // Implement backoff
    wait(exponentialBackoff())
    return callTool(toolName, params)
  
  else if errorType == "AUTHENTICATION_ERROR":
    // Alert user to check credentials
    alertUser("Authentication failed. Check SCREEPS_TOKEN.")
    return null
  
  // ... handle other error types
```

### Step 3: Use Enhanced Schemas

When preparing tool calls:

1. Read the schema descriptions carefully
2. Validate inputs locally before sending
3. Use the examples provided in descriptions
4. Follow the format specifications exactly

### Step 4: Leverage Common Patterns

For typical workflows, follow the patterns in the guide:

**Safe Memory Update Pattern:**
```
1. screeps_memory_get(path) → read current value
2. Validate current value
3. Prepare new value
4. screeps_memory_set(path, newValue)
5. Optional: screeps_memory_get(path) → verify
```

**Room Analysis Pattern:**
```
1. screeps_room_status(room) → check ownership
2. screeps_room_terrain(room) → get layout
3. screeps_room_objects(room) → get contents
4. Analyze and make decisions
```

## Migration Guide

### For Existing AI Agent Implementations

If you have an existing AI agent using the Screeps MCP Server:

1. **Update error handling** to parse new error format
2. **Add validation** using the enhanced schemas
3. **Implement retry logic** based on error types
4. **Update tool selection** logic using the decision tree
5. **Add caching** for static data (terrain, etc.)

### Backward Compatibility

All existing tool calls will continue to work. The improvements are additive:

- ✅ Existing tool names unchanged
- ✅ Existing parameter names unchanged
- ✅ Existing response formats preserved
- ✅ New error format is backward compatible (adds fields, doesn't remove)
- ✅ Enhanced schemas are stricter but provide better error messages

## Testing Recommendations

### For AI Agent Developers

Test your AI agent with:

1. **Valid inputs** - Ensure normal operation works
2. **Invalid inputs** - Verify error handling works correctly
3. **Edge cases** - Test boundary conditions (empty strings, max values, etc.)
4. **Network failures** - Simulate connection issues
5. **Rate limiting** - Test behavior under high load

### Test Scenarios

**Scenario 1: Invalid Room Name**
```
Input: { room: "W1N" }
Expected: Validation error with suggestions
Agent should: Correct to "W1N1" and retry
```

**Scenario 2: Memory Path Validation**
```
Input: { path: ".invalid..path." }
Expected: Validation error explaining dot notation rules
Agent should: Fix path format and retry
```

**Scenario 3: Segment Size Limit**
```
Input: { segment: 0, data: "<200KB of data>" }
Expected: Validation error about 100KB limit
Agent should: Split data or compress
```

## Performance Considerations

### Caching Strategy

AI agents should cache:

- **Terrain data** (never changes)
- **Room status** (changes slowly)
- **User info** (mostly static)
- **Shard info** (rarely changes)

### Rate Limiting

To avoid rate limits:

- Implement request throttling
- Use batch operations when possible (via console commands)
- Cache frequently accessed data
- Avoid polling in tight loops

### Optimization Tips

1. **Use specific memory paths** instead of reading entire Memory
2. **Filter market orders** by resource type
3. **Limit leaderboard queries** with appropriate limit/offset
4. **Reuse connections** (server handles this automatically)

## Future Improvements

Planned enhancements for future versions:

1. **Request batching** - Execute multiple operations in one call
2. **WebSocket support** - Real-time updates for game events
3. **Caching layer** - Server-side caching for frequently accessed data
4. **Rate limiting** - Built-in rate limiting with queue management
5. **Metrics and monitoring** - Usage statistics and performance metrics

## Feedback and Contributions

We welcome feedback from AI agent developers:

- **Report issues** on GitHub
- **Suggest improvements** via pull requests
- **Share use cases** to help us understand AI agent needs
- **Contribute examples** of successful AI agent implementations

## Resources

- **AI Agent Guide**: `AI_AGENT_GUIDE.md` - Complete guide for AI agents
- **Enhanced Schemas**: `src/handlers/enhanced-schemas.ts` - Validation schemas
- **Error Handler**: `src/utils/error-handler.ts` - Error handling utilities
- **Main README**: `README.md` - General server documentation
- **Screeps API Docs**: https://docs.screeps.com/
- **MCP Protocol**: https://modelcontextprotocol.io/

## Summary

These improvements make the Screeps MCP Server significantly more usable for AI agents by:

1. ✅ Providing comprehensive documentation tailored for AI agents
2. ✅ Enhancing validation with clear, actionable error messages
3. ✅ Standardizing error handling across all tools
4. ✅ Adding helpful suggestions for error recovery
5. ✅ Documenting common patterns and best practices
6. ✅ Improving tool descriptions with examples and use cases

The result is a more robust, user-friendly MCP server that enables AI agents to work more effectively with the Screeps game API.
