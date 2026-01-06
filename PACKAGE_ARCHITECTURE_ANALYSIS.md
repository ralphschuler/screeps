# Package Architecture Analysis

## Issue: Non-Standard Output Paths in Economy and Defense Packages

### Current State

Both `@ralphschuler/screeps-economy` and `@ralphschuler/screeps-defense` packages have non-standard output paths in their package.json:

```json
// Current (economy package)
{
  "main": "dist/screeps-economy/src/index.js",
  "types": "dist/screeps-economy/src/index.d.ts"
}

// Expected (standard)
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

### Root Cause

The packages have dependencies on bot-internal code using the `@bot/*` path alias:

**Economy Package Dependencies:**
- `@bot/core/logger` - Structured logging system
- `@bot/core/kernel` - Process priorities and decorators
- `@bot/memory/manager` - Memory management utilities

**Defense Package Dependencies:**
- `@bot/core/logger` - Structured logging system
- `@bot/memory/manager` - Memory management utilities
- `@bot/core/processDecorators` - Process decorators
- `@bot/core/kernel` - Process priorities
- `@bot/memory/schemas` - SwarmState type definitions

### Why This Happens

TypeScript's compiler follows the `@bot/*` imports and compiles those files into the package's dist directory, creating this structure:

```
dist/
├── screeps-bot/         # Compiled @bot/* imports
│   └── src/
│       └── config/
│           └── index.js
└── screeps-economy/     # Compiled package source
    └── src/
        └── index.js
```

The package.json correctly points to where the compiled output actually is, but this structure is non-standard.

### Why Current Setup Works

The packages are **NOT designed to be standalone**. They are framework extensions that:
1. Are consumed by the bot during its Rollup build process
2. Have their `@bot/*` dependencies resolved by the bot's rollup configuration
3. Work correctly in the bot's build despite the nested output structure

### Options for Resolution

#### Option A: Make Packages Truly Standalone (NOT RECOMMENDED)

**Approach:**
- Remove all `@bot/*` dependencies
- Create abstraction interfaces for logger, memory, kernel
- Pass dependencies via dependency injection

**Pros:**
- Packages could be used by other bots
- Standard output structure

**Cons:**
- **MAJOR REFACTOR**: Would require rewriting significant portions of both packages
- Would require creating abstraction layers for all bot dependencies
- Would lose tight integration with bot's architecture
- Breaking changes to all consumers
- High effort, low value (packages are bot-specific anyway)

**Estimated Effort:** 20-30 hours

#### Option B: Move Packages Inside Bot (NOT RECOMMENDED)

**Approach:**
- Move packages to `packages/screeps-bot/packages/`
- Remove from root workspace
- Treat as bot-internal modules

**Pros:**
- Acknowledges that packages are bot-specific
- Simplifies dependency management

**Cons:**
- **BREAKING CHANGE**: Would break any external consumers
- Would require updating all import paths
- Would lose monorepo workspace benefits
- Packages are ALREADY published to npm as @ralphschuler packages
- Would require npm unpublish or deprecation

**Estimated Effort:** 8-10 hours

#### Option C: Keep Current Structure (RECOMMENDED) ✅

**Approach:**
- Accept current output structure as working correctly
- Document that these are bot-integrated packages, not standalone
- Update package descriptions to clarify they require bot integration

**Pros:**
- **Zero changes required** - current setup works correctly
- Preserves existing architecture
- No breaking changes
- Acknowledges reality: these packages ARE bot-specific
- Package.json already points to correct output location

**Cons:**
- Non-standard output structure (but functional)
- Might confuse external users (but packages aren't meant for external use anyway)

**Estimated Effort:** 1 hour (documentation only)

### Recommendation

**Option C (Keep Current Structure)** is the recommended approach because:

1. **Current setup works**: The packages build successfully and are correctly consumed by the bot
2. **Packages are bot-specific**: They were never designed to be standalone utilities
3. **No breaking changes**: Any modification would break existing integrations
4. **Effort vs. value**: Options A and B require significant effort for minimal benefit
5. **Honest architecture**: The current structure honestly reflects that these are bot-integrated packages

### Action Items

If Option C is accepted:

- [x] Document in this analysis that current structure is intentional
- [ ] Update package README files to clarify bot integration requirement
- [ ] Add note to package.json descriptions: "Requires @ralphschuler/screeps-bot integration"
- [ ] Close or update issue to reflect analysis findings

### Conclusion

The "weird" output paths in economy and defense packages are a **symptom, not a problem**. They reflect the reality that these packages are tightly integrated with the bot's architecture and were never designed to be standalone.

Attempting to "fix" the output paths would require either:
- Massive refactoring to make packages standalone (not valuable)
- Breaking changes to move packages internal (not beneficial)

The current structure works correctly and honestly represents the package architecture. **No changes recommended.**

---

*Analysis completed: 2026-01-05*
*Issue reference: #[current issue number]*
