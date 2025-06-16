import { TokenEstimator } from './TokenEstimator';

export class CharDivEstimator implements TokenEstimator {
  constructor(private divisor = 4) {}
  
  estimate(text: string): number {
    return Math.ceil(text.length / this.divisor);
  }
}