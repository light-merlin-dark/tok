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
  -p, --prompt <price>      Prompt price per million tokens
  -c, --completion <price>  Completion price per million tokens

Examples:
  tok price set gpt-4-turbo --prompt 10 --completion 30
  tok price set custom-model -p 5.00 -c 15.00
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
      flag: 'p|prompt',
      description: 'Prompt price per million tokens',
      type: 'string'
    },
    {
      flag: 'c|completion',
      description: 'Completion price per million tokens',
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

    const promptPrice = opts.prompt || opts.p;
    const completionPrice = opts.completion || opts.c;

    if (!promptPrice || !completionPrice) {
      throw createCommandError(
        ErrorCode.INVALID_ARGUMENT,
        'Please provide both --prompt and --completion prices'
      );
    }

    const price = {
      prompt: parseFloat(promptPrice),
      completion: parseFloat(completionPrice)
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
    console.log(`  Prompt: $${price.prompt}/M tokens`);
    console.log(`  Completion: $${price.completion}/M tokens`);

    return { success: true, data: { model, price } };
  }
});