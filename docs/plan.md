# Tok - Token Estimator Project Plan

## Overall Goal
Create an open source token estimator called **`tok`** that works as both a CLI tool and MCP service for AI agents. Fast token estimation and cost calculation for all enterprise LLMs with zero-overhead design.

## High-Level Architecture
- **Core Library**: Token estimation (fast char-based & optional exact tiktoken), pricing tables, cost tracking
- **CLI Interface**: Command-line tool for direct usage with rich formatting
- **MCP Server**: AI agent integration following Model Context Protocol
- **Plugin System**: Optional - for extending with provider-specific features

## Key Features
1. **Token Estimation**
   - Fast character-based estimation (chars/4)
   - Optional exact tiktoken estimation for precision
   - Model-specific divisor support

2. **Cost Calculation**
   - Per-model pricing configuration
   - Prompt vs completion token differentiation
   - Real-time cost tracking and aggregation

3. **Dual Interface**
   - CLI: `token-estimator estimate "text" --model gpt-4`
   - MCP: AI agents can use via `estimate_tokens` tool

## Project Structure (from response.md)
```
token-estimator/
├─ src/
│  ├─ estimators/
│  │   ├─ TokenEstimator.ts        // interface
│  │   ├─ CharDivEstimator.ts      // ultra-fast ≈chars/4
│  │   └─ TiktokenEstimator.ts     // optional, exact
│  ├─ pricing/
│  │   └─ PriceTable.ts            // $/M prompt & completion
│  ├─ CostCalculator.ts            // static helpers
│  ├─ CostTracker.ts               // per-process aggregator
│  ├─ cli/
│  │   └─ index.ts                 // CLI entry point
│  ├─ mcp-server.ts                // MCP server
│  └─ index.ts                     // public barrel
├─ scripts/
│  ├─ smart-version.ts
│  └─ post-validation.ts
├─ tests/
├─ Makefile
├─ package.json
└─ tsconfig.json
```

## Detailed To-Do List

### 1. Project Scaffolding (→ open-source-cli-blueprint.md)
- [ ] Initialize npm project with @light-merlin-dark scope
- [ ] Create Makefile with standard targets
- [ ] Set up TypeScript configuration
- [ ] Configure vitest for testing
- [ ] Create directory structure
- [ ] Add .gitignore, LICENSE (MIT)
- [ ] Set up ESLint configuration

### 2. Core Library Implementation (→ response.md Section 2)
- [ ] Create TokenEstimator interface
- [ ] Implement CharDivEstimator (fast estimation)
- [ ] Implement TiktokenEstimator (exact, optional)
- [ ] Create PriceTable class with model pricing
- [ ] Implement CostCalculator static methods
- [ ] Build CostTracker for aggregation
- [ ] Create barrel export in index.ts

### 3. CLI Interface (→ open-source-cli-blueprint.md + response.md Section 3)
- [ ] Set up commander.js for CLI parsing
- [ ] Implement estimate command
- [ ] Add cost tracking commands
- [ ] Create price management commands
- [ ] Add configuration management
- [ ] Implement output formatting (JSON, table, human)

### 4. MCP Server Implementation (→ mcp-blueprint.md)
- [ ] Create mcp-server.ts entry point
- [ ] Define tool schemas with zod
- [ ] Implement estimate_tokens tool
- [ ] Add get_cost_summary tool
- [ ] Implement price configuration tools
- [ ] Add safety validations
- [ ] Create dynamic tool descriptions

### 5. Testing Infrastructure (→ open-source-cli-blueprint.md)
- [ ] Set up vitest configuration
- [ ] Write unit tests for estimators
- [ ] Test pricing calculations
- [ ] Test CLI commands
- [ ] Create MCP integration tests
- [ ] Add test utilities and mocks

### 6. Documentation (→ readme-blueprint.md)
- [ ] Create README.md with installation instructions
- [ ] Document CLI usage and examples
- [ ] Add MCP setup instructions for Claude Code
- [ ] Include API documentation
- [ ] Add CHANGELOG.md
- [ ] Create examples directory

### 7. Release Automation (→ open-source-cli-blueprint.md)
- [ ] Implement smart-version.ts script
- [ ] Create post-validation.ts script
- [ ] Configure npm publishing in Makefile
- [ ] Set up GitHub Actions (optional)
- [ ] Test release process

