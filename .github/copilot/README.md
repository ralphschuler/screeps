# Copilot Strategic Planner Workflow

## Overview

The Copilot Strategic Planner is an automated workflow that runs every 6 hours to analyze the Screeps bot's performance, code quality, and strategic direction. It uses AI-powered analysis through GitHub Copilot with multiple MCP (Model Context Protocol) servers to create actionable improvement recommendations as GitHub issues.

## Purpose

This workflow acts as a **repository auditor and strategic analyst**, continuously monitoring:

- Live bot performance and metrics
- Code architecture alignment with ROADMAP.md
- Optimization opportunities
- Strategic growth and expansion paths
- Infrastructure and automation gaps

## Schedule

- **Automatic**: Runs every 6 hours (`0 */6 * * *`)
- **Manual**: Can be triggered via workflow_dispatch

## MCP Servers Used

The workflow integrates with seven MCP servers for comprehensive analysis:

### 1. github (GitHub Integration)
- Repository metadata and issue management
- Pull request and commit information
- Actions workflow data

### 2. playwright (Browser Automation)
- Web UI interaction and testing
- Screenshot and visual validation capabilities
- Browser-based data extraction

### 3. screeps-mcp (Live Game State)
- Real-time bot performance metrics
- Memory inspection and analysis
- Room status and object data
- Market and economy tracking
- CPU and GCL statistics

### 4. screeps-docs-mcp (Official Documentation)
- API reference verification
- Game mechanics documentation
- Ensure code uses correct API patterns

### 5. screeps-wiki-mcp (Community Knowledge)
- Community strategies and best practices
- Proven optimization techniques
- Research community approaches

### 6. screeps-typescript-mcp (Type Definitions)
- TypeScript interface verification
- Type safety checks
- API type definitions

### 7. grafana-mcp (Monitoring & Observability)
- Performance dashboards access
- Metrics querying (Prometheus)
- Log analysis (Loki)
- Alert status monitoring
- Performance trend analysis

## What It Does

### Analysis Phases

1. **Performance Analysis**
   - Queries live bot stats via `screeps_stats`
   - Analyzes Grafana dashboards for trends
   - Inspects memory structures
   - Reviews market economy

2. **Code Quality Review**
   - Checks architecture alignment with ROADMAP.md
   - Verifies API usage against documentation
   - Identifies technical debt

3. **Strategic Planning**
   - Identifies optimization opportunities
   - Categorizes by domain (performance, economy, expansion, defense)
   - Prioritizes by impact and effort

4. **Issue Management**
   - Searches for existing issues to avoid duplicates
   - Creates comprehensive, evidence-based issues
   - Updates existing issues with new findings
   - Applies proper labels and priorities

### Issue Creation

The workflow creates GitHub issues with:

- **Strategic context** - Why this matters
- **Performance evidence** - Metrics from MCP servers
- **Current implementation** - Code references
- **Proposed solution** - Specific implementation steps
- **Research** - Community strategies and API verification
- **Acceptance criteria** - Measurable success conditions

### Quality Gates

Every issue must be:
- **Evidence-based** - Backed by metrics from MCP servers
- **Actionable** - Clear implementation steps
- **Researched** - Verified with documentation and community knowledge
- **Strategic** - Aligned with ROADMAP.md architecture

## Required Secrets

Configure these in GitHub repository settings:

### Required Secrets
- `COPILOT_TOKEN` - GitHub Copilot API token
- `SCREEPS_TOKEN` - Screeps API token for game access (passed as `COPILOT_MCP_SCREEPS_TOKEN`)
- `GRAFANA_SERVICE_ACCOUNT_TOKEN` - Grafana service account token (passed as `COPILOT_MCP_GRAFANA_SERVICE_ACCOUNT_TOKEN`)

### Optional Variables
- `SCREEPS_HOST` - Screeps server hostname (default: `screeps.com`, passed as `COPILOT_MCP_SCREEPS_HOST`)
- `SCREEPS_SHARD` - Target shard (default: `shard3`, passed as `COPILOT_MCP_SCREEPS_SHARD`)
- `SCREEPS_DOCS_CACHE_TTL` - Docs cache TTL in seconds (default: `3600`, passed as `COPILOT_MCP_SCREEPS_DOCS_CACHE_TTL`)
- `SCREEPS_WIKI_CACHE_TTL` - Wiki cache TTL in seconds (default: `3600`, passed as `COPILOT_MCP_SCREEPS_WIKI_CACHE_TTL`)
- `SCREEPS_TYPES_CACHE_TTL` - Types cache TTL in seconds (default: `3600`, passed as `COPILOT_MCP_SCREEPS_TYPES_CACHE_TTL`)

