# Tok | Token Estimator 🧮

**Lightning-fast token estimation and cost calculation for enterprise LLMs with CLI support.**

Tok provides instant token counting and cost tracking across all major language models with a lean, zero-overhead design. Perfect for developers who need quick, accurate token estimates without heavy dependencies.

## 📝 A Note on Architecture Choices

~~**MCP (Model Context Protocol) Support**~~ - **Intentionally Removed**

While MCP is well-intentioned and excellent for certain use cases, after careful consideration, I've determined that the necessity doesn't exist for this particular tool. The MCP library alone adds approximately 20MB to the package size - for a lightweight token estimation tool, the juice simply isn't worth the squeeze.

Modern AI models are increasingly effective at executing CLI commands swiftly and accurately. In this context, a lean CLI-first approach provides better value than the overhead of MCP integration. The case for MCP must be made on a context-by-context basis - while it can work exceptionally well in certain scenarios, for a focused utility like tok, the traditional CLI approach offers superior efficiency and simplicity.

## 🚀 Why tok?

### Lightning Fast Estimation
- **Sub-microsecond performance** for character-based estimation
- **Smart heuristic algorithms** for accurate token approximation
- **Zero runtime dependencies** for minimal package size
- **Handles MB-scale prompts** without breaking a sweat

### Extensible Provider Support
Comes with built-in support for popular services through our plugin architecture:
- **OpenAI Plugin**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo, and more
- **Anthropic Plugin**: Claude 3 Opus, Sonnet, Haiku, and newer models
- **OpenRouter Plugin**: Access to 100+ models through a unified API
- **Custom Providers**: Create your own plugin for any LLM service and submit a PR

The plugin architecture makes it easy to add support for new providers while maintaining consistent token estimation and cost tracking across all models.

### CLI-First Design (by Choice)
Deliberately designed as a CLI-first tool for:
- Instant token estimation for any text
- Cost tracking across multiple LLM calls
- Real-time pricing information access
- Programmatic cost budget management
- Simple integration into any workflow

## 📦 Installation

```bash
# Install globally via npm
npm install -g @light-merlin-dark/tok

# Or use directly with npx
npx @light-merlin-dark/tok estimate "your text here"
```

### Prerequisites
- Node.js 18.0.0 or higher

## 🚀 Quick Start

### CLI Usage

#### Basic Token Estimation
```bash
# Estimate tokens for text
tok estimate "Hello world"

# Estimate with specific model pricing
tok estimate "Your prompt here" --model gpt-4o

# Read from file
tok estimate prompt.txt --file
```

#### Cost Tracking
```bash
# Start tracking costs
tok estimate "First prompt" --model gpt-4o --track
tok estimate "Second prompt" --model claude-3-opus --track
tok estimate "Third prompt" --model llama-3-70b --track

# View cost summary
tok track summary

# Reset tracking
tok track reset
```

#### Price Management
```bash
# List all model prices
tok price list

# Update model pricing
tok price set gpt-4-turbo --prompt 10 --completion 30

# View as JSON
tok price list --format json
```

### Programmatic Usage

```javascript
import {
  CharDivEstimator,
  TiktokenEstimator,
  PriceTable,
  CostTracker,
  CostCalculator
} from '@light-merlin-dark/tok';

// Fast estimation
const estimator = new CharDivEstimator();
const tokens = estimator.estimate("Your text here");

// Advanced estimation with heuristics
const advancedEstimator = new TiktokenEstimator();
await advancedEstimator.initialize();
const preciseTokens = advancedEstimator.estimate("Your text here");

// Cost tracking
const prices = new PriceTable();
const tracker = new CostTracker();

const price = prices.get('gpt-4o');
tracker.add('gpt-4o', tokens, 0, price);

console.log(`Total cost: $${tracker.grandTotal()}`);
```

## ✨ Key Features

### 🎯 Smart Estimation Algorithms
- **Fast mode** (CharDivEstimator): Simple character-based estimation at ~chars/4
- **Advanced mode** (TiktokenEstimator): Heuristic-based estimation with word analysis, punctuation weighting, and smart averaging

### 💰 Comprehensive Cost Tracking
- Real-time cost aggregation across models
- Separate prompt vs completion pricing
- Session-based tracking with duration
- Export data as JSON for analysis

### 🛠️ Flexible Configuration
- Customizable model pricing
- Persistent configuration in `~/.tok/`
- Environment-based overrides
- JSON export/import support

### 📊 Rich Output Formats
- **Human-readable**: Colored terminal output
- **JSON**: Machine-parsable data
- **Table**: Quick visual scanning

## ⚙️ Configuration

Configuration is stored in `~/.tok/config.json`:

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

## 📊 Default Pricing

Prices are per million tokens ($/M):

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

## 🧮 How It Works

### Token Estimation Algorithms

**Fast Estimation (CharDivEstimator)**
```typescript
tokens = Math.ceil(text.length / 4)
```

**Advanced Heuristic Estimation (TiktokenEstimator)**
```typescript
// Analyzes text structure for better accuracy
// - Word count with multiplier
// - Punctuation and special character weighting
// - Number and uppercase letter considerations
// - Averages multiple estimation methods
```

### Cost Calculation
```typescript
cost = (tokens / 1_000_000) * price_per_million
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/light-merlin-dark/tok.git
cd tok

# Install dependencies
make install

# Run in development mode
make dev

# Run tests
make test

# Build for production
make build
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## 📝 API Usage

```typescript
import {
  CharDivEstimator,
  TiktokenEstimator,
  PriceTable,
  CostTracker,
  CostCalculator
} from '@light-merlin-dark/tok';

// Fast estimation
const estimator = new CharDivEstimator();
const tokens = estimator.estimate("Your text here");

// Advanced estimation
const advancedEstimator = new TiktokenEstimator();
await advancedEstimator.initialize();
const preciseTokens = advancedEstimator.estimate("Your text here");

// Cost tracking
const prices = new PriceTable();
const tracker = new CostTracker();

const price = prices.get('gpt-4o');
tracker.add('gpt-4o', tokens, 0, price);

console.log(`Total cost: $${tracker.grandTotal()}`);
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [@EnchantedRobot](https://x.com/EnchantedRobot)