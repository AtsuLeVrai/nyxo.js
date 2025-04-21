import { config } from "dotenv";
import {
  Client,
  type ClientEvents,
  Colors,
  EmbedBuilder,
  GatewayIntentsBits,
} from "nyxo.js";

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

client.on("ready", (ready) => {
  console.log("[CLIENT] Ready", ready.user.id);
});

client.on("messageCreate", async (message) => {
  if (message.author.id === client.user.id) {
    return;
  }

  console.log("[CLIENT] Message created:", message.content);

  if (message.content === "!ping") {
    const firstEmbed = new EmbedBuilder()
      .setTitle("Test")
      .setDescription("test")
      .setColor(Colors.Green)
      .setTimestamp()
      .build();

    const secondEmbed = new EmbedBuilder()
      .setTitle("Test 2 ")
      .setDescription("test 2 ")
      .setColor(Colors.Blue)
      .setTimestamp()
      .build();

    const thirdEmbed = new EmbedBuilder()
      .setTitle("Test 3 ")
      .setDescription("test 3 ")
      .setColor(Colors.Red)
      .setTimestamp()
      .build();

    await message.reply({
      content: "Pong",
      embeds: [firstEmbed, secondEmbed, thirdEmbed],
    });
  }

  if (message.content === "!send") {
    await message.author.send("Hello, world!");
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
