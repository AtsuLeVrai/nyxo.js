import chalk from "chalk";

export function formatTimestamp(): string {
    return `[${chalk.gray.dim(new Date().toISOString())}]`;
}

export function formatRelativeTime(date: Date | number | string): string {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 365) {
        return chalk.gray(`${Math.floor(days / 365)}y ago`);
    }
    if (days > 30) {
        return chalk.gray(`${Math.floor(days / 30)}mo ago`);
    }
    if (days > 0) {
        return chalk.gray(`${days}d ago`);
    }
    if (hours > 0) {
        return chalk.gray(`${hours}h ago`);
    }
    if (minutes > 0) {
        return chalk.gray(`${minutes}m ago`);
    }
    return chalk.gray(`${seconds}s ago`);
}
