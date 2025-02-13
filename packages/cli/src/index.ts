import { Command } from "commander";
import { init } from "./commands/index.js";

const program = new Command();

program
  .name("nyxjs")
  .description("The official CLI for Nyx.js")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new Nyx.js project")
  .action(init);

program.parse(process.argv);
