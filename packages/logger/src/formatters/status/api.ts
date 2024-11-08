import chalk from "chalk";

export type ApiStatus = "online" | "offline" | "degraded" | "maintenance";

export function formatApiStatus(status: ApiStatus): string {
    const statuses: Record<ApiStatus, string> = {
        online: `${chalk.green("●")} Online`,
        offline: `${chalk.red("●")} Offline`,
        degraded: `${chalk.yellow("●")} Degraded`,
        maintenance: `${chalk.blue("●")} Maintenance`,
    };

    return statuses[status] || `${chalk.gray("●")} Unknown`;
}
