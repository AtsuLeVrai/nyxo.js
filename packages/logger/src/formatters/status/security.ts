import chalk from "chalk";

export type SecurityLevel = "high" | "medium" | "low";

export function formatSecurityLevel(level: SecurityLevel): string {
    const levels: Record<SecurityLevel, string> = {
        high: chalk.green("↑ High"),
        medium: chalk.yellow("→ Medium"),
        low: chalk.red("↓ Low"),
    };

    return levels[level] || chalk.gray("? Unknown");
}
