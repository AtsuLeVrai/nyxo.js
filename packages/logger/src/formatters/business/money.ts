import chalk from "chalk";

export function formatMoney(amount: number, currency = "USD"): string {
    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount);
    return amount >= 0 ? chalk.green(formatted) : chalk.red(formatted);
}
