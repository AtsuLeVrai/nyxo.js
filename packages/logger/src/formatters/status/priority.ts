import chalk from "chalk";

export type PriorityLevel = 1 | 2 | 3 | 4 | 5;

export function formatPriority(priority: PriorityLevel): string {
    const priorities: Record<PriorityLevel, string> = {
        1: chalk.red.bold("! Critical"),
        2: chalk.red("! High"),
        3: chalk.yellow("▲ Medium"),
        4: chalk.blue("▼ Low"),
        5: chalk.gray("○ Trivial"),
    };

    return priorities[priority] || chalk.gray("? Unknown");
}
