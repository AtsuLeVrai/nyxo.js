import { Gateway, GatewayIntentsBits } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { config } from "dotenv";
import { VoiceManager } from "./voice.manager.js";

const env = config({ debug: true }).parsed;
if (!env?.DISCORD_TOKEN) {
  throw new Error("No env found");
}

const rest = new Rest({
  token: env.DISCORD_TOKEN,
});

rest.on("requestStart", (...args) => {
  console.log("[REST - REQUEST START]", ...args);
});

rest.on("requestComplete", (...args) => {
  console.log("[REST - REQUEST COMPLETE]", ...args);
});

rest.on("requestFailure", (...args) => {
  console.log("[REST - REQUEST FAILURE]", ...args);
});

rest.on("rateLimitHit", (...args) => {
  console.log("[REST - RATE LIMIT HIT]", ...args);
});

rest.on("rateLimitUpdate", (...args) => {
  console.log("[REST - RATE LIMIT UPDATE]", ...args);
});

rest.on("rateLimitExpire", (...args) => {
  console.log("[REST - RATE LIMIT EXPIRE]", ...args);
});

rest.on("retryAttempt", (...args) => {
  console.log("[REST - RETRY ATTEMPT]", ...args);
});

const gateway = new Gateway(rest, {
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
  compressionType: "zlib-stream",
  encodingType: "etf",
});

gateway.on("connectionStart", (...args) => {
  console.log("[GATEWAY - CONNECTION START]", ...args);
});

gateway.on("connectionComplete", (...args) => {
  console.log("[GATEWAY - CONNECTION COMPLETE]", ...args);
});

gateway.on("connectionFailure", (...args) => {
  console.log("[GATEWAY - CONNECTION FAILURE]", ...args);
});

gateway.on("payloadSend", (...args) => {
  console.log("[GATEWAY - PAYLOAD SEND]", ...args);
});

gateway.on("payloadReceive", (...args) => {
  console.log("[GATEWAY - PAYLOAD RECEIVE]", ...args);
});

gateway.on("heartbeatStart", (...args) => {
  console.log("[GATEWAY - HEARTBEAT START]", ...args);
});

gateway.on("heartbeatSend", (...args) => {
  console.log("[GATEWAY - HEARTBEAT SEND]", ...args);
});

gateway.on("heartbeatAck", (...args) => {
  console.log("[GATEWAY - HEARTBEAT ACK]", ...args);
});

gateway.on("heartbeatTimeout", (...args) => {
  console.log("[GATEWAY - HEARTBEAT TIMEOUT]", ...args);
});

gateway.on("sessionStart", (...args) => {
  console.log("[GATEWAY - SESSION START]", ...args);
});

gateway.on("sessionInvalid", (...args) => {
  console.log("[GATEWAY - SESSION INVALID]", ...args);
});

gateway.on("sessionResume", (...args) => {
  console.log("[GATEWAY - SESSION RESUME]", ...args);
});

gateway.on("shardCreate", (...args) => {
  console.log("[GATEWAY - SHARD CREATE]", ...args);
});

gateway.on("shardReady", (...args) => {
  console.log("[GATEWAY - SHARD READY]", ...args);
});

gateway.on("shardDisconnect", (...args) => {
  console.log("[GATEWAY - SHARD DISCONNECT]", ...args);
});

gateway.on("shardReconnect", (...args) => {
  console.log("[GATEWAY - SHARD RECONNECT]", ...args);
});

gateway.on("shardGuildAdd", (...args) => {
  console.log("[GATEWAY - SHARD GUILD ADD]", ...args);
});

gateway.on("shardGuildRemove", (...args) => {
  console.log("[GATEWAY - SHARD GUILD REMOVE]", ...args);
});

gateway.on("shardRateLimit", (...args) => {
  console.log("[GATEWAY - SHARD RATE LIMIT]", ...args);
});

gateway.on("sessionLimitUpdate", (...args) => {
  console.log("[GATEWAY - SESSION LIMIT UPDATE]", ...args);
});

gateway.on("error", (...args) => {
  console.error("[GATEWAY - ERROR]", ...args);
});

const _voice = new VoiceManager(gateway);

gateway.on("dispatch", async (event, data) => {
  console.log("[GATEWAY - DISPATCH]", event, data);

  // if (event === "INTERACTION_CREATE") {
  //   const interaction = data as AnyInteractionEntity;
  //
  //   if (
  //     interaction.data?.type === InteractionType.ApplicationCommand &&
  //     interaction.data.name === "join"
  //   ) {
  //     voice.joinVoiceChannel("936969912600121384", "1232694742350041089");
  //     await new Promise((resolve) => setTimeout(resolve, 5000));
  //     await voice.playAudio("936969912600121384", "./src/song.mp3");
  //   }
  // }
});

// const commands: CreateGlobalApplicationCommandSchema[] = [
//   {
//     name: "join",
//     description: "Join the voice channel",
//   },
// ];

async function main(): Promise<void> {
  await gateway.connect();
  // await rest.commands.bulkOverwriteGuildApplicationCommands(
  //   "1011252785989308526",
  //   "936969912600121384",
  //   commands,
  // );
}

main().catch((error) => {
  console.error("Application failed to start:", error);
  process.exit(1);
});

async function shutdown(): Promise<void> {
  try {
    await rest.destroy();
    gateway.destroy();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", async (error) => {
  console.error("Uncaught exception:", error);
  await shutdown();
});
