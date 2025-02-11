import { config } from "dotenv";
import {
  Client,
  type CreateGlobalApplicationCommandSchema,
  GatewayIntentsBits,
  Guild,
} from "nyx.js";

const env = config({ debug: true }).parsed;
if (!env?.DISCORD_TOKEN) {
  throw new Error("No env found");
}

const client = new Client({
  token: env.DISCORD_TOKEN,
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

client.on("error", (...args) => {
  console.log("[ERROR]", ...args);
});

client.on("requestFinish", (...args) => {
  console.log("[REQUEST]", ...args);
});

client.on("retryAttempt", (...args) => {
  console.log("[RETRY]", ...args);
});

client.on("debug", (...args) => {
  console.log("[DEBUG]", ...args);
});

client.on("rateLimitExceeded", (...args) => {
  console.log("[RATE LIMIT EXCEEDED]", ...args);
});

client.on("bucketExpired", (...args) => {
  console.log("[BUCKET EXPIRED]", ...args);
});

client.on("bucketCreated", (...args) => {
  console.log("[BUCKET CREATED]", ...args);
});

client.on("bucketUpdated", (...args) => {
  console.log("[BUCKET UPDATED]", ...args);
});

// client.on("dispatch", (event, data) => {
//   console.log("[DISPATCH]", event, data);
// });

client.on("healthStatus", (health) => {
  console.log("[HEALTH STATUS]", health);
});

client.on("sessionState", (session) => {
  console.log("[SESSION STATE]", session);
});

client.on("sessionClose", (session) => {
  console.log("[SESSION CLOSE]", session);
});

client.on("sessionInvalid", (session) => {
  console.log("[SESSION INVALID]", session);
});

client.on("shardSpawn", (stats) => {
  console.log("[SHARD SPAWN]", stats);
});

client.on("shardDestroy", (stats) => {
  console.log("[SHARD DESTROY]", stats);
});

client.on("shardReady", (data) => {
  console.log("[SHARD READY]", data);
});

client.on("shardDisconnect", (data) => {
  console.log("[SHARD DISCONNECT]", data);
});

client.on("shardReconnect", (data) => {
  console.log("[SHARD RECONNECT]", data);
});

client.on("shardResume", (data) => {
  console.log("[SHARD RESUME]", data);
});

client.on("shardRateLimit", (data) => {
  console.log("[SHARD RATE LIMIT]", data);
});

client.on("ready", (ready) => {
  console.log(
    "[READY] Bot is ready",
    ready.guilds.map((guild) => guild.id),
  );
});

const APPLICATION_COMMANDS: CreateGlobalApplicationCommandSchema[] = [
  {
    name: "ping",
    description: "Ping the bot",
  },
];

client.on("guildCreate", async (guild) => {
  if (!(guild instanceof Guild)) {
    return;
  }

  await client.rest.commands.bulkOverwriteGuildApplicationCommands(
    client.token.id,
    guild.id,
    APPLICATION_COMMANDS,
  );

  console.log(
    "[GUILD CREATE]",
    guild.channels.map((channel) => channel.toJson()),
  );
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isApplicationCommand()) {
    return;
  }

  if (interaction.commandName === "ping") {
    await interaction.reply({
      content: "Pong!",
    });
  }
});

function shutdown(): void {
  console.log("Shutdown in progress...");

  try {
    // Clean gateway disconnection
    client.destroy();
    console.log("Shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown(); // Attempt clean shutdown on fatal error
});

// Connect to gateway
client.gateway.connect();
