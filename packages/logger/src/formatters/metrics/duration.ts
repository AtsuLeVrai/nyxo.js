import chalk from "chalk";

export function formatDuration(ms: number): string {
    if (ms < 1000) {
        return chalk.magenta(`${ms}ms`);
    }

    if (ms < 60000) {
        return chalk.magenta(`${(ms / 1000).toFixed(2)}s`);
    }

    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return chalk.magenta(`${minutes}m${seconds}s`);
}
