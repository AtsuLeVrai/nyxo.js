import { Command } from "commander";
import { build, dev, init, start } from "./commands/index.js";

const program = new Command();

program
  .name("nyxjs")
  .description("The official CLI for Nyx.js")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new Nyx.js project")
  .action(init);

program.command("start").description("Start the Nyx.js project").action(start);

program
  .command("dev")
  .description("Start the Nyx.js project in development mode")
  .action(dev);

program.command("build").description("Build the Nyx.js project").action(build);

program.parse(process.argv);

export * from "./commands/index.js";
export * from "./options/index.js";
export * from "./utils/index.js";
