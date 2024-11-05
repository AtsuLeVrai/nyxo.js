#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import packageJson from "../package.json" assert { type: "json" };
import { init } from "./init.js";

const program = new Command()
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version, "-v, --version", "Output the current version of Nyx.js CLI")
    .action(init);

program.exitOverride((err) => {
    if (err.code === "commander.unknownCommand") {
        console.error(chalk.red("Unknown command! Use --help to see available commands."));
    }
});

program.addHelpText(
    "before",
    chalk.cyanBright("\nWelcome to the Nyx.js CLI - Simplify your project tasks with ease!\n"),
);

program.parse(process.argv);

process.on("SIGINT", () => process.exit(0));

process.on("SIGTERM", () => process.exit(0));
