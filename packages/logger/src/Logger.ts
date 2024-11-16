import chalk, { type ChalkInstance } from "chalk";
import { createPrefix, formatContext, formatDetails, formatMessage, formatStack } from "./formatters/index.js";
import { isValidLogLevel } from "./utils/index.js";

export type LogLevel = "debug" | "info" | "warn" | "error" | "critical" | "fatal" | "success";

export interface LogContext {
    code?: string | number;
    component?: string;
    details?: Record<string, unknown>;
    stack?: string;
}

export interface StyleConfig {
    color: ChalkInstance;
    prefix: string;
}

class LogBuilder {
    readonly #level: LogLevel;
    readonly #message: string;
    readonly #context?: LogContext;
    readonly #output: string[] = [];

    constructor(message: string, level: LogLevel, context?: LogContext) {
        this.#level = level;
        this.#message = message;
        this.#context = context;
    }

    build(): string {
        try {
            return this.#addPrefix()
                .#addContext()
                .#addMessage()
                .#addDetails()
                .#addStack()
                .#output.filter(Boolean)
                .join(" ");
        } catch (_error) {
            return chalk.red(`[FORMATTING ERROR] ${this.#message}`);
        }
    }

    #addPrefix(): this {
        this.#output.push(createPrefix(this.#level));
        return this;
    }

    #addContext(): this {
        this.#output.push(...formatContext(this.#context));
        return this;
    }

    #addMessage(): this {
        this.#output.push(formatMessage(this.#message, this.#level));
        return this;
    }

    #addDetails(): this {
        if (this.#context?.details && Object.keys(this.#context.details).length > 0) {
            this.#output.push(`\nDetails:\n  ${formatDetails(this.#context.details)}`);
        }
        return this;
    }

    #addStack(): this {
        if (this.#context?.stack) {
            this.#output.push(`\nStack Trace:\n${formatStack(this.#context.stack)}`);
        }
        return this;
    }
}

export function createLog(message: string, level: LogLevel, context?: LogContext): string {
    let parsedLevel = level;
    if (!isValidLogLevel(parsedLevel)) {
        parsedLevel = "info";
    }

    return new LogBuilder(message, parsedLevel, context).build();
}

export const Logger = {
    debug(message: string, context?: LogContext): string {
        return createLog(message, "debug", context);
    },
    info(message: string, context?: LogContext): string {
        return createLog(message, "info", context);
    },
    warn(message: string, context?: LogContext): string {
        return createLog(message, "warn", context);
    },
    error(message: string, context?: LogContext): string {
        return createLog(message, "error", context);
    },
    critical(message: string, context?: LogContext): string {
        return createLog(message, "critical", context);
    },
    fatal(message: string, context?: LogContext): string {
        return createLog(message, "fatal", context);
    },
    success(message: string, context?: LogContext): string {
        return createLog(message, "success", context);
    },
};
