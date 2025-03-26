import { Gateway, GatewayIntentsBits } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { config } from "dotenv";

const { parsed } = config({ debug: true });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("No token provided in .env file");
}

const rest = new Rest({
  token: parsed.DISCORD_TOKEN,
});

rest.on("requestStart", (event) => {
  console.log("[REST] Request started", event);
});

rest.on("requestComplete", (event) => {
  console.log("[REST] Request completed", event);
});

rest.on("requestFailure", (event) => {
  console.log("[REST] Request failed", event);
});

rest.on("rateLimitHit", (event) => {
  console.log("[REST] Rate limit hit", event);
});

rest.on("rateLimitUpdate", (event) => {
  console.log("[REST] Rate limit updated", event);
});

rest.on("rateLimitExpire", (event) => {
  console.log("[REST] Rate limit expired", event);
});

rest.on("retryAttempt", (event) => {
  console.log("[REST] Retry attempt", event);
});

rest.on("queueAdd", (event) => {
  console.log("[REST] Queue add", event);
});

rest.on("queueProcess", (event) => {
  console.log("[REST] Queue process", event);
});

rest.on("queueComplete", (event) => {
  console.log("[REST] Queue complete", event);
});

rest.on("queueTimeout", (event) => {
  console.log("[REST] Queue timeout", event);
});

rest.on("queueState", (event) => {
  console.log("[REST] Queue state", event);
});

rest.on("queueReject", (event) => {
  console.log("[REST] Queue reject", event);
});

const gateway = new Gateway(rest, {
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

gateway.on("connectionStart", (event) => {
  console.log("[GATEWAY] Connection started", event);
});

gateway.on("connectionComplete", (event) => {
  console.log("[GATEWAY] Connection completed", event);
});

gateway.on("connectionFailure", (event) => {
  console.log("[GATEWAY] Connection failed", event);
});

gateway.on("payloadSend", (event) => {
  console.log("[GATEWAY] Payload sent", event);
});

gateway.on("payloadReceive", (event) => {
  console.log("[GATEWAY] Payload received", event);
});

gateway.on("heartbeatStart", (event) => {
  console.log("[GATEWAY] Heartbeat started", event);
});

gateway.on("heartbeatSend", (event) => {
  console.log("[GATEWAY] Heartbeat sent", event);
});

gateway.on("heartbeatAck", (event) => {
  console.log("[GATEWAY] Heartbeat acknowledged", event);
});

gateway.on("heartbeatTimeout", (event) => {
  console.log("[GATEWAY] Heartbeat timed out", event);
});

gateway.on("sessionStart", (event) => {
  console.log("[GATEWAY] Session started", event);
});

gateway.on("sessionInvalid", (event) => {
  console.log("[GATEWAY] Session invalidated", event);
});

gateway.on("sessionResume", (event) => {
  console.log("[GATEWAY] Session resumed", event);
});

gateway.on("shardCreate", (event) => {
  console.log("[GATEWAY] Shard created", event);
});

gateway.on("shardReady", (event) => {
  console.log("[GATEWAY] Shard ready", event);
});

gateway.on("shardDisconnect", (event) => {
  console.log("[GATEWAY] Shard disconnected", event);
});

gateway.on("shardReconnect", (event) => {
  console.log("[GATEWAY] Shard reconnected", event);
});

gateway.on("shardGuildAdd", (event) => {
  console.log("[GATEWAY] Guild added to shard", event);
});

gateway.on("shardGuildRemove", (event) => {
  console.log("[GATEWAY] Guild removed from shard", event);
});

gateway.on("shardRateLimit", (event) => {
  console.log("[GATEWAY] Shard rate limited", event);
});

gateway.on("sessionLimitUpdate", (event) => {
  console.log("[GATEWAY] Session limit updated", event);
});

gateway.on("error", (error) => {
  console.error("[GATEWAY] Error occurred", error);
});

gateway.on("circuitStateChange", (event) => {
  console.log("[GATEWAY] Circuit state changed", event);
});

gateway.on("circuitBlocked", (event) => {
  console.log("[GATEWAY] Circuit blocked", event);
});

gateway.on("circuitFailure", (event) => {
  console.log("[GATEWAY] Circuit failure", event);
});

gateway.on("dispatch", (event, data) => {
  console.log("[GATEWAY] Event dispatched", event, data);
});

async function main(): Promise<void> {
  await gateway.connect();
}

main().catch(console.error);

process.on("SIGINT", async () => {
  await rest.destroy();
  await gateway.destroy();
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection", error);
});
