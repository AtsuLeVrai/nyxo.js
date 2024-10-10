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
    gateway: {
        shard: "auto",
    },
});

client.on("error", (error) => console.error("Error:", error));
client.on("warn", (warning) => console.warn("Warning:", warning));
client.on("debug", (info) => console.debug("Debug:", info));
client.on("close", (code, reason) => console.log("Connection closed:", code, reason));
client.on("ready", () => console.log("Client is ready"));

void client.connect();

const embed = new EmbedBuilder()
    .setTitle("Hello, world!")
    .setDescription("This is an embed")
    .setColor("#232323")
    .addFields(
        { name: "Field 2", value: "Value 2", inline: true },
        {
            name: "Field 3",
            value: "Value 3",
            inline: true,
        },
        { name: "Field 1", value: "Value 1", inline: true }
    )
    .setFooter({
        text: "This is a footer",
    })
    .setTimestamp();

console.log(embed.toJSON());
