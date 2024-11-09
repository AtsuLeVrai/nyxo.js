// import { config } from "dotenv";
// import { WorkBench } from "./client.js";
// import { WorkBenchClientOptions } from "./config.js";
// import { logger } from "./utils/index.js";
//
// config();
//
// if (!process.env["DISCORD_TOKEN"]) {
//     throw new Error("no discord token");
// }
//
// process.on("unhandledRejection", (error) => {
//     logger.error(error);
//     process.exit(1);
// });
//
// process.on("uncaughtException", (error) => {
//     logger.error(error);
//     process.exit(1);
// });
//
// const workBench = new WorkBench(process.env["DISCORD_TOKEN"], WorkBenchClientOptions);
// void workBench.start();

import { GatewayIntents } from "@nyxjs/core";
import { config } from "dotenv";
import { Client } from "nyx.js";

const env = config();

if (!env.parsed?.["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

const client = new Client(env.parsed["DISCORD_TOKEN"], {
    intents: GatewayIntents.all(),
});

async function start() {
    const startTime = process.hrtime.bigint();

    client.on("debug", console.log);
    client.on("error", console.error);
    client.on("warn", console.warn);

    client.on("ready", (ready) => {
        const endTime = process.hrtime.bigint();
        const timeInMs = Number(endTime - startTime) / 1_000_000;

        console.log(`Connection completed in ${timeInMs.toFixed(2)}ms`);
        console.log(`READY ${ready.user?.id}`);
    });

    await client.connect();
}

start().catch(console.error);
