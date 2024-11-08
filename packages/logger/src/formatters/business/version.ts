import chalk from "chalk";
import { PATTERNS } from "../../constants/index.js";

export function formatVersion(version: string): string {
    return version.replace(
        PATTERNS.version,
        (_, major, minor, patch, prerelease) =>
            `${chalk.red(major)}.${chalk.yellow(minor)}.${chalk.green(patch)}${
                prerelease ? chalk.gray(prerelease) : ""
            }`,
    );
}
