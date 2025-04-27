import { config } from "dotenv";
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonEntity,
  ButtonStyle,
  Client,
  Colors,
  EmbedBuilder,
  GatewayIntentsBits,
  type MessageCreateV1Options,
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

client.on("ready", (ready) => {
  console.log("[CLIENT] Ready", ready.user.id);
});

client.on("dispatch", (event, data) => {
  console.log("[CLIENT] Dispatch event", event, data);
});

client.on("wsClose", (code, reason) => {
  console.log("[CLIENT] WebSocket closed", code, reason);
});

client.on("wsError", (error) => {
  console.error("[CLIENT] WebSocket error", error);
});

client.on("sessionStart", (data) => {
  console.log("[CLIENT] Session started", data);
});

client.on("requestSuccess", (request) => {
  console.log("[CLIENT] Request successful", request);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!ping") {
    const embed = new EmbedBuilder()
      .setTitle("Pong!")
      .setDescription("This is a test embed")
      .setColor(Colors.Green)
      .setTimestamp()
      .build();

    const button = new ButtonBuilder()
      .setCustomId("test_button")
      .setLabel("Test Button")
      .setStyle(ButtonStyle.Success)
      .build();

    const actionRow = new ActionRowBuilder<ButtonEntity>()
      .addComponents(button)
      .build();

    const options: Omit<MessageCreateV1Options, "message_reference"> = {
      embeds: [embed],
      components: [actionRow],
    };

    await message.reply(options);
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
  await client.gateway.connect();
  console.log("[CLIENT] Connected successfully");
}

main().catch(console.error);
