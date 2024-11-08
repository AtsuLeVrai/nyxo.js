import chalk from "chalk";

export function formatList(items: string[]): string {
    return items.map((item) => `  ${chalk.cyan("•")} ${item}`).join("\n");
}
