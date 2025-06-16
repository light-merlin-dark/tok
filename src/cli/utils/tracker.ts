import { CostTracker } from '../../CostTracker';

let tracker: CostTracker | null = null;

export function getTracker(): CostTracker {
  if (!tracker) {
    tracker = new CostTracker();
  }
  return tracker;
}

export function resetTracker(): void {
  if (tracker) {
    tracker.reset();
  }
}