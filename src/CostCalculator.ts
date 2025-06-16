export class CostCalculator {
  static cost(tokens: number, dollarsPerMillion: number): number {
    return (tokens / 1_000_000) * dollarsPerMillion;
  }

  static formatCost(cost: number): string {
    return `$${cost.toFixed(4)}`;
  }

  static tokensPerDollar(dollarsPerMillion: number): number {
    return Math.floor(1_000_000 / dollarsPerMillion);
  }
}