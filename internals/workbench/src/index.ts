import { config } from "dotenv";
import { Client, GatewayIntents } from "nyx.js";

config();

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

const client = new Client(process.env["DISCORD_TOKEN"], {
    intents: GatewayIntents.All(),
});

client.on("error", (error) => {
    console.error(`error ${new Date().toISOString()}`, error);
});

client.on("warn", (warn) => {
    console.warn(`warn ${new Date().toISOString()}`, warn);
});

client.on("debug", (debug) => {
    console.log(`debug ${new Date().toISOString()}`, debug);
});

client.on("close", (close) => {
    console.log(`close ${new Date().toISOString()}`, close);
});

client.on("ready", (ready) => {
    console.log(`ready ${new Date().toISOString()}`, ready);
});

client.on("roleCreate", (role) => {
    console.log(`roleCreate ${new Date().toISOString()}`, role);
});

void client.connect();
