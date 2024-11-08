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

import { ApiVersions, GatewayIntents } from "@nyxjs/core";
import { CompressTypes, EncodingTypes, Gateway, type ReadyEventFields } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { config } from "dotenv";

const env = config();

if (!env.parsed?.["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

const rest = new Rest(env.parsed["DISCORD_TOKEN"], {
    version: ApiVersions.V10,
});

const gateway = new Gateway(env.parsed["DISCORD_TOKEN"], rest, {
    encoding: EncodingTypes.Etf,
    compress: CompressTypes.ZlibStream,
    intents: GatewayIntents.all(),
    v: ApiVersions.V10,
    shard: "auto",
});

async function start() {
    const startTime = process.hrtime.bigint();

    rest.on("debug", console.log);
    rest.on("error", console.error);
    rest.on("warn", console.warn);

    gateway.on("debug", console.log);
    gateway.on("error", console.error);
    gateway.on("warn", console.warn);
    gateway.on("close", console.warn);
    gateway.on("dispatch", (event, data) => {
        if (event === "READY") {
            const endTime = process.hrtime.bigint();
            const timeInMs = Number(endTime - startTime) / 1_000_000;

            console.log(`Connection completed in ${timeInMs.toFixed(2)}ms`);
            console.log(`READY ${(data as ReadyEventFields).user.id}`);
        }
    });
    await gateway.connect();
}

start().catch(console.error);
