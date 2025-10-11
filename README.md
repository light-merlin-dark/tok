```
████████╗ ██████╗ ██╗  ██╗
╚══██╔══╝██╔═══██╗██║ ██╔╝
   ██║   ██║   ██║█████╔╝
   ██║   ██║   ██║██╔═██╗
   ██║   ╚██████╔╝██║  ██╗
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝

Blazingly fast token estimation and cost calculation for LLMs
NPM package & CLI • Zero deps • 85KB
```

## Why TOK?

- **85KB**: Minimal footprint
- **Zero dependencies**: No tiktoken, no heavy libs
- **Fast**: Sub-microsecond estimation
- **Flexible**: Bring your own pricing
- **Simple**: Works immediately

## Install

```bash
# As a package (recommended)
npm install @light-merlin-dark/tok

# Or globally for CLI
npm install -g @light-merlin-dark/tok
```

## Quick Start

**TypeScript/JavaScript:**

```typescript
import { CharDivEstimator, PriceTable, CostCalculator } from '@light-merlin-dark/tok';

// Estimate tokens
const estimator = new CharDivEstimator();
const tokens = estimator.estimate("Hello world"); // 3

// Calculate cost
const prices = new PriceTable();
const cost = CostCalculator.cost(tokens, prices.get('gpt-4o').prompt);
console.log(CostCalculator.formatCost(cost)); // $0.0000075
```

**CLI:**

```bash
# Estimate tokens
tok estimate "Hello world"
# Output: Tokens: 3

# With cost calculation
tok estimate "Hello world" --model gpt-4o
# Output: Tokens: 3, Cost: $0.0000075
```

## Bring Your Own Pricing

**In code:**

```typescript
const prices = new PriceTable({
  'gpt-4o': { prompt: 2.50, completion: 10.00 },
  'claude-3-opus': { prompt: 15.00, completion: 75.00 }
});

const cost = CostCalculator.cost(tokens, prices.get('gpt-4o').prompt);
```

**Via CLI:**

```bash
tok price set gpt-4o --input 2.50 --output 10.00
tok price set claude-3-opus -i 15.00 -o 75.00
tok price list
```

CLI config stored in `~/.tok/config.json`

## Accuracy

Tested against OpenAI's tiktoken: ~80% accurate (19.7% avg error). Fast heuristic estimation trades perfect accuracy for zero dependencies and speed. Good for cost budgeting, not exact billing.

```
CharDivEstimator:     chars/4 (fastest)
TiktokenEstimator:    word analysis + punctuation weighting (more accurate)
```

## Cost Tracking

**In code:**

```typescript
import { CostTracker, PriceTable } from '@light-merlin-dark/tok';

const tracker = new CostTracker();
const prices = new PriceTable();

// Track multiple requests
tracker.add('gpt-4o', 100, 50, prices.get('gpt-4o'));
tracker.add('claude-3-opus', 200, 100, prices.get('claude-3-opus'));

// Get totals
console.log(`Total: $${tracker.grandTotal().toFixed(6)}`);
console.log(`Duration: ${tracker.getDuration()}s`);

// Get detailed summary
const summary = tracker.getSummary();
console.log(summary.modelBreakdown);
```

**Via CLI:**

```bash
tok estimate "First prompt" --model gpt-4o --track
tok estimate "Second prompt" --model claude-3-opus --track
tok track summary
# Output: Total: $0.000123 across 2 models
```

## License

MIT

---

Built by [@EnchantedRobot](https://x.com/EnchantedRobot)
