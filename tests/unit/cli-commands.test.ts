import { describe, it, expect, vi } from 'vitest';
import { parseArgs } from '@/cli/router';
import { createCommandError, ErrorCode } from '@/cli/shared/errors';

describe('CLI Router', () => {
  describe('parseArgs', () => {
    it('should parse command with no arguments', () => {
      const result = parseArgs(['estimate']);
      expect(result.command).toBe('estimate');
      expect(result.commandArgs).toEqual([]);
      expect(result.options).toEqual({});
    });

    it('should parse command with arguments', () => {
      const result = parseArgs(['estimate', 'Hello', 'world']);
      expect(result.command).toBe('estimate');
      expect(result.commandArgs).toEqual(['Hello', 'world']);
    });

    it('should parse long options with values', () => {
      const result = parseArgs(['estimate', 'text', '--model', 'gpt-4o', '--format', 'json']);
      expect(result.options).toEqual({
        model: 'gpt-4o',
        format: 'json'
      });
    });

    it('should parse long options with equals sign', () => {
      const result = parseArgs(['estimate', 'text', '--model=gpt-4o']);
      expect(result.options).toEqual({
        model: 'gpt-4o'
      });
    });

    it('should parse boolean long options', () => {
      const result = parseArgs(['estimate', 'text', '--exact', '--track']);
      expect(result.options).toEqual({
        exact: true,
        track: true
      });
    });

    it('should parse short options', () => {
      const result = parseArgs(['estimate', 'text', '-v', '-h']);
      expect(result.options).toEqual({
        v: true,
        h: true
      });
    });

    it('should parse combined short options', () => {
      const result = parseArgs(['estimate', 'text', '-vh']);
      expect(result.options).toEqual({
        v: true,
        h: true
      });
    });

    it('should convert kebab-case to camelCase', () => {
      const result = parseArgs(['estimate', '--my-option', 'value']);
      expect(result.options).toEqual({
        myOption: 'value'
      });
    });

    it('should handle empty args', () => {
      const result = parseArgs([]);
      expect(result.command).toBe('help');
      expect(result.commandArgs).toEqual([]);
      expect(result.options).toEqual({});
    });
  });
});

describe('CLI Errors', () => {
  it('should create command errors with proper structure', () => {
    const error = createCommandError(
      ErrorCode.INVALID_ARGUMENT,
      'Test error message',
      { detail: 'test' }
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('CommandError');
    expect(error.code).toBe(ErrorCode.INVALID_ARGUMENT);
    expect(error.userMessage).toBe('Test error message');
    expect(error.details).toEqual({ detail: 'test' });
  });

  it('should create errors without details', () => {
    const error = createCommandError(
      ErrorCode.FILE_NOT_FOUND,
      'File not found'
    );

    expect(error.code).toBe(ErrorCode.FILE_NOT_FOUND);
    expect(error.details).toBeUndefined();
  });
});