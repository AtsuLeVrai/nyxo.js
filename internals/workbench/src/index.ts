import { config } from "dotenv";
import { ClientWorkBench } from "./client.js";
import { WorkBenchClientOptions } from "./config.js";

config();

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

process.on("unhandledRejection", (error) => {
    console.error(error);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.error(error);
    process.exit(1);
});

const workBench = new ClientWorkBench(process.env["DISCORD_TOKEN"], WorkBenchClientOptions);

void workBench.start();
