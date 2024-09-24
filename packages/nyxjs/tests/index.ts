import { config } from "dotenv";
import { Client, EncodingTypes, GatewayIntents } from "../src";

config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("No token provided");
}

const client = new Client(process.env.DISCORD_TOKEN, {
    intents: [GatewayIntents.Guilds],
    ws: {
        encoding: EncodingTypes.Etf,
    },
});

client.ws.on("debug", console.log);
client.ws.on("error", console.log);
client.ws.on("warn", console.log);
client.ws.on("close", console.log);

void client.connect();
