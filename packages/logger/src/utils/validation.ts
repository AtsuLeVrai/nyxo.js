import type { LogContext, LogLevel } from "../index.js";

export function isValidLogLevel(level: string): level is LogLevel {
    return ["debug", "info", "warn", "error", "critical", "fatal", "success"].includes(level);
}

export function validateContext(context: unknown): context is LogContext {
    if (typeof context !== "object" || context === null) {
        return false;
    }

    const ctx = context as Record<string, unknown>;

    const validations = {
        code: (value: unknown) => value === undefined || typeof value === "string" || typeof value === "number",

        component: (value: unknown) => value === undefined || typeof value === "string",

        details: (value: unknown) => value === undefined || (typeof value === "object" && value !== null),

        stack: (value: unknown) => value === undefined || typeof value === "string",
    };

    return Object.entries(validations).every(([key, validate]) => validate(ctx[key]));
}

export function validateLogMessage(message: unknown): message is string {
    return typeof message === "string" && message.length > 0;
}
