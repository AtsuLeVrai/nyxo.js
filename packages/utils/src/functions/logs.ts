import chalk from "chalk";

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical" | "fatal" | "success";
export type LogContext = {
    code?: string | number;
    component?: string;
    details?: Record<string, unknown>;
    stack?: string;
    timestamp?: boolean;
};

const LogStyles = {
    debug: {
        prefix: chalk.gray.bold("DEBUG"),
        color: chalk.gray,
    },
    info: {
        prefix: chalk.blue.bold("INFO"),
        color: chalk.blue,
    },
    warn: {
        prefix: chalk.yellow.bold("WARN"),
        color: chalk.yellow,
    },
    error: {
        prefix: chalk.red.bold("ERROR"),
        color: chalk.red.dim,
    },
    critical: {
        prefix: chalk.red.bold("CRITICAL"),
        color: chalk.red,
    },
    fatal: {
        prefix: chalk.bgRed.white.bold("FATAL"),
        color: chalk.red.bold,
    },
    success: {
        prefix: chalk.green.bold("SUCCESS"),
        color: chalk.green,
    },
} as const;

const HighlightStyles = {
    method: chalk.cyan,
    important: chalk.bold,
    code: chalk.yellow,
    component: chalk.magenta,
    details: chalk.gray.italic,
    timestamp: chalk.gray.dim,
    value: chalk.yellow,
    path: chalk.green.underline,
} as const;

const formatMethodCalls = (message: string): string =>
    message.replace(/([a-zA-Z]+\(\))/g, (match) => HighlightStyles.method(match));

const formatImportantText = (message: string): string =>
    message.replace(/'([^']+)'/g, (_, text) => HighlightStyles.important(text));

const formatValues = (message: string): string =>
    message.replace(/\{([^}]+)}/g, (_, value) => HighlightStyles.value(value));

const formatPaths = (message: string): string =>
    message.replace(/(?:\/[\w.-]+)+/g, (match) => HighlightStyles.path(match));

const formatDetailsBlock = (details: Record<string, unknown>): string =>
    Object.entries(details)
        .map(([key, value]) => `${HighlightStyles.details(`${key}:`)} ${value}`)
        .join("\n  ");

const formatStack = (stack: string): string =>
    chalk.gray(
        stack
            .split("\n")
            .slice(1)
            .map((line) => `  ${line.trim()}`)
            .join("\n"),
    );

const formatTimestamp = (): string => HighlightStyles.timestamp(new Date().toISOString());

export const formatLog = (message: string, level: LogLevel = "info", context?: LogContext): string => {
    const style = LogStyles[level];
    const parts: string[] = [style.prefix];

    if (context?.timestamp) {
        parts.push(`[${formatTimestamp()}]`);
    }

    if (context?.code) {
        parts.push(`[${HighlightStyles.code(context.code)}]`);
    }

    if (context?.component) {
        parts.push(`<${HighlightStyles.component(context.component)}>`);
    }

    const formattedMessage = style.color(formatPaths(formatValues(formatImportantText(formatMethodCalls(message)))));
    parts.push(formattedMessage);

    let output = parts.filter(Boolean).join(" ");

    if (context?.details && Object.keys(context.details).length > 0) {
        output += `\nDetails:\n  ${formatDetailsBlock(context.details)}`;
    }

    if (context?.stack) {
        output += `\nStack Trace:\n${formatStack(context.stack)}`;
    }

    return output;
};

export const formatDebugLog = (message: string, context?: LogContext): string => formatLog(message, "debug", context);

export const formatInfoLog = (message: string, context?: LogContext): string => formatLog(message, "info", context);

export const formatWarnLog = (message: string, context?: LogContext): string => formatLog(message, "warn", context);

export const formatErrorLog = (message: string, context?: LogContext): string => formatLog(message, "error", context);

export const formatCriticalLog = (message: string, context?: LogContext): string =>
    formatLog(message, "critical", context);

export const formatFatalLog = (message: string, context?: LogContext): string => formatLog(message, "fatal", context);

export const formatSuccessLog = (message: string, context?: LogContext): string =>
    formatLog(message, "success", context);
