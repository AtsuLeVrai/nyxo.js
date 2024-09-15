import process from "node:process";
import { config } from "dotenv";
import { ApiVersions, GatewayIntents } from "nyx.js";
import { ClientTest } from "./client";

config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN is not defined");
}

const client = new ClientTest(process.env.DISCORD_TOKEN, {
    intents: [GatewayIntents.Guilds],
    version: ApiVersions.V10,
    shard: "auto",
});

client.connect();
