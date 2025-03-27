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

rest.on("request", (event) => {
  console.log("[REST] Request event", event);
});

rest.on("rateLimit", (event) => {
  console.log("[REST] Rate limit event", event);
});

rest.on("queue", (event) => {
  console.log("[REST] Queue event", event);
});

rest.on("retry", (event) => {
  console.log("[REST] Retry event", event);
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
    // force: true,
    totalShards: "auto",
  },
});

gateway.on("connection", (state) => {
  console.log("[GATEWAY] Connection state", state);
});

gateway.on("heartbeat", (state) => {
  console.log("[GATEWAY] Heartbeat state", state);
});

gateway.on("session", (state) => {
  console.log("[GATEWAY] Session state", state);
});

gateway.on("shard", (state) => {
  console.log("[GATEWAY] Shard state", state);
});

gateway.on("scaling", (state) => {
  console.log("[GATEWAY] Scaling state", state);
});

gateway.on("circuitBreaker", (state) => {
  console.log("[GATEWAY] Circuit breaker state", state);
});

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
