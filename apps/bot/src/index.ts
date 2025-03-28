import {
  ButtonStyle,
  ComponentType,
  EmbedType,
  type MessageEntity,
} from "@nyxjs/core";
import { Gateway, GatewayIntentsBits } from "@nyxjs/gateway";
import { ApiError, Rest } from "@nyxjs/rest";
import { config } from "dotenv";

const { parsed } = config({ debug: true });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("No token provided in .env file");
}

const rest = new Rest({
  token: parsed.DISCORD_TOKEN,
});

rest.on("requestStart", (event) => {
  console.log("[REST] Request start:", event);
});

rest.on("requestSuccess", (event) => {
  console.log("[REST] Request success:", event);
});

rest.on("requestFailure", (event) => {
  console.log("[REST] Request failure:", event);
});

rest.on("rateLimitHit", (event) => {
  console.log("[REST] Rate limit hit:", event);
});

rest.on("rateLimitUpdate", (event) => {
  console.log("[REST] Rate limit update:", event);
});

rest.on("rateLimitExpire", (event) => {
  console.log("[REST] Rate limit expire:", event);
});

rest.on("queueComplete", (event) => {
  console.log("[REST] Queue complete:", event);
});

rest.on("queueTimeout", (event) => {
  console.log("[REST] Queue timeout:", event);
});

rest.on("queueReject", (event) => {
  console.log("[REST] Queue reject:", event);
});

rest.on("retry", (event) => {
  console.log("[REST] Retry:", event);
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
  shard: {
    force: true,
    totalShards: "auto",
  },
});

// Connection lifecycle events
gateway.on("connectionAttempt", (event) => {
  console.log("[GATEWAY] Connection attempt:", event);
});

gateway.on("connectionSuccess", (event) => {
  console.log("[GATEWAY] Connection success:", event);
});

gateway.on("connectionFailure", (event) => {
  console.log("[GATEWAY] Connection failure:", event);
});

gateway.on("reconnectionScheduled", (event) => {
  console.log("[GATEWAY] Reconnection scheduled:", event);
});

// Heartbeat communication events
gateway.on("heartbeatSent", (event) => {
  console.log("[GATEWAY] Heartbeat sent:", event);
});

gateway.on("heartbeatAcknowledge", (event) => {
  console.log("[GATEWAY] Heartbeat acknowledged:", event);
});

gateway.on("heartbeatTimeout", (event) => {
  console.log("[GATEWAY] Heartbeat timeout:", event);
});

// Session events
gateway.on("sessionStart", (event) => {
  console.log("[GATEWAY] Session start:", event);
});

gateway.on("sessionResume", (event) => {
  console.log("[GATEWAY] Session resume:", event);
});

gateway.on("sessionInvalidate", (event) => {
  console.log("[GATEWAY] Session invalidate:", event);
});

// Shard events
gateway.on("shardCreate", (event) => {
  console.log("[GATEWAY] Shard create:", event);
});

gateway.on("shardReady", (event) => {
  console.log("[GATEWAY] Shard ready:", event);
});

gateway.on("shardDisconnect", (event) => {
  console.log("[GATEWAY] Shard disconnect:", event);
});

// Rate limit event
gateway.on("rateLimitDetected", (event) => {
  console.log("[GATEWAY] Rate limit detected:", event);
});

// Discord gateway events
gateway.on("error", (error) => {
  console.error("[GATEWAY] Error", error);
});

gateway.on("dispatch", async (event, data) => {
  console.log("[GATEWAY] Event dispatched", event, data);

  if (event === "MESSAGE_CREATE") {
    const message = data as MessageEntity;
    if (message.content === "!ping") {
      try {
        await rest.messages.createMessage(message.channel_id, {
          content: "Pong",
          embeds: [
            {
              type: EmbedType.Rich,
              title: "Pong",
              description: "Pong!",
              color: 0x57f287,
            },
          ],
          components: [
            {
              type: ComponentType.ActionRow,
              components: [
                {
                  type: ComponentType.Button,
                  style: ButtonStyle.Success,
                  label: "Pong",
                  custom_id: "ping",
                },
              ],
            },
          ],
        });
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  }
});

async function main(): Promise<void> {
  await gateway.connect();
}

main().catch(console.error);

process.on("SIGINT", async () => {
  await rest.destroy();
  gateway.destroy();
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection", error);

  if (error instanceof ApiError) {
    console.error("API Error", JSON.stringify(error.errors, null, 2));
  }
});
