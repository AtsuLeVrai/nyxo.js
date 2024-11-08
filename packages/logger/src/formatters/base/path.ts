import chalk from "chalk";
import { PATTERNS } from "../../constants/index.js";

export function formatPath(text: string): string {
    return text.replace(PATTERNS.path, (match) => chalk.green.underline(match));
}

export function formatUrl(text: string): string {
    return text.replace(PATTERNS.url, (match) => chalk.blue.underline(match));
}
