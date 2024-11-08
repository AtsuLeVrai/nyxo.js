import chalk from "chalk";
import type { LogLevel, StyleConfig } from "../index.js";

export const levelStyles: Record<LogLevel, StyleConfig> = {
    debug: { color: chalk.gray, prefix: "DEBUG" },
    info: { color: chalk.blue, prefix: "INFO" },
    warn: { color: chalk.yellow, prefix: "WARN" },
    error: { color: chalk.red.dim, prefix: "ERROR" },
    critical: { color: chalk.red, prefix: "CRITICAL" },
    fatal: { color: chalk.red.bold, prefix: "FATAL" },
    success: { color: chalk.green, prefix: "SUCCESS" },
} as const;

export const highlightStyles = {
    method: chalk.cyan,
    important: chalk.bold,
    code: chalk.yellow,
    component: chalk.magenta,
    details: chalk.gray.italic,
    timestamp: chalk.gray.dim,
    value: chalk.yellow,
    path: chalk.green.underline,
} as const;