## Output

### Artifacts
Each run produces:
- Strategic planning report log file
- Stored as artifact for 30 days
- Located at `reports/copilot/strategic-planner-<run-id>.log`

### JSON Summary
The workflow outputs a JSON summary including:
- Bot health score (0-100)
- Metrics analyzed (CPU, GCL, rooms, creeps)
- Issues created and updated
- Priority breakdown
- Top recommendations
- Grafana insights

### GitHub Issues
Creates issues with labels:
- `automation` - Created by automation
- `strategic-planning` - From strategic analysis
- Type labels: `type/feature`, `type/enhancement`, `type/bug`, `type/performance`
- Priority labels: `priority/critical`, `priority/high`, `priority/medium`, `priority/low`
- Domain labels: `cpu`, `memory`, `expansion`, `defense`, `economy`, `infrastructure`

## Constraints

### Allowed Actions
- ✅ Read all repository files
- ✅ Use all MCP tools for analysis
- ✅ Create new GitHub issues
- ✅ Comment on existing issues
- ✅ Search issue history

### Prohibited Actions
- ❌ Close or delete issues
- ❌ Create pull requests
- ❌ Modify code files
- ❌ Change workflow configurations
- ❌ Delete documentation

### Rate Limits
- Maximum 10 issues per run
- Focus on quality over quantity
- Prefer updating existing issues over creating duplicates

## Architecture

```
.github/
├── actions/
│   └── copilot-exec/          # Reusable Copilot CLI action
│       └── action.yml         # Action definition with MCP support
├── copilot/
│   └── prompts/
│       └── strategic-planner  # Strategic analysis prompt
├── mcp/
│   └── all-servers.json       # MCP server configuration
└── workflows/
    └── copilot-strategic-planner.yml  # Main workflow
```

## Files

### Workflow File
`.github/workflows/copilot-strategic-planner.yml`
- Defines schedule and triggers
- Configures environment variables
- Calls copilot-exec action

### Action
`.github/actions/copilot-exec/action.yml`
- Reusable composite action
- Handles Copilot CLI execution
- Manages MCP server configuration
- Supports caching and performance optimization

### Prompt
`.github/copilot/prompts/strategic-planner`
- Comprehensive strategic analysis instructions
- Defines analysis workflow and phases
- Specifies issue creation requirements
- Sets quality standards

### MCP Configuration
`.github/mcp/all-servers.json`
- Configures all five MCP servers
- Supports environment variable substitution
- Docker-based MCP server execution

## How to Use

### Automatic Execution
The workflow runs automatically every 6 hours. No action required.

### Manual Execution
1. Go to Actions tab in GitHub
2. Select "Copilot Strategic Planner" workflow
3. Click "Run workflow"
4. Wait for completion (up to 45 minutes)

### Review Results
1. Check created/updated issues with `strategic-planning` label
2. Download artifacts to see full analysis log
3. Review JSON summary in workflow logs

## Integration with Development

The strategic planner integrates seamlessly with the development workflow:

1. **Identifies** improvement opportunities automatically
2. **Creates** well-researched issues with evidence
3. **Prioritizes** work based on impact analysis
4. **Guides** development focus with strategic recommendations
5. **Monitors** bot performance trends via Grafana

## Troubleshooting

### No Issues Created
- Check if workflow ran successfully
- Review artifact logs for analysis details
- Verify MCP servers are accessible
- Check if similar issues already exist

### MCP Server Errors
- Verify `SCREEPS_TOKEN` is valid and not expired
- Check `GRAFANA_SERVICE_ACCOUNT_TOKEN` has correct permissions
- Ensure Docker images are accessible (ghcr.io)

### Workflow Failures
- Check required secrets are configured
- Verify `COPILOT_TOKEN` has necessary permissions
- Review workflow logs for specific errors

## Related Documentation

- [ROADMAP.md](../../ROADMAP.md) - Bot architecture and design principles
- [AGENTS.md](../../AGENTS.md) - Agent instructions and MCP server usage
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Future Enhancements

Potential improvements to the strategic planner:

- Machine learning trend analysis
- Predictive performance modeling
- Automated PR creation for simple fixes
- Integration with CI/CD pipeline
- Multi-shard comparative analysis
- Historical performance regression detection
