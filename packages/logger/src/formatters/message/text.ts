import { highlightStyles, levelStyles } from "../../constants/index.js";
import type { LogLevel } from "../../index.js";

export function formatMessage(message: string, level: LogLevel): string {
    const style = levelStyles[level];

    try {
        let formattedMessage = message;
        formattedMessage = formattedMessage.replace(/\b\w+\(\)/g, (match) => highlightStyles.method(match));
        formattedMessage = formattedMessage.replace(/'([^']+)'/g, (_, text) => highlightStyles.important(text));
        formattedMessage = formattedMessage.replace(/\{([^}]+)}/g, (_, value) => highlightStyles.value(value));
        formattedMessage = formattedMessage.replace(/(?:\/[\w.-]+)+/g, (match) => highlightStyles.path(match));

        return style.color(formattedMessage);
    } catch (_error) {
        return style.color(message);
    }
}
