import { Gateway, GatewayIntentsBits } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { config } from "dotenv";

const env = config({ debug: true }).parsed;
if (!env?.DISCORD_TOKEN) {
  throw new Error("No env found");
}

const rest = new Rest({
  token: env.DISCORD_TOKEN,
});

rest.on("error", (...args) => {
  console.log("[REST - ERROR]", ...args);
});

rest.on("requestFinish", (...args) => {
  console.log("[REST - REQUEST]", ...args);
});

rest.on("retryAttempt", (...args) => {
  console.log("[REST - RETRY]", ...args);
});

rest.on("debug", (...args) => {
  console.log("[REST - DEBUG]", ...args);
});

rest.on("rateLimitExceeded", (...args) => {
  console.log("[REST - RATE LIMIT EXCEEDED]", ...args);
});

rest.on("bucketExpired", (...args) => {
  console.log("[REST - BUCKET EXPIRED]", ...args);
});

rest.on("bucketCreated", (...args) => {
  console.log("[REST - BUCKET CREATED]", ...args);
});

rest.on("bucketUpdated", (...args) => {
  console.log("[REST - BUCKET UPDATED]", ...args);
});

const gateway = new Gateway(rest, {
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

gateway.on("error", (...args) => {
  console.log("[GATEWAY - ERROR]", ...args);
});

gateway.on("debug", (...args) => {
  console.log("[GATEWAY - DEBUG]", ...args);
});

gateway.on("dispatch", (event, data) => {
  console.log("[GATEWAY - DISPATCH]", event, data);
});

gateway.on("healthStatus", (health) => {
  console.log("[GATEWAY - HEALTH STATUS]", health);
});

gateway.on("sessionState", (session) => {
  console.log("[GATEWAY - SESSION STATE]", session);
});

gateway.on("sessionClose", (session) => {
  console.log("[GATEWAY - SESSION CLOSE]", session);
});

gateway.on("sessionInvalid", (session) => {
  console.log("[GATEWAY - SESSION INVALID]", session);
});

gateway.on("shardSpawn", (stats) => {
  console.log("[GATEWAY - SHARD SPAWN]", stats);
});

gateway.on("shardDestroy", (stats) => {
  console.log("[GATEWAY - SHARD DESTROY]", stats);
});

gateway.on("shardReady", (data) => {
  console.log("[GATEWAY - SHARD READY]", data);
});

gateway.on("shardDisconnect", (data) => {
  console.log("[GATEWAY - SHARD DISCONNECT]", data);
});

gateway.on("shardReconnect", (data) => {
  console.log("[GATEWAY - SHARD RECONNECT]", data);
});

gateway.on("shardResume", (data) => {
  console.log("[GATEWAY - SHARD RESUME]", data);
});

gateway.on("shardRateLimit", (data) => {
  console.log("[GATEWAY - SHARD RATE LIMIT]", data);
});

gateway.connect();

process.on("unhandledRejection", (error) => {
  console.error(error);
});

process.on("uncaughtException", (error) => {
  console.error(error);
});
