import { CommandResult, CommandOptions, RuntimeContext } from './shared/core';
import { logger } from './common';
import { CommandError } from './shared/errors';

export interface ParsedArgs {
  command: string;
  commandArgs: string[];
  options: CommandOptions;
}

export function parseArgs(args: string[]): ParsedArgs {
  const command = args[0] || 'help';
  const commandArgs: string[] = [];
  const options: CommandOptions = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      // Long option
      const [key, value] = arg.slice(2).split('=');
      const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      
      if (value !== undefined) {
        options[camelKey] = value;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options[camelKey] = args[++i];
      } else {
        options[camelKey] = true;
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      // Short option
      const flags = arg.slice(1);
      for (const flag of flags) {
        options[flag] = true;
      }
    } else {
      // Regular argument
      commandArgs.push(arg);
    }
  }

  return { command, commandArgs, options };
}

export async function route(
  args: string[],
  ctx: RuntimeContext
): Promise<CommandResult> {
  try {
    // Handle global --help before parsing
    if (args.length === 0 || args.includes('--help') || args.includes('-h') || args[0] === 'help') {
      const { commands } = await import('./commands');
      showHelp(Object.keys(commands));
      return { success: true };
    }

    const { command, commandArgs, options } = parseArgs(args);

    // Lazy load commands
    const { commands } = await import('./commands');
    const handler = commands[command];

    if (!handler) {
      logger.error(`Unknown command: ${command}`);
      logger.info(`Run 'tok help' for available commands`);
      return { success: false, message: `Unknown command: ${command}` };
    }

    // Handle command-specific help
    if (options.help || options.h) {
      if (handler.help) {
        console.log(handler.help);
      } else {
        logger.info(`No detailed help available for '${command}'`);
        if (handler.description) {
          logger.info(`Description: ${handler.description}`);
        }
      }
      return { success: true };
    }

    // Execute command
    return await handler.execute(commandArgs, options, ctx);
  } catch (error) {
    if (error instanceof CommandError) {
      logger.error(error.userMessage);
      if (ctx.verbose && error.details) {
        logger.debug(JSON.stringify(error.details, null, 2), true);
      }
      return {
        success: false,
        message: error.userMessage,
        data: { code: error.code, details: error.details }
      };
    }

    // Unknown error
    logger.error(`An unexpected error occurred: ${error}`);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

function showHelp(commandNames: string[]): void {
  console.log(`
tok - Fast token estimation and cost calculation for LLMs

Usage: tok [command] [options]

Commands:
${commandNames.map(cmd => `  ${cmd.padEnd(15)} Use --help with command for details`).join('\n')}

Global Options:
  -h, --help      Show help
  -v, --verbose   Enable verbose output

Examples:
  tok estimate "Hello world"
  tok price list
  tok track summary

Run 'tok [command] --help' for command-specific help.
  `);
}