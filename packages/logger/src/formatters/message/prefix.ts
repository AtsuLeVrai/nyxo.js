import { type LogLevel, levelStyles } from "../../index.js";

export function createPrefix(level: LogLevel): string {
    const style = levelStyles[level];
    return style.color.bold(style.prefix);
}
