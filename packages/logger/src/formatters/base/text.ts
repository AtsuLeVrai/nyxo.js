import chalk from "chalk";
import { PATTERNS } from "../../constants/index.js";

export function formatMethodCall(text: string): string {
    return text.replace(PATTERNS.methodCall, (match) => chalk.cyan(match));
}

export function formatImportantText(text: string): string {
    return text.replace(PATTERNS.importantText, (_, content) => chalk.bold(content));
}

export function formatValue(text: string): string {
    return text.replace(PATTERNS.value, (_, value) => chalk.yellow(value));
}