## Special Commands & Deployment

### Key Make Commands
```bash
make install    # Install dependencies
make build      # Build TypeScript
make test       # Run tests
make dev        # Development mode
make push       # Prepare release (lint, test, version, git)
make release    # Full release (push + npm publish + validate)
```

### MCP Installation for Users
```bash
# Install globally
npm install -g @light-merlin-dark/token-estimator

# Add to Claude Code
claude mcp add-json token-estimator '{
  "type":"stdio",
  "command":"token-estimator-mcp",
  "env":{"NODE_NO_WARNINGS":"1"}
}'
```

### Environment Setup
- NPM_ACCESS_TOKEN already in .env for publishing
- No runtime dependencies except optional @dqbd/tiktoken

## Configuration & Pricing

### Default Model Pricing ($/M tokens)
```typescript
{
  "gpt-4o": { prompt: 2.50, completion: 10.00 },
  "gpt-4o-mini": { prompt: 0.15, completion: 0.60 },
  "claude-3-opus": { prompt: 15.00, completion: 75.00 },
  "claude-3-sonnet": { prompt: 3.00, completion: 15.00 },
  "claude-3-haiku": { prompt: 0.25, completion: 1.25 },
  "llama-3-70b": { prompt: 0.80, completion: 1.20 }
}
```

### CLI Examples
```bash
# Estimate tokens
token-estimator estimate "Hello world" --model gpt-4o

# Track costs for a session
token-estimator track --start
token-estimator estimate "prompt" --model gpt-4o --track
token-estimator track --summary

# Configure pricing
token-estimator price set gpt-4-turbo --prompt 10 --completion 30
token-estimator price list
```

## Architecture Decisions

1. **Lean Core**: No runtime deps except optional tiktoken
2. **Fast by Default**: Char-based estimation, exact only when needed
3. **Plugin-Ready**: Architecture supports future provider plugins
4. **MCP-First**: Built for AI agent integration from the start
5. **Type-Safe**: Full TypeScript with strict mode
6. **Zero Config**: Works out of the box with sensible defaults

## Development Workflow

1. Use `make dev` for development
2. Run `make test` before commits
3. Use `make push` to prepare releases
4. Run `make release` for npm publishing
5. Check post-validation output

## Key Files to Reference
- `/docs/response.md` - Core library implementation details
- `/docs/blueprints/mcp-blueprint.md` - MCP server patterns
- `/docs/blueprints/open-source-cli-blueprint.md` - Project structure & automation
- `/docs/blueprints/readme-blueprint.md` - Documentation style guide

## Current Status (October 2025)
✅ Core implementation complete
✅ CLI with custom router (no Commander.js)
✅ MCP server intentionally removed (lean package focus)
✅ All tests passing (52 tests with bun test)
✅ Package rebranded to `tok`
✅ Accuracy testing completed (19.7% avg error - acceptable)
✅ Migrated from vitest to bun test
✅ README optimized - removed emojis, lead with banner, bring-your-own-pricing
✅ GitHub description updated
✅ Published to npm as @light-merlin-dark/tok@0.2.1
✅ ASCII banner with TOK branding

## Completed Recent Tasks

### 1. README Optimization
- [x] Run accuracy diagnostic (19.7% avg error acceptable)
- [x] Remove all emojis from README
- [x] Lead with package size (85KB JS)
- [x] Present accuracy data clearly with trade-offs
- [x] Focus on high-signal value proposition
- [x] Simplify and clarify developer value
- [x] Remove unstable pricing table
- [x] Lead with bring-your-own-pricing configuration
- [x] Create ASCII banner with TOK branding

### 2. Testing Infrastructure
- [x] Migrate from vitest to bun test
- [x] Update all test imports to bun:test
- [x] Remove vitest dependency
- [x] Fix type exports (TokenEstimator, ModelPrice, ModelTotals)
- [x] All 52 tests passing

### 3. Code Cleanup
- [x] Add .source-hash to .gitignore
- [x] Add logs/ to .gitignore
- [x] Update CHANGELOG.md with changes

### 4. Repository Updates
- [x] Update GitHub project description (high signal)
- [x] Description: "Fast token estimation CLI with cost calculation. Zero dependencies, 85KB."

