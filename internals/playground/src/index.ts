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

rest.on("rateLimited", (...args) => {
  console.log("[REST - RATE LIMITED]", ...args);
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

rest.on("sessionCreated", (...args) => {
  console.log("[REST - SESSION CREATED]", ...args);
});

rest.on("sessionDestroyed", (...args) => {
  console.log("[REST - SESSION DESTROYED]", ...args);
});

rest.on("sessionUpdated", (...args) => {
  console.log("[REST - SESSION UPDATED]", ...args);
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
  encodingType: "etf",
  compression: {
    compressionType: "zstd-stream",
  },
});

gateway.on("debug", (...args) => {
  console.log("[GATEWAY - DEBUG]", ...args);
});

gateway.on("error", (...args) => {
  console.log("[GATEWAY - ERROR]", ...args);
});

gateway.on("heartbeatUpdate", (...args) => {
  console.log("[GATEWAY - HEARTBEAT]", ...args);
});

gateway.on("sessionUpdate", (...args) => {
  console.log("[GATEWAY - SESSION]", ...args);
});

gateway.on("healthUpdate", (...args) => {
  console.log("[GATEWAY - HEALTH]", ...args);
});

gateway.on("shardUpdate", (...args) => {
  console.log("[GATEWAY - SHARD]", ...args);
});

gateway.on("dispatch", (...args) => {
  console.log("[GATEWAY - DISPATCH]", ...args);
});

gateway.connect();

// async function main(): Promise<void> {
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
//   await rest.users.getCurrentUserGuilds();
// }
//
// main();

process.on("SIGINT", () => {
  gateway.destroy();
  rest.destroy();
});

process.on("SIGTERM", () => {
  gateway.destroy();
  rest.destroy();
});

process.on("unhandledRejection", (error) => {
  console.error(error);
});

process.on("uncaughtException", (error) => {
  console.error(error);
});
