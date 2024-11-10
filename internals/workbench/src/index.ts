import { config } from "dotenv";
import { WorkBench } from "./client.js";
import { WorkBenchClientOptions } from "./config.js";
import { logger } from "./utils/index.js";

config();

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

process.on("unhandledRejection", (error) => {
    logger.error(error);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    logger.error(error);
    process.exit(1);
});

const workBench = new WorkBench(process.env["DISCORD_TOKEN"], WorkBenchClientOptions);
void workBench.start();
