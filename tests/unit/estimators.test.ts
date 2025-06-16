import { describe, it, expect } from 'vitest';
import { CharDivEstimator } from '@/estimators/CharDivEstimator';

describe('CharDivEstimator', () => {
  it('should estimate tokens with default divisor', () => {
    const estimator = new CharDivEstimator();
    expect(estimator.estimate('Hello world')).toBe(3); // 11 chars / 4 = 2.75 -> 3
  });

  it('should estimate tokens with custom divisor', () => {
    const estimator = new CharDivEstimator(3);
    expect(estimator.estimate('Hello world')).toBe(4); // 11 chars / 3 = 3.67 -> 4
  });

  it('should handle empty strings', () => {
    const estimator = new CharDivEstimator();
    expect(estimator.estimate('')).toBe(0);
  });

  it('should handle long texts', () => {
    const estimator = new CharDivEstimator();
    const longText = 'a'.repeat(1000);
    expect(estimator.estimate(longText)).toBe(250); // 1000 / 4 = 250
  });

  it('should round up for fractional tokens', () => {
    const estimator = new CharDivEstimator();
    expect(estimator.estimate('a')).toBe(1); // 1 / 4 = 0.25 -> 1
    expect(estimator.estimate('ab')).toBe(1); // 2 / 4 = 0.5 -> 1
    expect(estimator.estimate('abc')).toBe(1); // 3 / 4 = 0.75 -> 1
    expect(estimator.estimate('abcd')).toBe(1); // 4 / 4 = 1
    expect(estimator.estimate('abcde')).toBe(2); // 5 / 4 = 1.25 -> 2
  });
});