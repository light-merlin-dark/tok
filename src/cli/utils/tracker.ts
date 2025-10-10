import { CostTracker, ModelTotals } from '../../CostTracker';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const trackingDir = path.join(os.homedir(), '.tok');
const trackingPath = path.join(trackingDir, 'tracking.json');

let tracker: CostTracker | null = null;

interface PersistedTracking {
  startTime: string;
  totals: Record<string, ModelTotals>;
}

function ensureTrackingDir(): void {
  if (!fs.existsSync(trackingDir)) {
    fs.mkdirSync(trackingDir, { recursive: true });
  }
}

function loadTracking(): PersistedTracking | null {
  ensureTrackingDir();

  if (fs.existsSync(trackingPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(trackingPath, 'utf-8'));
      return data;
    } catch (error) {
      // If corrupted, ignore and start fresh
      return null;
    }
  }

  return null;
}

function saveTracking(tracker: CostTracker): void {
  ensureTrackingDir();

  const snapshot = tracker.snapshot();
  const totals: Record<string, ModelTotals> = {};

  snapshot.forEach((value, key) => {
    totals[key] = value;
  });

  const data: PersistedTracking = {
    startTime: (tracker as any).startTime.toISOString(),
    totals
  };

  fs.writeFileSync(trackingPath, JSON.stringify(data, null, 2));
}

export function getTracker(): CostTracker {
  if (!tracker) {
    tracker = new CostTracker();

    // Load persisted data
    const persisted = loadTracking();
    if (persisted) {
      // Restore start time
      (tracker as any).startTime = new Date(persisted.startTime);

      // Restore totals
      const totalsMap = (tracker as any).totals as Map<string, ModelTotals>;
      Object.entries(persisted.totals).forEach(([model, totals]) => {
        totalsMap.set(model, totals);
      });
    }
  }
  return tracker;
}

export function resetTracker(): void {
  if (tracker) {
    tracker.reset();
  } else {
    tracker = new CostTracker();
  }
  saveTracking(tracker);
}

export function persistTracker(): void {
  if (tracker) {
    saveTracking(tracker);
  }
}