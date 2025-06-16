import { CommandSpec } from '../shared/core';
import estimateCommand from './estimate';
import { priceListCommand, priceSetCommand } from './price';
import { trackSummaryCommand, trackResetCommand } from './track';
import configCommand from './config';

// Main commands
export const commands: Record<string, CommandSpec<any>> = {
  estimate: estimateCommand,
  config: configCommand,
  
  // Price sub-commands - we'll handle routing in the main entry
  'price': {
    description: 'Manage model pricing',
    help: `
Usage: tok price <subcommand> [options]

Subcommands:
  list      List all model prices
  set       Set price for a model

Run 'tok price <subcommand> --help' for more information.
`,
    async execute(args, options, ctx) {
      const subcommand = args[0];
      if (!subcommand || subcommand === 'help' || options.help) {
        console.log(this.help);
        return { success: true };
      }

      switch (subcommand) {
        case 'list':
          return priceListCommand.execute(args.slice(1), options, ctx);
        case 'set':
          return priceSetCommand.execute(args.slice(1), options, ctx);
        default:
          return {
            success: false,
            message: `Unknown price subcommand: ${subcommand}`
          };
      }
    }
  },

  // Track sub-commands
  'track': {
    description: 'Cost tracking session management',
    help: `
Usage: tok track <subcommand> [options]

Subcommands:
  summary   Show cost tracking summary
  reset     Reset cost tracking data

Run 'tok track <subcommand> --help' for more information.
`,
    async execute(args, options, ctx) {
      const subcommand = args[0];
      if (!subcommand || subcommand === 'help' || options.help) {
        console.log(this.help);
        return { success: true };
      }

      switch (subcommand) {
        case 'summary':
          return trackSummaryCommand.execute(args.slice(1), options, ctx);
        case 'reset':
          return trackResetCommand.execute(args.slice(1), options, ctx);
        default:
          return {
            success: false,
            message: `Unknown track subcommand: ${subcommand}`
          };
      }
    }
  }
};

// Export individual commands for testing
export {
  estimateCommand,
  priceListCommand,
  priceSetCommand,
  trackSummaryCommand,
  trackResetCommand,
  configCommand
};