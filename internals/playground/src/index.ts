import { config } from "dotenv";
import { Client, GatewayIntentsBits } from "nyx.js";

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

client.on("request", (...args) => {
  console.log("[REQUEST]", ...args);
});

client.on("rateLimited", (...args) => {
  console.log("[RATELIMITED]", ...args);
});

client.on("debug", (...args) => {
  console.log("[DEBUG]", ...args);
});

client.on("error", (...args) => {
  console.log("[ERROR]", ...args);
});

client.on("heartbeatUpdate", (...args) => {
  console.log("[HEARTBEAT]", ...args);
});

client.on("sessionUpdate", (...args) => {
  console.log("[SESSION]", ...args);
});

client.on("healthUpdate", (...args) => {
  console.log("[HEALTH]", ...args);
});

client.on("shardUpdate", (...args) => {
  console.log("[SHARD]", ...args);
});

client.on("dispatch", (...args) => {
  console.log("[DISPATCH]", ...args);
});

// client.on("ready", (data) => {
//   console.log("Ready", data);
// });

client.connect().catch(console.error);
