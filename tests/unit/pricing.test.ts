import { describe, it, expect } from 'vitest';
import { PriceTable } from '@/pricing/PriceTable';
import { CostCalculator } from '@/CostCalculator';

describe('PriceTable', () => {
  it('should initialize with default prices', () => {
    const prices = new PriceTable();
    const gpt4Price = prices.get('gpt-4o');
    
    expect(gpt4Price).toBeDefined();
    expect(gpt4Price?.prompt).toBe(2.50);
    expect(gpt4Price?.completion).toBe(10.00);
  });

  it('should allow custom prices', () => {
    const prices = new PriceTable({
      'custom-model': { prompt: 5.00, completion: 15.00 }
    });
    
    const customPrice = prices.get('custom-model');
    expect(customPrice?.prompt).toBe(5.00);
    expect(customPrice?.completion).toBe(15.00);
  });

  it('should update prices', () => {
    const prices = new PriceTable();
    prices.set('new-model', { prompt: 1.00, completion: 2.00 });
    
    const newPrice = prices.get('new-model');
    expect(newPrice?.prompt).toBe(1.00);
    expect(newPrice?.completion).toBe(2.00);
  });

  it('should list all models', () => {
    const prices = new PriceTable();
    const allModels = prices.list();
    
    expect(allModels.size).toBeGreaterThan(0);
    expect(allModels.has('gpt-4o')).toBe(true);
    expect(allModels.has('claude-3-opus')).toBe(true);
  });
});

describe('CostCalculator', () => {
  it('should calculate cost correctly', () => {
    const cost = CostCalculator.cost(1000, 2.50);
    expect(cost).toBe(0.0025);
  });

  it('should calculate cost for million tokens', () => {
    const cost = CostCalculator.cost(1_000_000, 15.00);
    expect(cost).toBe(15.00);
  });

  it('should format cost with 4 decimal places', () => {
    const formatted = CostCalculator.formatCost(0.0025);
    expect(formatted).toBe('$0.0025');
  });

  it('should calculate tokens per dollar', () => {
    const tokens = CostCalculator.tokensPerDollar(2.50);
    expect(tokens).toBe(400_000);
  });
});