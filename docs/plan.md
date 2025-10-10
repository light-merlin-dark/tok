# Tok - Development Plan

## 📋 HOW TO USE THIS PLAN

**For Claude in new context windows:**
1. Read this plan document first to understand current state
2. Check "CRITICAL ISSUES" section for known bugs
3. Review "NEXT ACTIONS" for priority work
4. Reference "KEY INFORMATION" for technical details
5. Run `bun test` to verify tests passing (should be 54/54)
6. Use `make build` to build the project

**Project Location:** `/Users/merlin/_dev/tok`

---

## 🎯 PROJECT OVERVIEW

**Tok** - Fast token estimation CLI with cost calculation for LLMs

- **Package**: `@light-merlin-dark/tok`
- **Published Version**: 0.2.1 on npm
- **Repository**: github.com/light-merlin-dark/tok (public)
- **Status**: ✅ All critical issues fixed! Ready for 0.2.2 release

**Core Features:**
- Token estimation (char-based, ~80% accurate)
- Cost calculation with custom pricing
- Cost tracking across sessions
- CLI with `--input`/`--output` flags (standardized)
- Programmatic API for library usage

---

## ✅ COMPLETED (Oct 9, 2025 Session)

### Fixed: Cost Tracking & Price Persistence
**Root cause**: Tracker was in-memory only, lost between CLI invocations

**Solution implemented:**
1. Added file persistence to `~/.tok/tracking.json`
2. Tracker now saves/loads state between commands
3. Price list now loads custom prices from config

**Files modified:**
- `src/cli/utils/tracker.ts` - Added persistence layer
- `src/cli/commands/estimate.ts` - Calls persistTracker() after tracking
- `src/cli/commands/price.ts` - Loads custom prices in price list command
- `scripts/sanity-check.ts` - Fixed async handling with IIFE wrapper

**Test results:**
- ✅ Unit tests: 54/54 passing
- ✅ Sanity checks: 23/23 passing (was 19/23)
- ✅ All README examples now work

---

## 🎯 NEXT ACTIONS (Priority Order)

### 1. Update CHANGELOG and Release (READY)
**Goal**: Publish bug fixes as version 0.2.2

**Steps:**
1. Update `CHANGELOG.md` with:
   - Fixed cost tracking persistence
   - Fixed price list not showing custom prices
   - Fixed sanity check async handling
2. Run `make release` (builds, tests, versions, publishes)
3. Test published package: `npx @light-merlin-dark/tok@latest estimate "test"`
4. Update plan.md to reflect new published version

### 2. Optional: Documentation Improvements
**Goal**: Clarify usage patterns

**Possible additions:**
- Add section on cost tracking persistence
- Document `~/.tok/` directory structure
- Add troubleshooting section for common issues

### 3. Optional: TiktokenEstimator Async Init
**Goal**: Document or simplify async initialization

**Options:**
- Add clear documentation about `await estimator.initialize()`
- Or: Make initialization automatic in `estimate()` method
- Low priority - this is working as designed

---

## 🔧 KEY INFORMATION

### Project Structure
```
/Users/merlin/_dev/tok/
├── src/
│   ├── cli/
│   │   ├── commands/
│   │   │   ├── estimate.ts
│   │   │   ├── price.ts     # --input/--output flags
│   │   │   ├── track.ts     # ✅ FIXED
│   │   │   └── config.ts
│   │   ├── utils/
│   │   │   ├── tracker.ts   # ✅ FIXED - now persists to file
│   │   │   └── config.ts
│   │   ├── router.ts        # Fixed short flag parsing
│   │   └── main.ts
│   ├── estimators/
│   │   ├── CharDivEstimator.ts
│   │   └── TiktokenEstimator.ts
│   ├── pricing/
│   │   └── PriceTable.ts
│   ├── CostCalculator.ts
│   ├── CostTracker.ts
│   └── index.ts             # Public API
├── tests/                   # Flattened structure
│   ├── cli-commands.test.ts
│   ├── cli-integration.test.ts
│   ├── estimators.test.ts
│   ├── pricing.test.ts
│   └── tracker.test.ts
├── scripts/
│   └── sanity-check.ts      # Not in git, validates README
├── dist/                    # Build output
│   └── cli/main.js          # Entry point
└── Makefile
```

