import { config } from "dotenv";
import { Client, type ClientEvents, GatewayIntentsBits } from "nyxo.js";

// Load environment variables
const { parsed } = config({ debug: true });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("No token provided in .env file");
}

// Configure the Discord client
const client = new Client({
  token: parsed.DISCORD_TOKEN,
  intents: [
    GatewayIntentsBits.Guilds,
    GatewayIntentsBits.GuildMembers,
    GatewayIntentsBits.GuildModeration,
    GatewayIntentsBits.GuildExpressions,
    GatewayIntentsBits.GuildIntegrations,
    GatewayIntentsBits.GuildWebhooks,
    GatewayIntentsBits.GuildInvites,
    GatewayIntentsBits.GuildVoiceStates,
    GatewayIntentsBits.GuildPresences,
    GatewayIntentsBits.GuildMessages,
    GatewayIntentsBits.GuildMessageReactions,
    GatewayIntentsBits.GuildMessageTyping,
    GatewayIntentsBits.DirectMessages,
    GatewayIntentsBits.DirectMessageReactions,
    GatewayIntentsBits.DirectMessageTyping,
    GatewayIntentsBits.MessageContent,
    GatewayIntentsBits.GuildScheduledEvents,
    GatewayIntentsBits.AutoModerationConfiguration,
    GatewayIntentsBits.AutoModerationExecution,
    GatewayIntentsBits.GuildMessagePolls,
    GatewayIntentsBits.DirectMessagePolls,
  ],
});

const onKeyofEvents: (keyof ClientEvents)[] = [
  "ready",
  "dispatch",
  "shardReady",
  "wsError",
  "wsClose",
  "sessionStart",
];

for (const event of onKeyofEvents) {
  client.on(event, (...args) => {
    console.log(`[CLIENT] Event ${event} triggered`, ...args);
  });
}

client.on("messageCreate", async (message) => {
  if (message.author.id === client.user.id) {
    return;
  }

  console.log("[CLIENT] Message created:", message.content);

  if (message.content === "!ping") {
    await message.reply({
      content: "Pong",
      embeds: [
        {
          title: "Test",
          description: "test",
        },
      ],
    });
  }
});

// Error handling
process.on("unhandledRejection", (error) => {
  console.error("[PROCESS] Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("[PROCESS] Uncaught exception:", error);
});

// Clean shutdown
process.on("SIGINT", async () => {
  console.log("[PROCESS] Shutting down...");

  // Destroy the Discord client
  await client.destroy();
  console.log("[PROCESS] All connections closed, exiting");
  process.exit(0);
});

// Start the bot
async function main(): Promise<void> {
  console.log("[CLIENT] Connecting to Discord...");
  await client.connect();
  console.log("[CLIENT] Connected successfully");
}

main().catch(console.error);
