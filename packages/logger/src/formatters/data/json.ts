import chalk from "chalk";

export function formatJson(json: unknown): string {
    try {
        const formatted = typeof json === "string" ? JSON.parse(json) : json;
        return chalk.cyan(JSON.stringify(formatted, null, 2));
    } catch {
        return chalk.red("[Invalid JSON]");
    }
}
