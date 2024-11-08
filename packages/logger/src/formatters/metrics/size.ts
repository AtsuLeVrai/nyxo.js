import chalk from "chalk";

export function formatSize(bytes: number): string {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) {
        return chalk.cyan("0B");
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return chalk.cyan(`${(bytes / 1024 ** i).toFixed(2)}${sizes[i]}`);
}
