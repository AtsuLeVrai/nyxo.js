import { config } from "dotenv";
import { Client, GatewayIntents } from "nyx.js";

config();

if (!process.env.DISCORD_TOKEN) {
  throw new Error("No discord token provided");
}

const client = new Client(process.env.DISCORD_TOKEN, {
  intents: [GatewayIntents.Guilds],
});

client.on("ready", (ready) => {
  console.log("Ready");
});

client.on("debug", (message) => {
  console.debug(message);
});

client.on("interactionCreate", (interaction) => {
  console.log();
});

client.connect();
