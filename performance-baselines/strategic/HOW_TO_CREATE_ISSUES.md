# How to Create GitHub Issues from Strategic Analysis

This directory contains the strategic planning analysis from February 2, 2026. The analysis identified **12 strategic opportunities** for repository development, with detailed issue templates ready to create.

## Quick Start

### Option 1: Create Issues Manually (Recommended)

1. Open [STRATEGIC_ISSUES.md](../../STRATEGIC_ISSUES.md)
2. Copy each issue template (title + body)
3. Create a new issue on GitHub
4. Add the specified labels
5. Submit

### Option 2: Create Issues via GitHub CLI

```bash
# Example: Create test coverage issue
gh issue create \
  --title "test(coverage): establish test coverage baselines and expand to 75% overall" \
  --body-file <(sed -n '/^## Issue 1/,/^## Issue 2/p' STRATEGIC_ISSUES.md) \
  --label "type/enhancement,priority/high,testing,automation,strategic-planning"

# Repeat for each issue (12 total)
```

### Option 3: Bulk Create (Advanced)

Use the provided script to create all issues at once:

```bash
# TODO: Create script to parse STRATEGIC_ISSUES.md and bulk create
./scripts/create-strategic-issues.sh
```

## Issue Priority Guide

Issues are categorized by priority based on **impact** and **effort**:

### 🔴 Critical Priority (P0)
**Action**: Start immediately, complete within 1 week

- **Issue #1**: Fix Metrics Collection Pipeline
  - **Impact**: Blocks all future automated strategic planning
  - **Effort**: Medium (2-3 days)
  - **Why**: Without metrics, cannot detect regressions or measure improvements

### 🟠 High Priority (P1)
**Action**: Start within 2 weeks, complete within 1 month

- **Issue #2**: Establish Test Coverage Baselines
  - **Impact**: Enables quality gates and regression detection
  - **Effort**: Low (1-2 days)
  
- **Issue #3**: Framework Publishing Roadmap
  - **Impact**: Unlocks external adoption
  - **Effort**: High (2-3 weeks)
  
- **Issue #4**: API Documentation Website
  - **Impact**: Improves developer experience significantly
  - **Effort**: Medium (1 week)

### 🟡 Medium Priority (P2)
**Action**: Start within 1 month, complete within 2-3 months

- **Issue #5**: Architectural Improvements (TODOs)
- **Issue #6**: Performance Regression Detection
- **Issue #7**: Code Quality Automated Gates
- **Issue #8**: Example Projects
- **Issue #9**: Migration Guides
- **Issue #10**: Cluster Formation Algorithm

### ⚪ Low Priority (P3)
**Action**: Address when time permits (Month 4+)

- **Issue #11**: CI/CD Optimization
- **Issue #12**: Video Tutorials

## Labels to Apply

Each issue should have these labels:

**Type** (choose one):
- `type/enhancement` - New feature or improvement
- `type/bug` - Something broken that needs fixing
- `type/documentation` - Documentation improvements

**Priority** (choose one):
- `priority/critical` - P0, blocking issue
- `priority/high` - P1, important but not blocking
- `priority/medium` - P2, should do
- `priority/low` - P3, nice to have

**Category** (choose all that apply):
- `testing` - Test infrastructure or coverage
- `framework` - Framework package publishing
- `performance` - Performance optimization
- `documentation` - Docs, examples, guides
- `infrastructure` - CI/CD, automation
- `architecture` - Architectural improvements

**Special**:
- `automation` - Created by or for automation
- `strategic-planning` - From strategic analysis

## Files in This Directory

### Analysis Documents

1. **[analysis-2026-02-02.md](analysis-2026-02-02.md)**
   - Detailed strategic analysis
   - Repository overview
   - Code quality findings
   - Priority matrix

2. **[strategic-output-2026-02-02.json](strategic-output-2026-02-02.json)**
   - Machine-readable output
   - Metrics summary
   - Opportunities breakdown

### Issue Templates

3. **[STRATEGIC_ISSUES.md](../../STRATEGIC_ISSUES.md)**
   - 12 detailed issue templates
   - Evidence-based recommendations
   - Implementation plans
   - Acceptance criteria

### Executive Summary

4. **[STRATEGIC_SUMMARY_2026-02-02.md](../../STRATEGIC_SUMMARY_2026-02-02.md)**
   - Executive summary
   - Bot health assessment
   - Priority roadmap
   - Next steps

## After Creating Issues

### 1. Link Issues to Project Boards

Add created issues to relevant project boards:
- **Test Infrastructure** → Test coverage issues
- **Framework Development** → Publishing, docs issues
- **Performance** → Metrics, regression issues

### 2. Assign Initial Owners

For high-priority issues, assign owners:
- Metrics collection → Infrastructure team
- Test coverage → QA/Testing lead
- Framework publishing → Package maintainers

### 3. Create Milestones

Group issues by milestone:
- **Q1 2026**: Metrics fix, coverage baseline
- **Q2 2026**: Framework v1.0 publishing
- **Q3 2026**: Documentation, examples

### 4. Track Progress

Use this checklist to track issue creation:

- [ ] Issue #1: Fix Metrics Collection Pipeline
- [ ] Issue #2: Establish Test Coverage Baselines
- [ ] Issue #3: Framework Publishing Roadmap
- [ ] Issue #4: API Documentation Website
- [ ] Issue #5: Architectural Improvements (TODOs)
- [ ] Issue #6: Performance Regression Detection
- [ ] Issue #7: Code Quality Automated Gates
- [ ] Issue #8: Example Projects
- [ ] Issue #9: Migration Guides
- [ ] Issue #10: Cluster Formation Algorithm
- [ ] Issue #11: CI/CD Optimization
- [ ] Issue #12: Video Tutorials

## Next Strategic Planning Run

After fixing metrics collection (Issue #1), the next strategic planning run will have:

✅ Live performance metrics from screeps-mcp  
✅ Grafana monitoring data  
✅ Historical baselines for regression detection  
✅ Evidence-based prioritization  
✅ Automated regression detection  

This will enable much more precise strategic planning with actual bot performance data.

## Questions?

For questions about this analysis:
- Review the [strategic analysis](analysis-2026-02-02.md)
- Check the [executive summary](../../STRATEGIC_SUMMARY_2026-02-02.md)
- Read the [ROADMAP.md](../../ROADMAP.md) for architecture context

---

**Generated**: February 2, 2026  
**Analysis Type**: Code-based (no live metrics)  
**Agent**: Strategic Planning Agent  
**Issues**: 12 ready to create
