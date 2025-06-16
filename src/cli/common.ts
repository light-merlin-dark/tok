import chalk from 'chalk';

export const logger = {
  log: (message: string) => console.log(message),
  error: (message: string) => console.error(chalk.red(message)),
  warn: (message: string) => console.warn(chalk.yellow(message)),
  info: (message: string) => console.log(chalk.blue(message)),
  success: (message: string) => console.log(chalk.green(message)),
  debug: (message: string, verbose: boolean = false) => {
    if (verbose) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  }
};

export function formatTable(data: any): void {
  console.table(data);
}

export function formatJson(data: any): void {
  console.log(JSON.stringify(data, null, 2));
}

export function formatHuman(title: string, items: Array<{ label: string; value: any }>): void {
  console.log(chalk.blue(title));
  console.log('─'.repeat(Math.min(50, title.length + 10)));
  items.forEach(({ label, value }) => {
    console.log(`${label}: ${chalk.yellow(value)}`);
  });
}