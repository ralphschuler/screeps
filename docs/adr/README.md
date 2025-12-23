# Architecture Decision Records (ADRs)

## Overview

This directory contains Architecture Decision Records (ADRs) for the Screeps bot. ADRs document important architectural decisions, their context, rationale, and consequences.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help:

- **Preserve institutional knowledge**: Why certain patterns and approaches were chosen
- **Onboard new contributors**: Understand architectural choices faster
- **Inform future decisions**: Learn from past trade-offs and alternatives considered
- **Track architectural evolution**: See how the bot's design has evolved over time
- **Support refactoring**: Make informed decisions about changing existing architecture

## ADR Format

Each ADR follows a standard format (see [template](#template) below):

- **Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXXX
- **Context**: The problem or situation requiring a decision
- **Decision**: What was decided and implemented
- **Consequences**: Benefits and drawbacks of the decision
- **Alternatives Considered**: Other options evaluated and why they were rejected
- **Performance Impact**: CPU/memory impact when relevant
- **References**: Related issues, ADRs, and external resources

## Index of ADRs

### Core Architecture

- [ADR-0001: POSIS Process Architecture](0001-posis-process-architecture.md) - Process-based OS architecture for bot organization
- [ADR-0002: Pheromone Coordination System](0002-pheromone-coordination-system.md) - Stigmergic communication via pheromone signals
- [ADR-0003: Cartographer Traffic Management](0003-cartographer-traffic-management.md) - Using screeps-cartographer for pathfinding and traffic
- [ADR-0004: Five-Layer Swarm Architecture](0004-five-layer-swarm-architecture.md) - Empire → Shard → Cluster → Room → Creep hierarchy

### Memory and Caching

- [ADR-0005: Memory Segment vs Heap Storage](0005-memory-segment-vs-heap-storage.md) - Storage strategy for different data types
- [ADR-0006: Cache Strategy and TTL Policy](0006-cache-strategy-and-ttl-policy.md) - Unified caching system with TTL-based expiration

### Game Systems

- [ADR-0007: Spawn Queue Prioritization](0007-spawn-queue-prioritization.md) - Priority-based spawn queue algorithm
- [ADR-0008: Tower Targeting Algorithm](0008-tower-targeting-algorithm.md) - Tower target selection and energy efficiency

## Creating a New ADR

When making a significant architectural decision:

1. **Copy the template** below to a new file: `docs/adr/XXXX-descriptive-name.md`
2. **Number sequentially**: Use the next available number (check the index above)
3. **Fill in all sections**: Context, decision, consequences, alternatives, etc.
4. **Get feedback**: Share with team members for review
5. **Update the index**: Add your ADR to the index above
6. **Link from code**: Reference the ADR in relevant source files
7. **Reference in issues**: Link ADRs in related GitHub issues

## Template

```markdown
# ADR-XXXX: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-YYYY]

## Context

What is the issue that we're seeing that is motivating this decision or change?

Include:
- The problem statement
- Current limitations or pain points
- Goals and requirements
- Constraints (CPU, memory, Screeps API limitations)

## Decision

What is the change that we're proposing and/or doing?

Describe:
- The chosen approach
- How it works
- Key implementation details
- Why this specific approach was selected

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- What benefits does this decision provide?
- What problems does it solve?
- What capabilities does it enable?

### Negative

- What drawbacks or trade-offs does this decision have?
- What becomes more complex?
- What limitations does it introduce?

## Alternatives Considered

What other options were evaluated?

### Alternative 1: [Name]

- **Description**: Brief overview
- **Pros**: Benefits of this approach
- **Cons**: Drawbacks of this approach
- **Why rejected**: Specific reason not chosen

### Alternative 2: [Name]

- **Description**: Brief overview
- **Pros**: Benefits of this approach
- **Cons**: Drawbacks of this approach
- **Why rejected**: Specific reason not chosen

## Performance Impact

- **CPU impact**: Specific CPU costs or savings (if applicable)
- **Memory impact**: Memory usage implications (if applicable)
- **Benchmarks**: Profiling data or measurements (if available)
- **Scalability**: How does this scale with room count or creep count?

## References

- Related GitHub issues: #XXX, #YYY
- Related ADRs: ADR-XXXX, ADR-YYYY
- External documentation: [link]
- Community discussions: [link]
- Screeps documentation: [link]
```

## ADR Lifecycle

### Status Transitions

```
Proposed → Accepted → [Deprecated | Superseded]
```

- **Proposed**: New ADR under discussion
- **Accepted**: Decision has been implemented
- **Deprecated**: No longer recommended but not replaced
- **Superseded**: Replaced by a newer ADR

### Updating ADRs

- **Don't modify historical decisions**: ADRs are historical records
- **Create new ADRs for changes**: If a decision changes, create a new ADR and mark the old one as superseded
- **Clarifications are OK**: Minor clarifications and formatting improvements are acceptable
- **Update status**: Keep the status field current

## Best Practices

1. **Write ADRs early**: Document decisions when they're made, not months later
2. **Be concise**: Focus on the decision and rationale, not implementation details
3. **Include context**: Future readers need to understand why the decision was made
4. **List alternatives**: Show what else was considered and why it was rejected
5. **Measure impact**: Include performance data when relevant
6. **Link widely**: Reference ADRs from code, issues, and other documentation
7. **Keep them simple**: ADRs should be readable in 5-10 minutes

## External Resources

- [ADR GitHub Organization](https://adr.github.io/) - Tools and examples
- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Original ADR concept
- [ADR Tools](https://github.com/npryce/adr-tools) - Command-line tools for ADR management

---

*For questions about ADRs or this documentation, see [CONTRIBUTING_DOCS.md](../CONTRIBUTING_DOCS.md)*
