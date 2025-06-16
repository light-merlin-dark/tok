import { ModelPrice } from './pricing/PriceTable';
import { CostCalculator } from './CostCalculator';

export type ModelTotals = {
  promptTokens: number;
  completionTokens: number;
  promptCost: number;
  completionCost: number;
};

export class CostTracker {
  private totals = new Map<string, ModelTotals>();
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  add(model: string, promptTokens: number, completionTokens: number, price: ModelPrice): void {
    const existing = this.totals.get(model) ?? {
      promptTokens: 0,
      completionTokens: 0,
      promptCost: 0,
      completionCost: 0
    };

    existing.promptTokens += promptTokens;
    existing.completionTokens += completionTokens;
    existing.promptCost += CostCalculator.cost(promptTokens, price.prompt);
    existing.completionCost += CostCalculator.cost(completionTokens, price.completion);

    this.totals.set(model, existing);
  }

  /** Raw map for callers to format as they wish */
  snapshot(): Map<string, ModelTotals> {
    return new Map(this.totals);
  }

  /** Grand total across all models */
  grandTotal(): number {
    let sum = 0;
    for (const totals of this.totals.values()) {
      sum += totals.promptCost + totals.completionCost;
    }
    return sum;
  }

  /** Total token count across all models */
  totalTokens(): { prompt: number; completion: number } {
    let promptTotal = 0;
    let completionTotal = 0;

    for (const totals of this.totals.values()) {
      promptTotal += totals.promptTokens;
      completionTotal += totals.completionTokens;
    }

    return { prompt: promptTotal, completion: completionTotal };
  }

  /** Get tracking duration in seconds */
  getDuration(): number {
    return (new Date().getTime() - this.startTime.getTime()) / 1000;
  }

  /** Reset all tracking data */
  reset(): void {
    this.totals.clear();
    this.startTime = new Date();
  }

  /** Get summary statistics */
  getSummary(): {
    models: string[];
    totalCost: number;
    totalTokens: { prompt: number; completion: number };
    duration: number;
    modelBreakdown: Array<{
      model: string;
      tokens: { prompt: number; completion: number };
      cost: { prompt: number; completion: number; total: number };
    }>;
  } {
    const modelBreakdown = Array.from(this.totals.entries()).map(([model, totals]) => ({
      model,
      tokens: {
        prompt: totals.promptTokens,
        completion: totals.completionTokens
      },
      cost: {
        prompt: totals.promptCost,
        completion: totals.completionCost,
        total: totals.promptCost + totals.completionCost
      }
    }));

    return {
      models: Array.from(this.totals.keys()),
      totalCost: this.grandTotal(),
      totalTokens: this.totalTokens(),
      duration: this.getDuration(),
      modelBreakdown
    };
  }
}