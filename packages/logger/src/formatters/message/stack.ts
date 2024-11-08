import chalk from "chalk";

export function formatStack(stack: string): string {
    try {
        return chalk.gray(
            stack
                .split("\n")
                .slice(1)
                .map((line) => `  ${line.trim()}`)
                .join("\n"),
        );
    } catch {
        return chalk.red("[Error formatting stack trace]");
    }
}
