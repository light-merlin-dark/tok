import { createCommand, CommandResult } from '../shared/core';
import { logger, formatJson, formatTable } from '../common';
import { ErrorCode, createCommandError } from '../shared/errors';
import { PriceTable } from '../../index';
import { getConfig, saveConfig } from '../utils/config';

// Shared price table instance
const prices = new PriceTable();

interface PriceListOptions {
  format?: 'json' | 'table' | 'human';
}

export const priceListCommand = createCommand({
  description: 'List all model prices',
  help: `
Usage: tok price list [options]

Description:
  Lists all available model prices per million tokens.

Options:
  --format <format>     Output format: json, table, human (default: human)

Examples:
  tok price list
  tok price list --format json
  tok price list --format table
`,
  options: [
    {
      flag: 'format',
      description: 'Output format',
      type: 'string',
      default: 'human'
    }
  ],

  async execute(args, options): Promise<CommandResult> {
    const opts = options as PriceListOptions;
    const allPrices = prices.list();

    if (opts.format === 'json') {
      const output: Record<string, any> = {};
      allPrices.forEach((price, model) => {
        output[model] = price;
      });
      formatJson(output);
    } else if (opts.format === 'table') {
      const rows = Array.from(allPrices.entries()).map(([model, price]) => ({
        model,
        prompt: `$${price.prompt}/M`,
        completion: `$${price.completion}/M`
      }));
      formatTable(rows);
    } else {
      logger.info('Model Pricing (per million tokens)');
      console.log('─'.repeat(50));
      allPrices.forEach((price, model) => {
        console.log(
          `${model.padEnd(20)} Prompt: $${price.prompt.toString().padEnd(6)} | Completion: $${price.completion}`
        );
      });
      console.log('');
    }

    return { success: true };
  }
});

interface PriceSetOptions {
  input?: string;
  i?: string;
  output?: string;
  o?: string;
  // Backward compatibility
  prompt?: string;
  p?: string;
  completion?: string;
  c?: string;
}

export const priceSetCommand = createCommand({
  description: 'Set price for a model',
  help: `
Usage: tok price set <model> [options]

Description:
  Sets custom pricing for a model. Prices are per million tokens.

Arguments:
  model                 Model name to set pricing for

Options:
  -i, --input <price>       Input token price per million tokens
  -o, --output <price>      Output token price per million tokens
  -p, --prompt <price>      Alias for --input (deprecated)
  -c, --completion <price>  Alias for --output (deprecated)

Examples:
  tok price set gpt-4-turbo --input 10 --output 30
  tok price set custom-model -i 5.00 -o 15.00
`,
  arguments: [
    {
      name: 'model',
      description: 'Model name',
      required: true
    }
  ],
  options: [
    {
      flag: 'i|input',
      description: 'Input token price per million tokens',
      type: 'string'
    },
    {
      flag: 'o|output',
      description: 'Output token price per million tokens',
      type: 'string'
    },
    {
      flag: 'p|prompt',
      description: 'Alias for --input (deprecated)',
      type: 'string'
    },
    {
      flag: 'c|completion',
      description: 'Alias for --output (deprecated)',
      type: 'string'
    }
  ],

  async execute(args, options): Promise<CommandResult> {
    const opts = options as PriceSetOptions;
    const model = args[0];

    if (!model) {
      throw createCommandError(
        ErrorCode.INVALID_ARGUMENT,
        'Please provide a model name'
      );
    }

    // Support both new flags (input/output) and legacy flags (prompt/completion)
    const inputPrice = opts.input || opts.i || opts.prompt || opts.p;
    const outputPrice = opts.output || opts.o || opts.completion || opts.c;

    if (!inputPrice || !outputPrice) {
      throw createCommandError(
        ErrorCode.INVALID_ARGUMENT,
        'Please provide both --input and --output prices'
      );
    }

    const price = {
      prompt: parseFloat(inputPrice),
      completion: parseFloat(outputPrice)
    };

    if (isNaN(price.prompt) || isNaN(price.completion)) {
      throw createCommandError(
        ErrorCode.INVALID_ARGUMENT,
        'Prices must be valid numbers'
      );
    }

    // Update price table
    prices.set(model, price);

    // Save to config
    const config = getConfig();
    if (!config.prices) config.prices = {};
    config.prices[model] = price;
    saveConfig(config);

    logger.success(`✓ Price set for ${model}`);
    console.log(`  Input: $${price.prompt}/M tokens`);
    console.log(`  Output: $${price.completion}/M tokens`);

    return { success: true, data: { model, price } };
  }
});