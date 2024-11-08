import { stripVTControlCharacters } from "node:util";
import chalk from "chalk";

export function formatTable(data: Record<string, unknown>[]): string {
    if (!data || data.length === 0) {
        return "";
    }

    const firstItem = data[0];
    if (!firstItem) {
        return "";
    }

    const headers = Object.keys(firstItem);
    if (headers.length === 0) {
        return "";
    }

    const rows = data.map((item) => headers.map((header) => String(item[header] ?? "")));
    const colWidths = headers.map((header, i) => {
        const columnValues = rows.map((row) => row[i] || "");
        return Math.max(header.length, ...columnValues.map((value) => value.length)) + 2;
    });

    const headerRow = headers.map((header, i) => chalk.bold(header.padEnd(colWidths[i] || 0))).join(" ");
    const formattedRows = rows.map((row) => row.map((cell, i) => cell.padEnd(colWidths[i] || 0)).join(" "));

    return [headerRow, "-".repeat(stripVTControlCharacters(headerRow).length), ...formattedRows].join("\n");
}
