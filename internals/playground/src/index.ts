import { config } from "dotenv";
import {
  ApplicationCommandOptionType,
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
  compressionType: "zstd-stream",
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

client.on("sessionUpdate", (session) => {
  console.log("[SESSION UPDATE]", session);
});

client.on("shardUpdate", (stats) => {
  console.log("[SHARD UPDATE]", stats);
});

client.on("cacheHit", (data) => {
  console.log("[CACHE HIT]", data);
});

client.on("cacheMiss", (data) => {
  console.log("[CACHE MISS]", data);
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
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "name",
        description: "Your name",
      },
    ],
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
  console.log("[INTERACTION]", interaction);
  if (
    !(interaction.isApplicationCommand() || interaction.isGuildInteraction())
  ) {
    return;
  }

  if (interaction.commandName === "ping") {
    await interaction.reply({
      content: `Pong! ${interaction.getUserOption("name")}`,
    });
  }
});

async function shutdown(): Promise<void> {
  console.log("Shutdown in progress...");

  try {
    // Clean gateway disconnection
    await client.destroy();
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
client.connect();
