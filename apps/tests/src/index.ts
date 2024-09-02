import { config } from "dotenv";
import { ApiVersions, Client, GatewayIntents } from "nyx.js";

config();

if (!process.env.DISCORD_TOKEN) {
	throw new Error("No discord token provided");
}

const client = new Client(process.env.DISCORD_TOKEN, {
	intents: [GatewayIntents.Guilds],
	version: ApiVersions.V10,
});

client.on("ready", () => {
	console.log("Ready");
});

client.on("interactionCreate", (interaction) => {
	console.log(interaction);
});
