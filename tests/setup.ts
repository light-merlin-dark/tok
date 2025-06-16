import { vi } from 'vitest';

// Mock console methods to reduce noise during tests
// You can comment these out if you want to see console output
global.console = {
  ...console,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  // Keep error for debugging
  error: console.error,
};