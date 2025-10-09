import { describe, it, expect, beforeEach } from 'bun:test';
import { route } from '../../src/cli/router';
import { RuntimeContext } from '../../src/cli/shared/core';
import { resetTracker } from '../../src/cli/utils/tracker';

describe('CLI Integration Tests', () => {
  const mockContext: RuntimeContext = {
    verbose: false,
    cwd: process.cwd(),
    env: process.env as Record<string, string>
  };

  beforeEach(() => {
    resetTracker();
  });

  describe('Help Command', () => {
    it('should show help when no arguments provided', async () => {
      const result = await route([], mockContext);
      expect(result.success).toBe(true);
    });

    it('should show help with --help flag', async () => {
      const result = await route(['--help'], mockContext);
      expect(result.success).toBe(true);
    });

    it('should show help with -h flag', async () => {
      const result = await route(['-h'], mockContext);
      expect(result.success).toBe(true);
    });

    it('should show help with help command', async () => {
      const result = await route(['help'], mockContext);
      expect(result.success).toBe(true);
    });
  });

  describe('Estimate Command', () => {
    it('should estimate tokens for simple text', async () => {
      const result = await route(['estimate', 'Hello world'], mockContext);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.tokens).toBe(3);
      expect(result.data.text_length).toBe(11);
    });

    it('should estimate with specific model', async () => {
      const result = await route(['estimate', 'Test text', '--model', 'gpt-4o'], mockContext);
      expect(result.success).toBe(true);
      expect(result.data.model).toBe('gpt-4o');
    });

    it('should handle missing text argument', async () => {
      const result = await route(['estimate'], mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Please provide text to estimate');
    });

    it('should support JSON format', async () => {
      const result = await route(['estimate', 'Test', '--format', 'json'], mockContext);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should track costs when --track flag is used', async () => {
      await route(['estimate', 'Test text', '--track'], mockContext);
      const summaryResult = await route(['track', 'summary', '--format', 'json'], mockContext);
      expect(summaryResult.success).toBe(true);
      expect(summaryResult.data.models).toContain('gpt-4o');
    });
  });

  describe('Price Commands', () => {
    it('should list all prices', async () => {
      const result = await route(['price', 'list'], mockContext);
      expect(result.success).toBe(true);
    });

    it('should set custom price', async () => {
      const result = await route(['price', 'set', 'custom-model', '--prompt', '5', '--completion', '10'], mockContext);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        model: 'custom-model',
        price: { prompt: 5, completion: 10 }
      });
    });

    it('should require both prompt and completion prices', async () => {
      const result = await route(['price', 'set', 'custom-model', '--prompt', '5'], mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('provide both --prompt and --completion');
    });

    it('should show price subcommand help', async () => {
      const result = await route(['price', '--help'], mockContext);
      expect(result.success).toBe(true);
    });
  });

  describe('Track Commands', () => {
    it('should show empty summary initially', async () => {
      const result = await route(['track', 'summary'], mockContext);
      expect(result.success).toBe(true);
    });

    it('should reset tracking data', async () => {
      // Add some tracking data first
      await route(['estimate', 'Test', '--track'], mockContext);
      
      // Reset
      const resetResult = await route(['track', 'reset'], mockContext);
      expect(resetResult.success).toBe(true);
      
      // Check summary is empty
      const summaryResult = await route(['track', 'summary', '--format', 'json'], mockContext);
      expect(summaryResult.success).toBe(true);
      expect(summaryResult.data).toBeDefined();
      expect(summaryResult.data.models.length).toBe(0);
    });

    it('should accumulate multiple estimations', async () => {
      await route(['estimate', 'First test', '--track'], mockContext);
      await route(['estimate', 'Second test', '--track', '--model', 'claude-3-opus'], mockContext);
      
      const result = await route(['track', 'summary', '--format', 'json'], mockContext);
      expect(result.success).toBe(true);
      expect(result.data.models).toContain('gpt-4o');
      expect(result.data.models).toContain('claude-3-opus');
      expect(result.data.modelBreakdown).toHaveLength(2);
    });

    it('should show track subcommand help', async () => {
      const result = await route(['track', '--help'], mockContext);
      expect(result.success).toBe(true);
    });
  });

  describe('Config Command', () => {
    it('should show configuration info', async () => {
      const result = await route(['config'], mockContext);
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown commands', async () => {
      const result = await route(['unknown-command'], mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown command');
    });

    it('should handle unknown subcommands', async () => {
      const result = await route(['price', 'unknown'], mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown price subcommand');
    });
  });

  describe('Verbose Mode', () => {
    it('should respect verbose flag in context', async () => {
      const verboseContext = { ...mockContext, verbose: true };
      const result = await route(['estimate', 'Test'], verboseContext);
      expect(result.success).toBe(true);
    });

    it('should respect --verbose flag', async () => {
      const result = await route(['estimate', 'Test', '--verbose'], mockContext);
      expect(result.success).toBe(true);
    });
  });
});