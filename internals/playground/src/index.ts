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

rest.on("request", (...args) => {
  console.log("[REST - REQUEST]", ...args);
});

rest.on("debug", (...args) => {
  console.log("[REST - DEBUG]", ...args);
});

rest.on("rateLimited", (...args) => {
  console.log("[REST - RATE LIMITED]", ...args);
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
