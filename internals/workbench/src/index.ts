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
import { formatInfoLog } from "@nyxjs/utils";
import { config } from "dotenv";

const env = config();

if (!env.parsed?.["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

const rest = new Rest(env.parsed["DISCORD_TOKEN"], {
    version: ApiVersions.V10,
});

const gateway = new Gateway(env.parsed["DISCORD_TOKEN"], rest, {
    encoding: EncodingTypes.Json,
    compress: CompressTypes.ZlibStream,
    intents: GatewayIntents.all(),
    v: ApiVersions.V10,
});

async function start() {
    gateway.on("debug", console.log);
    gateway.on("dispatch", (event, data) => {
        if (event === "READY") {
            console.log(formatInfoLog(`READY ${(data as ReadyEventFields).user.id}`));
        }
    });
    await gateway.connect();
}

start().catch(console.error);
