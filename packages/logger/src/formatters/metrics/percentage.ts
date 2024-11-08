import chalk from "chalk";

export function formatPercentage(value: number, decimals = 2): string {
    const percentage = (value * 100).toFixed(decimals);
    if (value < 0.3) {
        return chalk.red(`${percentage}%`);
    }

    if (value < 0.7) {
        return chalk.yellow(`${percentage}%`);
    }

    return chalk.green(`${percentage}%`);
}
