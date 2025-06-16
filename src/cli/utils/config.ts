import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { PriceTable } from '../../index';

const configDir = path.join(os.homedir(), '.tok');
const configPath = path.join(configDir, 'config.json');

export interface Config {
  prices?: Record<string, { prompt: number; completion: number }>;
}

export function ensureConfigDir(): void {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

export function getConfig(): Config {
  ensureConfigDir();
  
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (error) {
      console.warn('Warning: Failed to load config, using defaults');
      return {};
    }
  }
  
  return {};
}

export function saveConfig(config: Config): void {
  ensureConfigDir();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export function loadPricesIntoTable(prices: PriceTable): void {
  const config = getConfig();
  if (config.prices) {
    Object.entries(config.prices).forEach(([model, price]) => {
      prices.set(model, price);
    });
  }
}