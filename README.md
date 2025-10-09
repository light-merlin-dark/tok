<div align="center">
  <img src="https://raw.githubusercontent.com/light-merlin-dark/tok/main/assets/tok.png" alt="tok" width="200">
</div>

# tok

Fast token estimation CLI with cost calculation. Zero dependencies, 85KB.

## Accuracy

Tested against OpenAI's tiktoken (cl100k_base encoding) across diverse text samples:

- **Average error: 19.7%** - Suitable for cost estimation and budgeting
- **Best case: 0% error** - Simple texts match exactly
- **Worst case: 52% error** - Complex JSON/code structures
- **Median error: 21.6%**

Our heuristic approach analyzes word count, punctuation, numbers, and character patterns to estimate tokens without heavy dependencies. Perfect for quick cost estimates, not for exact API billing.

**Trade-off:** Fast, zero-dependency estimation vs. 100% accuracy requiring tiktoken library.

## Quick Start

```bash
# Install globally
npm install -g @light-merlin-dark/tok

# Estimate tokens
tok estimate "Hello world"
# Output:
# Tokens: 3
# Text length: 11 characters

# Estimate with cost
tok estimate "Hello world" --model gpt-4o
# Output:
# Tokens: 3
# Model: gpt-4o
# Prompt cost: $0.000008
# Completion cost: $0.000030

# Read from file
tok estimate prompt.txt --file

# Track costs across multiple calls
tok estimate "First prompt" --model gpt-4o --track
tok estimate "Second prompt" --model claude-3-opus --track
tok track summary
# Output:
# Total cost: $0.000123
# Total tokens: 45 prompt, 0 completion
# Models: gpt-4o, claude-3-opus
```

## Programmatic Usage

```typescript
import { CharDivEstimator, TiktokenEstimator, PriceTable, CostTracker } from '@light-merlin-dark/tok';

// Fast estimation (chars/4)
const estimator = new CharDivEstimator();
const tokens = estimator.estimate("Your text here");
console.log(tokens); // 4

// Advanced heuristic estimation
const advanced = new TiktokenEstimator();
await advanced.initialize();
const preciseTokens = advanced.estimate("Your text here");
console.log(preciseTokens); // 4

// Cost tracking
const prices = new PriceTable();
const tracker = new CostTracker();
const price = prices.get('gpt-4o');

tracker.add('gpt-4o', tokens, 0, price);
console.log(`Total cost: $${tracker.grandTotal()}`); // $0.00001
```

## CLI Commands

```bash
# Token estimation
tok estimate <text>                    # Estimate tokens for text
tok estimate <file> --file             # Estimate tokens from file
tok estimate <text> --model <model>    # Include cost calculation

# Cost tracking
tok track summary                      # View tracked costs
tok track reset                        # Reset tracking

# Pricing
tok price list                         # List all model prices
tok price list --format json           # Output as JSON
tok price set <model> --prompt <n> --completion <n>  # Set custom price

# Configuration
tok config                             # Show config location
```

## Default Pricing

Prices per million tokens ($/M):

| Model | Prompt | Completion |
|-------|--------|------------|
| gpt-4o | $2.50 | $10.00 |
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-4-turbo | $10.00 | $30.00 |
| claude-3-opus | $15.00 | $75.00 |
| claude-3-sonnet | $3.00 | $15.00 |
| claude-3-haiku | $0.25 | $1.25 |
| llama-3-70b | $0.80 | $1.20 |
| llama-3-8b | $0.20 | $0.30 |

## How It Works

**CharDivEstimator** (fastest):
```
tokens ≈ Math.ceil(text.length / 4)
```

**TiktokenEstimator** (more accurate):
- Counts words with 1.3x multiplier
- Weights punctuation (0.3x per character)
- Considers numbers (0.5x per occurrence)
- Factors in uppercase letters (0.1x each)
- Averages character-based estimate (chars / 3.5)

**Cost Calculation**:
```
cost = (tokens / 1_000_000) × price_per_million
```

## Why tok?

- **Lightweight**: 85KB total, zero runtime dependencies
- **Fast**: Sub-microsecond character-based estimation
- **Accurate enough**: ~80% accuracy for cost budgeting
- **Simple**: Works out of the box, no configuration needed
- **Flexible**: CLI for humans, API for code

## Configuration

Config stored in `~/.tok/config.json`:

```json
{
  "prices": {
    "custom-model": {
      "prompt": 5.00,
      "completion": 15.00
    }
  }
}
```

## Development

```bash
# Clone and install
git clone https://github.com/light-merlin-dark/tok.git
cd tok
make install

# Run tests
make test

# Build
make build

# Development mode
make dev
```

## License

MIT

---

Built by [@EnchantedRobot](https://x.com/EnchantedRobot)
