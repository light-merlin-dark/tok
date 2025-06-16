import { createCommand, CommandResult } from '../shared/core';
import { logger } from '../common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const configDir = path.join(os.homedir(), '.tok');
const configPath = path.join(configDir, 'config.json');

const configCommand = createCommand({
  description: 'Show configuration file location',
  help: `
Usage: tok config

Description:
  Shows the location of the configuration file and whether it exists.

Examples:
  tok config
`,

  async execute(): Promise<CommandResult> {
    console.log('');
    logger.info('Configuration:');
    console.log(`Path: ${configPath}`);
    console.log(`Exists: ${fs.existsSync(configPath) ? '✓ Yes' : '✗ No'}`);
    console.log('');

    return { success: true };
  }
});

export default configCommand;