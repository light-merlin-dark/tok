# Tok 🧮

**Fast token estimation and cost calculation for enterprise LLMs with CLI and MCP support.**

Built from the ground up for seamless integration with Claude Code, Claude Desktop, and other AI tools that support MCP. tok provides instant token counting and cost tracking across all major language models with a lean, zero-overhead design.

## 🚀 Why tok?

### Lightning Fast Estimation
- **Sub-microsecond performance** for character-based estimation
- **Optional exact counting** with tiktoken when precision matters
- **Zero runtime dependencies** (except optional tiktoken)
- **Handles MB-scale prompts** without breaking a sweat

### Universal LLM Support
Pre-configured pricing for all major models:
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3 Opus, Sonnet, Haiku
- **Meta**: Llama 3 70B, 8B
- **Mistral**: Mixtral 8x7B
- **Custom models**: Add your own pricing

### Native MCP Integration
First-class Model Context Protocol support means AI agents can:
- Estimate tokens for any text instantly
- Track costs across multiple LLM calls
- Access real-time pricing information
- Manage cost budgets programmatically

## 🔌 Model Context Protocol (MCP) Setup

### Quick Start with Claude Code
```bash
# Install globally
npm install -g @light-merlin-dark/tok

# Add to Claude Code
claude mcp add-json tok '{
  "type":"stdio",
  "command":"tok-mcp",
  "env":{"NODE_NO_WARNINGS":"1"}
}'
```

### Available MCP Tools
- `estimate_tokens` - Estimate token count and cost for any text
- `get_cost_summary` - View aggregated cost tracking data
- `list_models` - List all available models and pricing
- `set_model_price` - Configure custom model pricing
- `reset_tracker` - Reset cost tracking session

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

# Use exact token counting (requires tiktoken)
tok estimate "Precise count needed" --exact

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

### MCP Usage in AI Agents

Once configured, AI agents can use commands like:

```javascript
// Estimate tokens
await estimate_tokens({
  text: "Long prompt text here...",
  model: "gpt-4o",
  exact: true,
  track: true
});

// Check costs
await get_cost_summary();

// List available models
await list_models();
```

## ✨ Key Features

### 🎯 Dual Estimation Modes
- **Fast mode** (default): Character-based estimation at ~chars/4
- **Exact mode**: Tiktoken-based counting for precise limits

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

### Token Estimation Algorithm
```typescript
// Fast estimation (default)
tokens = Math.ceil(text.length / 4)

// Exact counting (with tiktoken)
tokens = tiktoken.encode(text).length
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
  PriceTable,
  CostTracker,
  CostCalculator
} from '@light-merlin-dark/tok';

// Fast estimation
const estimator = new CharDivEstimator();
const tokens = estimator.estimate("Your text here");

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

Built with ❤️ by [@EnchantedRobot](https://twitter.com/EnchantedRobot)
