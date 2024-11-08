import { type LogContext, formatTimestamp, highlightStyles, validateContext } from "../../index.js";

export function formatContext(context?: LogContext): string[] {
    if (!context) {
        return [formatTimestamp()];
    }

    if (!validateContext(context)) {
        return [formatTimestamp()];
    }

    const parts: string[] = [formatTimestamp()];

    if (context.code) {
        parts.push(`[${highlightStyles.code(context.code)}]`);
    }

    if (context.component) {
        parts.push(`<${highlightStyles.component(context.component)}>`);
    }

    return parts;
}
