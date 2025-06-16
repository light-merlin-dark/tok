import { describe, it, expect, beforeEach } from 'vitest';
import { CostTracker } from '@/CostTracker';
import { ModelPrice } from '@/pricing/PriceTable';

describe('CostTracker', () => {
  let tracker: CostTracker;
  const gpt4Price: ModelPrice = { prompt: 2.50, completion: 10.00 };
  const claudePrice: ModelPrice = { prompt: 15.00, completion: 75.00 };

  beforeEach(() => {
    tracker = new CostTracker();
  });

  it('should track costs for a single model', () => {
    tracker.add('gpt-4o', 1000, 500, gpt4Price);
    
    const summary = tracker.getSummary();
    expect(summary.models).toContain('gpt-4o');
    expect(summary.totalCost).toBe(0.0025 + 0.005); // 0.0075
    expect(summary.totalTokens.prompt).toBe(1000);
    expect(summary.totalTokens.completion).toBe(500);
  });

  it('should track costs for multiple models', () => {
    tracker.add('gpt-4o', 1000, 500, gpt4Price);
    tracker.add('claude-3-opus', 2000, 1000, claudePrice);
    
    const summary = tracker.getSummary();
    expect(summary.models).toHaveLength(2);
    expect(summary.models).toContain('gpt-4o');
    expect(summary.models).toContain('claude-3-opus');
    
    const gpt4Cost = 0.0025 + 0.005; // 0.0075
    const claudeCost = 0.030 + 0.075; // 0.105
    expect(summary.totalCost).toBeCloseTo(gpt4Cost + claudeCost);
  });

  it('should accumulate multiple calls to same model', () => {
    tracker.add('gpt-4o', 1000, 500, gpt4Price);
    tracker.add('gpt-4o', 2000, 1000, gpt4Price);
    
    const summary = tracker.getSummary();
    expect(summary.models).toHaveLength(1);
    expect(summary.totalTokens.prompt).toBe(3000);
    expect(summary.totalTokens.completion).toBe(1500);
  });

  it('should reset tracking data', () => {
    tracker.add('gpt-4o', 1000, 500, gpt4Price);
    tracker.reset();
    
    const summary = tracker.getSummary();
    expect(summary.models).toHaveLength(0);
    expect(summary.totalCost).toBe(0);
  });

  it('should provide model breakdown', () => {
    tracker.add('gpt-4o', 1000, 500, gpt4Price);
    
    const summary = tracker.getSummary();
    const breakdown = summary.modelBreakdown[0];
    
    expect(breakdown.model).toBe('gpt-4o');
    expect(breakdown.tokens.prompt).toBe(1000);
    expect(breakdown.tokens.completion).toBe(500);
    expect(breakdown.cost.prompt).toBeCloseTo(0.0025);
    expect(breakdown.cost.completion).toBeCloseTo(0.005);
    expect(breakdown.cost.total).toBeCloseTo(0.0075);
  });

  it('should track duration', async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const duration = tracker.getDuration();
    expect(duration).toBeGreaterThan(0.1);
    expect(duration).toBeLessThan(0.2);
  });
});