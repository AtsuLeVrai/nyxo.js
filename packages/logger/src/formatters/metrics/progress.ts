import chalk from "chalk";

export function formatProgress(current: number, total: number): string {
    const percentage = Math.round((current / total) * 100);
    const width = 30;
    const filled = Math.round((width * current) / total);
    const empty = width - filled;

    const bar = chalk.green("=".repeat(filled)) + chalk.gray("-".repeat(empty));

    return `[${bar}] ${percentage}%`;
}
