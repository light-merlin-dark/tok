import { mock } from 'bun:test';

// Mock console methods to reduce noise during tests
// You can comment these out if you want to see console output
global.console = {
  ...console,
  log: mock(() => {}),
  info: mock(() => {}),
  warn: mock(() => {}),
  // Keep error for debugging
  error: console.error,
};