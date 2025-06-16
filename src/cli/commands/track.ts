import { createCommand, CommandResult } from '../shared/core';
import { logger, formatHuman, formatJson, formatTable } from '../common';
import { CostCalculator } from '../../index';
import { getTracker, resetTracker } from '../utils/tracker';

interface TrackSummaryOptions {
  format?: 'json' | 'table' | 'human';
}

export const trackSummaryCommand = createCommand({
  description: 'Show cost tracking summary',
  help: `
Usage: tok track summary [options]

Description:
  Displays a summary of all tracked token usage and costs for the current session.

Options:
  --format <format>     Output format: json, table, human (default: human)

Examples:
  tok track summary
  tok track summary --format json
  tok track summary --format table
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
    const opts = options as TrackSummaryOptions;
    const tracker = getTracker();
    const summary = tracker.getSummary();

    if (summary.models.length === 0) {
      logger.warn('No tracking data available. Use --track flag with estimate command.');
      return { success: true, data: summary };
    }

    if (opts.format === 'json') {
      formatJson(summary);
    } else if (opts.format === 'table') {
      formatTable(summary.modelBreakdown);
      console.log(`\nTotal Cost: ${CostCalculator.formatCost(summary.totalCost)}`);
    } else {
      console.log('');
      formatHuman('Cost Tracking Summary', [
        { label: 'Duration', value: `${summary.duration.toFixed(1)}s` },
        { label: 'Total Cost', value: CostCalculator.formatCost(summary.totalCost) },
        { label: 'Total Tokens', value: summary.totalTokens.prompt + summary.totalTokens.completion }
      ]);

      if (summary.modelBreakdown.length > 0) {
        console.log('');
        logger.info('Model Breakdown:');
        summary.modelBreakdown.forEach(item => {
          console.log(`\n${item.model}:`);
          console.log(`  Tokens: ${item.tokens.prompt} prompt, ${item.tokens.completion} completion`);
          console.log(`  Cost: ${CostCalculator.formatCost(item.cost.total)}`);
        });
      }
      console.log('');
    }

    return { success: true, data: summary };
  }
});

export const trackResetCommand = createCommand({
  description: 'Reset cost tracking data',
  help: `
Usage: tok track reset

Description:
  Resets all cost tracking data for the current session.

Examples:
  tok track reset
`,

  async execute(): Promise<CommandResult> {
    resetTracker();
    logger.success('✓ Cost tracking data reset');
    return { success: true };
  }
});