### Test Status
- **Unit tests**: 54/54 passing (`bun test`)
- **Sanity checks**: 23/23 passing (`npx tsx scripts/sanity-check.ts`)
- **Build**: Working (`npm run build`)

### CLI Flags (Standardized Oct 9, 2025)
**Primary:** `--input/-i` and `--output/-o` for pricing
**Legacy:** `--prompt/-p` and `--completion/-c` (backward compatible)

**Examples:**
```bash
tok price set gpt-4o --input 2.50 --output 10.00   # New style
tok price set gpt-4o -i 2.50 -o 10.00              # Shortcuts
tok price set gpt-4o --prompt 2.50 --completion 10 # Legacy (still works)
```

### Build & Test Commands
```bash
# Development
npm run build          # Compile TypeScript
bun test              # Run unit tests (54 tests)
make dev              # Watch mode

# Validation
npx tsx scripts/sanity-check.ts  # End-to-end validation (23 checks)

# Release
make release          # Build, test, version, publish to npm
```

### Configuration
- **Config file**: `~/.tok/config.json`
- **Tracking file**: `~/.tok/tracking.json` (persists between CLI invocations)
- **Default prices**: Built into `src/pricing/PriceTable.ts`
- **Custom prices**: Saved to config file ✅ Working

---

## 📚 REFERENCE MATERIALS

### README Promises (Must All Work)
From `/Users/merlin/_dev/tok/README.md`:

1. **Basic estimation**: `tok estimate "Hello world"` → `Tokens: 3`
2. **Cost calculation**: `tok estimate "Hello world" --model gpt-4o` → Shows cost
3. **Price config**: `tok price set gpt-4o --input 2.50 --output 10.00` → Persists
4. **Cost tracking**: `tok estimate "x" --track` + `tok track summary` → Shows total ✅ Working
5. **Programmatic API**: Import and use `CharDivEstimator`, `PriceTable`, `CostTracker`

### Key Technical Details
- **Accuracy**: 19.7% avg error vs tiktoken (acceptable for budgeting)
- **Package size**: 85KB JavaScript
- **Dependencies**: Zero runtime deps (tiktoken optional)
- **Testing**: Bun test (migrated from vitest)
- **CLI router**: Custom implementation (no Commander.js)

### Development Context
- **Last published**: 0.2.1 on Oct 9, 2025
- **Current version**: 0.2.2 (ready to publish)
- **Session completed**: Oct 9, 2025
  - ✅ Fixed cost tracking persistence
  - ✅ Fixed price list showing custom prices
  - ✅ Fixed sanity check async handling
  - ✅ All 23/23 sanity checks passing
  - ✅ All 54/54 unit tests passing

---

## 🎬 QUICK START FOR NEW CLAUDE

1. **Verify current state:**
   ```bash
   cd /Users/merlin/_dev/tok
   bun test                           # Should see 54/54 pass
   npm run build                      # Should compile
   npx tsx scripts/sanity-check.ts    # Should see 23/23 pass
   ```

2. **Current status:**
   - ✅ All critical bugs fixed
   - ✅ Cost tracking working with persistence
   - ✅ Price management fully functional
   - 🎯 Ready for 0.2.2 release

3. **Next steps:**
   - Update CHANGELOG.md
   - Run `make release`
   - Verify published package

---

## 📝 NOTES

- **docs/** folder is in `.gitignore` (local planning only)
- **scripts/** folder is in `.gitignore` (sanity-check.ts not committed)
- Plan is for Claude's reference, not version controlled
- Focus on making README examples work, not adding features
