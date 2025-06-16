export type ModelPrice = {
  prompt: number;      // $ / 1 000 000 tokens
  completion: number;  // $ / 1 000 000 tokens
};

export class PriceTable {
  private prices = new Map<string, ModelPrice>();

  constructor(initial?: Record<string, ModelPrice>) {
    if (initial) {
      Object.entries(initial).forEach(([model, price]) => {
        this.prices.set(model, price);
      });
    }
    
    // Set default prices if not provided
    this.setDefaults();
  }

  private setDefaults(): void {
    const defaults: Record<string, ModelPrice> = {
      'gpt-4o': { prompt: 2.50, completion: 10.00 },
      'gpt-4o-mini': { prompt: 0.15, completion: 0.60 },
      'gpt-4-turbo': { prompt: 10.00, completion: 30.00 },
      'gpt-3.5-turbo': { prompt: 0.50, completion: 1.50 },
      'claude-3-opus': { prompt: 15.00, completion: 75.00 },
      'claude-3-sonnet': { prompt: 3.00, completion: 15.00 },
      'claude-3-haiku': { prompt: 0.25, completion: 1.25 },
      'claude-2.1': { prompt: 8.00, completion: 24.00 },
      'llama-3-70b': { prompt: 0.80, completion: 1.20 },
      'llama-3-8b': { prompt: 0.20, completion: 0.30 },
      'mixtral-8x7b': { prompt: 0.45, completion: 0.70 }
    };

    // Only set defaults if they don't already exist
    Object.entries(defaults).forEach(([model, price]) => {
      if (!this.prices.has(model)) {
        this.prices.set(model, price);
      }
    });
  }

  get(model: string): ModelPrice | undefined {
    return this.prices.get(model);
  }

  set(model: string, price: ModelPrice): void {
    this.prices.set(model, price);
  }

  list(): Map<string, ModelPrice> {
    return new Map(this.prices);
  }

  has(model: string): boolean {
    return this.prices.has(model);
  }
}