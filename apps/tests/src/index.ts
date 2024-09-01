import process from "node:process";
import {ApiVersions, GatewayIntents} from "@nyxjs/core";
import {config} from "dotenv";
import {CompressTypes, EncodingTypes, Gateway} from "@nyxjs/ws";

config();

const TOKEN = process.env.DISCORD_TOKEN;
if (!TOKEN) {
    throw new Error("DISCORD_TOKEN is not set in the environment variables.");
}

const gateway = new Gateway(TOKEN, {
    v: ApiVersions.V10,
    encoding: EncodingTypes.Json,
    compress: CompressTypes.ZlibStream,
    intents: GatewayIntents.Guilds | GatewayIntents.GuildMessages,
});
gateway.on("debug", console.log);
gateway.on("error", console.error);
gateway.on("warn", console.log);
gateway.on("READY", (data) => {
    console.log("READY", data);
});

void gateway.connect();
