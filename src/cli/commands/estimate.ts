import { createCommand, CommandResult } from '../shared/core';
import { logger, formatHuman, formatJson, formatTable } from '../common';
import { ErrorCode, createCommandError } from '../shared/errors';
import { CharDivEstimator, TiktokenEstimator, PriceTable, CostCalculator } from '../../index';
import * as fs from 'fs';
import { getTracker } from '../utils/tracker';

interface EstimateOptions {
  model?: string;
  exact?: boolean;
  file?: boolean;
  track?: boolean;
  format?: 'json' | 'table' | 'human';
  verbose?: boolean;
}

const estimateCommand = createCommand<any>({
  description: 'Estimate token count for given text',
  help: `
Usage: tok estimate <text> [options]

Description:
  Estimates the token count for the provided text and calculates cost based on model pricing.
  By default, uses fast character-based estimation (chars/4). Use --exact for precise counting.

Arguments:
  text                  Text to estimate tokens for (or file path with --file)

Options:
  -m, --model <model>   Model for cost calculation (default: gpt-4o)
  -e, --exact           Use exact token counting (requires tiktoken)
  -f, --file            Treat text argument as file path
  --track               Add to cost tracking session
  --format <format>     Output format: json, table, human (default: human)
  -v, --verbose         Enable verbose output

Examples:
  tok estimate "Hello world"
  tok estimate "Your prompt" --model gpt-4o --exact
  tok estimate prompt.txt --file --track
  tok estimate "Text" --format json

Available Models:
  gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo,
  claude-3-opus, claude-3-sonnet, claude-3-haiku,
  llama-3-70b, llama-3-8b, mixtral-8x7b
`,
  options: [
    {
      flag: 'm|model',
      description: 'Model to calculate cost for',
      type: 'string',
      default: 'gpt-4o'
    },
    {
      flag: 'e|exact',
      description: 'Use exact token counting',
      type: 'boolean'
    },
    {
      flag: 'f|file',
      description: 'Treat text as file path',
      type: 'boolean'
    },
    {
      flag: 'track',
      description: 'Add to cost tracking',
      type: 'boolean'
    },
    {
      flag: 'format',
      description: 'Output format',
      type: 'string',
      default: 'human'
    }
  ],

  async execute(args, options, ctx): Promise<CommandResult> {
    try {
      const opts = options as EstimateOptions;
      const verbose = opts.verbose || ctx.verbose;
      const text = args[0];
      
      if (!text) {
        throw createCommandError(
          ErrorCode.INVALID_ARGUMENT,
          'Please provide text to estimate'
        );
      }

      // Get content
      let content = text;
      if (opts.file) {
        if (verbose) {
          logger.debug(`Reading from file: ${text}`, true);
        }
        try {
          content = fs.readFileSync(text, 'utf-8');
        } catch (error) {
          throw createCommandError(
            ErrorCode.FILE_NOT_FOUND,
            `Could not read file: ${text}`
          );
        }
      }

      // Estimate tokens
      let tokens: number;
      let method: string;

      if (opts.exact) {
        const estimator = new TiktokenEstimator();
        try {
          await estimator.initialize();
          tokens = estimator.estimate(content);
          estimator.dispose();
          method = 'exact';
        } catch (error) {
          if (verbose) {
            logger.warn('Tiktoken not available, falling back to estimation');
          }
          const charEstimator = new CharDivEstimator();
          tokens = charEstimator.estimate(content);
          method = 'estimate (tiktoken unavailable)';
        }
      } else {
        const estimator = new CharDivEstimator();
        tokens = estimator.estimate(content);
        method = 'estimate';
      }

      // Calculate cost
      const prices = new PriceTable();
      const model = opts.model || 'gpt-4o';
      const modelPrice = prices.get(model);
      let cost = null;
      let costFormatted = 'N/A';

      if (modelPrice) {
        cost = CostCalculator.cost(tokens, modelPrice.prompt);
        costFormatted = CostCalculator.formatCost(cost);

        // Track if requested
        if (opts.track) {
          const tracker = getTracker();
          tracker.add(model, tokens, 0, modelPrice);
          if (verbose) {
            logger.debug('Added to cost tracking', true);
          }
        }
      } else {
        logger.warn(`No pricing available for model: ${model}`);
      }

      // Format result
      const result = {
        text_length: content.length,
        tokens,
        model,
        cost: costFormatted,
        method
      };

      // Output based on format
      switch (opts.format) {
        case 'json':
          formatJson(result);
          break;
        case 'table':
          formatTable(result);
          break;
        default:
          formatHuman('Token Estimation Results', [
            { label: 'Text length', value: `${result.text_length} characters` },
            { label: 'Tokens', value: `${result.tokens} (${result.method})` },
            { label: 'Model', value: result.model },
            { label: 'Cost', value: result.cost }
          ]);
      }

      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'CommandError') {
        throw error;
      }
      throw createCommandError(
        ErrorCode.PROCESSING_ERROR,
        `Failed to estimate tokens: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
});

export default estimateCommand;