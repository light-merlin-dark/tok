#!/usr/bin/env node

import { route } from './router';
import { RuntimeContext } from './shared/core';
import { logger } from './common';
import { loadPricesIntoTable } from './utils/config';
import { PriceTable } from '../index';

async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);

    // Check for version flag
    if (args.includes('--version') || args.includes('-V')) {
      // Use dynamic import for package.json
      const { readFileSync } = await import('fs');
      const { join } = await import('path');
      const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
      console.log(pkg.version);
      process.exit(0);
    }

    // Create runtime context
    const ctx: RuntimeContext = {
      verbose: args.includes('--verbose') || args.includes('-v'),
      cwd: process.cwd(),
      env: process.env as Record<string, string>
    };

    // Load custom prices from config
    const prices = new PriceTable();
    loadPricesIntoTable(prices);

    // Route to appropriate command
    const result = await route(args, ctx);

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    logger.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}