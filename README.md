```
████████╗ ██████╗ ██╗  ██╗
╚══██╔══╝██╔═══██╗██║ ██╔╝
   ██║   ██║   ██║█████╔╝
   ██║   ██║   ██║██╔═██╗
   ██║   ╚██████╔╝██║  ██╗
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝

Fast token estimation CLI with cost calculation
Zero dependencies • 85KB • Bring your own pricing
```

## Why TOK?

- **85KB**: Minimal footprint
- **Zero dependencies**: No tiktoken, no heavy libs
- **Fast**: Sub-microsecond estimation
- **Flexible**: Bring your own pricing
- **Simple**: Works immediately

## Install

```bash
npm install -g @light-merlin-dark/tok
```

## Quick Start

```bash
# Estimate tokens
tok estimate "Hello world"
# Output: Tokens: 3

# With cost calculation
tok estimate "Hello world" --model gpt-4o
# Output: Tokens: 3, Cost: $0.000008
```

## Configuration

Set your own pricing ($/M tokens):

```bash
tok price set gpt-4o --input 2.50 --output 10.00
tok price set claude-3-opus -i 15.00 -o 75.00
tok price list
```

Config stored in `~/.tok/config.json`:

```json
{
  "prices": {
    "gpt-4o": { "prompt": 2.50, "completion": 10.00 },
    "claude-3-opus": { "prompt": 15.00, "completion": 75.00 }
  }
}
```

## Accuracy

Tested against OpenAI's tiktoken: ~80% accurate (19.7% avg error). Fast heuristic estimation trades perfect accuracy for zero dependencies and speed. Good for cost budgeting, not exact billing.

```
CharDivEstimator:     chars/4 (fastest)
TiktokenEstimator:    word analysis + punctuation weighting (more accurate)
```

## Cost Tracking

```bash
tok estimate "First prompt" --model gpt-4o --track
tok estimate "Second prompt" --model claude-3-opus --track
tok track summary
# Output: Total: $0.000123 across 2 models
```

## Programmatic Usage

```typescript
import { CharDivEstimator, PriceTable, CostTracker } from '@light-merlin-dark/tok';

const estimator = new CharDivEstimator();
const tokens = estimator.estimate("Your text here"); // 4

const prices = new PriceTable({
  'gpt-4o': { prompt: 2.50, completion: 10.00 }
});

const tracker = new CostTracker();
tracker.add('gpt-4o', tokens, 0, prices.get('gpt-4o'));
console.log(`$${tracker.grandTotal()}`); // $0.00001
```

## License

MIT

---

Built by [@EnchantedRobot](https://x.com/EnchantedRobot)
