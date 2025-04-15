import { config } from "dotenv";
import {
  ChannelType,
  Client,
  GatewayIntentsBits,
  formatUser,
  sleep,
} from "nyx.js";

const { parsed } = config({ debug: true });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("No token provided in .env file");
}

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
  encodingType: "etf",
  compressionType: "zstd-stream",
});

client.on("requestStart", (event) => {
  console.log("[REST] Request start:", event);
});

client.on("requestSuccess", (event) => {
  console.log("[REST] Request success:", event);
});

client.on("requestFailure", (event) => {
  console.log("[REST] Request failure:", event);
});

client.on("rateLimitHit", (event) => {
  console.log("[REST] Rate limit hit:", event);
});

client.on("rateLimitUpdate", (event) => {
  console.log("[REST] Rate limit update:", event);
});

client.on("rateLimitExpire", (event) => {
  console.log("[REST] Rate limit expire:", event);
});

client.on("retry", (event) => {
  console.log("[REST] Retry:", event);
});

client.on("heartbeatSent", (event) => {
  console.log("[GATEWAY] Heartbeat sent:", event);
});

client.on("heartbeatAcknowledge", (event) => {
  console.log("[GATEWAY] Heartbeat acknowledged:", event);
});

client.on("heartbeatTimeout", (event) => {
  console.log("[GATEWAY] Heartbeat timeout:", event);
});

client.on("sessionStart", (event) => {
  console.log("[GATEWAY] Session start:", event);
});

client.on("sessionResume", (event) => {
  console.log("[GATEWAY] Session resume:", event);
});

client.on("sessionInvalidate", (event) => {
  console.log("[GATEWAY] Session invalidate:", event);
});

client.on("shardReconnect", (event) => {
  console.log("[GATEWAY] Shard reconnect:", event);
});

client.on("shardResume", (event) => {
  console.log("[GATEWAY] Shard resume:", event);
});

client.on("shardReady", (event) => {
  console.log("[GATEWAY] Shard ready:", event);
});

client.on("shardDisconnect", (event) => {
  console.log("[GATEWAY] Shard disconnect:", event);
});

client.on("error", (error) => {
  console.error("[GATEWAY] Error", error);
});

client.on("dispatch", (event, data) => {
  console.log("[GATEWAY] Event dispatched", event, data);
});

client.on("ready", async (ready) => {
  console.log("[CLIENT] Client is ready: ", ready.user.id);

  await sleep(1500);

  console.log(
    "[CHANNEL] Channels:",
    client.cache.channels.map(
      // @ts-expect-error
      (channel) => `${channel.id} [${channel.name}] (${channel.type})`,
    ),
  );

  // setInterval(() => {
  //   console.log("[CLIENT] Client is still alive: ", client.cache.getStats());
  // }, 5000);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!ping") {
    try {
      await message.reply({
        content: "Pong",
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand() && interaction.interactionData.name === "ping") {
    try {
      await interaction.reply({
        content: `Pong ${formatUser(interaction.user?.id ?? client.user.id)}`,
      });
    } catch (error) {
      console.error("Failed to respond to interaction", error);
    }
  }
});

client.on("channelCreate", (channel) => {
  console.log("[CHANNEL] Channel created:", channel);

  if (channel.type === ChannelType.GuildText) {
    console.log(
      "[CHANNEL] Channel is a text channel:",
      channel,
      "parent:",
      channel.parentId,
    );
  }
});

client.on("channelUpdate", (oldChannel, newChannel) => {
  console.log("[CHANNEL] Channel updated:", oldChannel, newChannel);
});

async function main(): Promise<void> {
  await client.connect();
}

main().catch(console.error);

process.on("SIGINT", async () => {
  await client.destroy();
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection", error);
});
