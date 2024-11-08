import { stripVTControlCharacters } from "node:util";
import chalk from "chalk";
import { highlightStyles } from "../../constants/index.js";

export function formatDetails(details: Record<string, unknown>): string {
    try {
        return Object.entries(details)
            .map(([key, value]) => {
                const formattedValue = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
                const cleanValue = stripVTControlCharacters(formattedValue);
                const hasAnsiCodes = formattedValue !== cleanValue;
                const finalValue = hasAnsiCodes ? formattedValue : cleanValue;
                return `${highlightStyles.details(`${key}:`)} ${finalValue}`;
            })
            .join("\n  ");
    } catch (_error) {
        return chalk.red("[Error formatting details]");
    }
}
