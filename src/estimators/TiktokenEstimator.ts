import { TokenEstimator } from './TokenEstimator';

export class TiktokenEstimator implements TokenEstimator {
  private enc: any;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      const { encoding_for_model } = await import('@dqbd/tiktoken');
      this.enc = encoding_for_model('gpt-4o-mini');
      this.initialized = true;
    } catch (error) {
      throw new Error('Tiktoken not available. Install @dqbd/tiktoken for exact token counting.');
    }
  }

  estimate(text: string): number {
    if (!this.initialized) {
      throw new Error('TiktokenEstimator not initialized. Call initialize() first.');
    }
    return this.enc.encode(text).length;
  }

  dispose(): void {
    if (this.enc) {
      this.enc.free();
      this.enc = null;
      this.initialized = false;
    }
  }
}