import { Gateway, GatewayIntentsBits } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { config } from "dotenv";

const env = config().parsed;
if (!env?.DISCORD_TOKEN) {
  throw new Error("No environment variables found");
}

const rest = new Rest({
  token: env.DISCORD_TOKEN,
});

rest.on("cloudflareWarning", (message) => {
  console.warn("[Rest:Cloudflare]", message);
});

rest.on("cloudflareBan", (message) => {
  console.warn("[Rest:Cloudflare]", message);
});

rest.on("invalidRequestWarning", (message) => {
  console.warn("[Rest:InvalidRequest]", message);
});

rest.on("response", (path, method, statusCode, latency, requestId) => {
  console.log("[Rest:Response]", path, method, statusCode, latency, requestId);
});

rest.on("request", (path, method, requestId, options) => {
  console.log("[Rest:Request]", path, method, requestId, options);
});

rest.on("rateLimited", (message) => {
  console.warn("[Rest:RateLimit]", message);
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

gateway.on("error", (error) => {
  console.error("[Gateway:Error]", error);
});

gateway.on("warn", (message) => {
  console.warn("[Gateway:Warn]", message);
});

gateway.on("debug", (message) => {
  console.log("[Gateway:Debug]", message);
});

gateway.on("close", (code) => {
  console.log("[Gateway:Close]", code);
});

gateway.on("sessionEnd", (sessionId, code) => {
  console.log("[Gateway:SessionEnd]", sessionId, code);
});

gateway.on("sessionInvalid", (resumable) => {
  console.log("[Gateway:SessionInvalid]", resumable);
});

gateway.on("sessionStart", (sessionId, data) => {
  console.log("[Gateway:SessionStart]", sessionId, data);
});

gateway.on("shardSpawn", (shardId) => {
  console.log("[Gateway:ShardSpawn]", shardId);
});

gateway.on("shardReady", (shardId) => {
  console.log("[Gateway:ShardReady]", shardId);
});

gateway.on("shardDisconnect", (shardId) => {
  console.log("[Gateway:ShardDisconnect]", shardId);
});

gateway.on("shardReconnect", (shardId) => {
  console.log("[Gateway:ShardReconnect]", shardId);
});

gateway.on("shardResume", (shardId) => {
  console.log("[Gateway:ShardResume]", shardId);
});

gateway.on("connecting", (attempt) => {
  console.log("[Gateway:Connecting]", attempt);
});

gateway.on("connected", () => {
  console.log("[Gateway:Connected]");
});

gateway.on("reconnecting", (attempt) => {
  console.log("[Gateway:Reconnecting]", attempt);
});

async function main(): Promise<void> {
  const start = Date.now();
  await gateway.connect();

  gateway.on("dispatch", (event, data) => {
    console.log("[Gateway:Event]", event, data);

    if (event === "READY") {
      console.log("Connected in", Date.now() - start, "ms");
    }
  });
}

main().catch(console.error);
