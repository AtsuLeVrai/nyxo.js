import { config } from "dotenv";
import { ApiVersions, Client, CompressTypes, EncodingTypes, GatewayIntents, Logger } from "nyx.js";

const env = config();

if (!env.parsed?.["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

let startTime = 0;

const client = new Client(env.parsed["DISCORD_TOKEN"], {
    compress: CompressTypes.ZlibStream,
    encoding: EncodingTypes.Json,
    intents: GatewayIntents.all(),
    version: ApiVersions.V10,
});

client.on("error", console.log);
client.on("debug", console.log);
client.on("warn", console.log);
client.on("missedAck", console.log);
client.on("close", console.log);

client.on("ready", (ready) => {
    const connectionTime = performance.now() - startTime;
    console.log(Logger.info(`Connected in ${connectionTime}ms`));
    console.log(Logger.success(`Client: ${ready.user?.id} is ready`));
});

startTime = performance.now();
client.connect().catch(console.error);

process.on("unhandledRejection", () => {
    process.exit(1);
});

process.on("uncaughtException", () => {
    process.exit(1);
});