### 5. Release
- [x] Run make release
- [x] Published version 0.2.1

## Key Commands After Rebrand
```bash
# CLI usage
tok estimate "Hello world"
tok price list
tok track summary

# MCP setup
claude mcp add-json tok '{
  "type":"stdio",
  "command":"tok-mcp",
  "env":{"NODE_NO_WARNINGS":"1"}
}'
```

## Success Criteria
- [x] Rebrand complete - all references updated
- [x] Tests passing with new name
- [x] Published to npm as @light-merlin-dark/tok
- [x] GitHub repository public
- [x] MCP integration intentionally removed (lean focus)

---

## NEXT SESSION: Functional Sanity Check & Test Organization

### Context
Current test structure has nested folders (tests/unit/, tests/integration/) that may be over-organized for the scope. Need to do a comprehensive sanity check to ensure everything works as expected in real usage scenarios.

### Current Test Structure
```
tests/
├── integration/
│   └── cli.test.ts
├── unit/
│   ├── estimators.test.ts
│   ├── pricing.test.ts
│   ├── cli-commands.test.ts
│   └── tracker.test.ts
└── setup.ts
```

### Goals for Next Session
1. **Reorganize test structure** - Flatten hierarchy for simplicity
2. **Create sanity check script** - Real-world usage validation
3. **Functional validation** - Ensure CLI, API, and core features work end-to-end

### Tasks

#### 1. Test Structure Reorganization
- [ ] Analyze current test organization (integration vs unit folders)
- [ ] Decide on flattened structure (all tests at top level)
- [ ] Move all test files to `tests/` root level with clear naming
  - `tests/estimators.test.ts`
  - `tests/pricing.test.ts`
  - `tests/cli-commands.test.ts`
  - `tests/cli-integration.test.ts`
  - `tests/tracker.test.ts`
  - `tests/setup.ts`
- [ ] Update any import paths if needed
- [ ] Run `bun test` to verify all tests still pass
- [ ] Remove empty `integration/` and `unit/` directories

#### 2. Create Sanity Check Script
Create `scripts/sanity-check.ts` that validates:
- [ ] **CLI Installation**: Build and verify binary works
- [ ] **Basic Estimation**: `tok estimate "test text"`
- [ ] **Cost Calculation**: `tok estimate "test" --model gpt-4o`
- [ ] **Pricing Commands**:
  - `tok price list` returns valid data
  - `tok price set custom-model --prompt 5 --completion 10`
  - Verify custom price persists in config
- [ ] **Cost Tracking**:
  - `tok estimate "test" --track`
  - `tok track summary` shows tracked data
  - `tok track reset` clears data
- [ ] **File Input**: `tok estimate test.txt --file`
- [ ] **JSON Output**: `tok estimate "test" --format json` returns valid JSON
- [ ] **Config Management**: Verify `~/.tok/config.json` works
- [ ] **Programmatic API**:
  - Import and use CharDivEstimator
  - Import and use TiktokenEstimator
  - Import and use PriceTable
  - Import and use CostTracker

#### 3. Script Implementation Details
```typescript
// scripts/sanity-check.ts structure
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// 1. Build check
// 2. CLI execution checks
// 3. Config file checks
// 4. API usage checks
// 5. Report results with pass/fail counts
```

#### 4. Validation & Documentation
- [ ] Run sanity check script and document results
- [ ] Identify any issues or edge cases
- [ ] Fix any discovered problems
- [ ] Update README if needed based on findings
- [ ] Commit all changes with clear messages

### Expected Outcomes
1. **Cleaner test structure** - All tests at top level, easier to navigate
2. **Confidence in functionality** - Comprehensive sanity check validates real usage
3. **Automated validation** - Script can be run before releases
4. **Clear documentation** - Any issues discovered are documented and fixed

### Commands to Run
```bash
# After reorganizing tests
bun test

# Run sanity check
npx tsx scripts/sanity-check.ts

# If all good, commit
git add -A
git commit -m "refactor: Flatten test structure and add sanity check script"
git push origin main
```

### Success Criteria for Next Session
- [ ] All tests still passing after reorganization
- [ ] Sanity check script created and passing
- [ ] Any discovered issues fixed
- [ ] Confidence in package functionality for end users