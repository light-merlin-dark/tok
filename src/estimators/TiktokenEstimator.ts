import { TokenEstimator } from './TokenEstimator';

export class TiktokenEstimator implements TokenEstimator {
  private initialized = false;

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  estimate(text: string): number {
    if (!this.initialized) {
      throw new Error('TiktokenEstimator not initialized. Call initialize() first.');
    }
    
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const punctuationCount = (text.match(/[.,!?;:'"()\[\]{}<>\/\\@#$%^&*+=_`~|-]/g) || []).length;
    const numberCount = (text.match(/\d+/g) || []).length;
    const uppercaseCount = (text.match(/[A-Z]/g) || []).length;
    
    let estimatedTokens = 0;
    
    estimatedTokens += wordCount * 1.3;
    estimatedTokens += punctuationCount * 0.3;
    estimatedTokens += numberCount * 0.5;
    estimatedTokens += uppercaseCount * 0.1;
    
    const avgTokenLength = 3.5;
    const charBasedEstimate = charCount / avgTokenLength;
    
    estimatedTokens = (estimatedTokens + charBasedEstimate) / 2;
    
    return Math.ceil(estimatedTokens);
  }

  dispose(): void {
    this.initialized = false;
  }
}