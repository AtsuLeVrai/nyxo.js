import process from "node:process";
import { config } from "dotenv";
import { Client, EmbedBuilder, GatewayIntents } from "nyx.js";

config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const client = new Client(process.env.DISCORD_TOKEN, {
    intents: [
        GatewayIntents.Guilds,
        GatewayIntents.GuildMembers,
        GatewayIntents.GuildModeration,
        GatewayIntents.GuildEmojisAndStickers,
        GatewayIntents.GuildIntegrations,
        GatewayIntents.GuildWebhooks,
        GatewayIntents.GuildInvites,
        GatewayIntents.GuildVoiceStates,
        GatewayIntents.GuildPresences,
        GatewayIntents.GuildMessages,
        GatewayIntents.GuildMessageReactions,
        GatewayIntents.GuildMessageTyping,
        GatewayIntents.DirectMessages,
        GatewayIntents.DirectMessageReactions,
        GatewayIntents.DirectMessageTyping,
        GatewayIntents.MessageContent,
        GatewayIntents.GuildScheduledEvents,
        GatewayIntents.AutoModerationConfiguration,
        GatewayIntents.AutoModerationExecution,
        GatewayIntents.GuildMessagePolls,
        GatewayIntents.DirectMessagePolls,
    ],
});

client.on("error", (error) => console.error("Error:", error));
client.on("warn", (warning) => console.warn("Warning:", warning));
client.on("debug", (info) => console.debug("Debug:", info));
client.on("close", (code, reason) => console.log("Connection closed:", code, reason));
client.on("ready", () => console.log("Client is ready"));

void client.connect();

const embed = new EmbedBuilder({
    title: "TITLE_LIMIT",
});

console.log(embed.toJSON());
