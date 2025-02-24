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

gateway.on("sessionUpdate", (...args) => {
  console.log("[GATEWAY - SESSION UPDATE]", ...args);
});

gateway.on("shardUpdate", (...args) => {
  console.log("[GATEWAY - SHARD UPDATE]", ...args);
});

gateway.on("debug", (...args) => {
  console.log("[GATEWAY - DEBUG]", ...args);
});

gateway.on("error", (...args) => {
  console.log("[GATEWAY - ERROR]", ...args);
});

gateway.on("dispatch", (...args) => {
  console.log("[GATEWAY - DISPATCH]", ...args);
});

async function main(): Promise<void> {
  await gateway.connect();
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
