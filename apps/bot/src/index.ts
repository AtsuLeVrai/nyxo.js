import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
} from "@nyxjs/builders";
import {
  type AnyInteractionEntity,
  ButtonStyle,
  InteractionCallbackType,
  type MessageEntity,
  TextInputStyle,
} from "@nyxjs/core";
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
      const embed = new EmbedBuilder()
        .setTitle("Test")
        .setDescription("Test")
        .setColor(0x57f287)
        .setFooter({ text: "Test" })
        .setImage({ url: "https://example.com/image.png" })
        .setThumbnail({ url: "https://example.com/thumbnail.png" })
        .setTimestamp()
        .addFields(
          { name: "Field 1", value: "Value 1" },
          { name: "Field 2", value: "Value 2" },
        )
        .build();

      const components = ActionRowBuilder.createButtonRow(
        new ButtonBuilder()
          .setLabel("Pong")
          .setStyle(ButtonStyle.Success)
          .setCustomId("ping"),
      ).build();

      try {
        await rest.messages.createMessage(message.channel_id, {
          content: "Pong",
          embeds: [embed],
          components: [components],
        });
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  }

  if (event === "INTERACTION_CREATE") {
    const interaction = data as AnyInteractionEntity;
    if (
      interaction.data &&
      "name" in interaction.data &&
      interaction.data.name === "ping"
    ) {
      const modal = new ModalBuilder()
        .setTitle("Test Modal")
        .setCustomId("test_modal")
        .addComponents(
          ActionRowBuilder.createTextInputRow(
            new TextInputBuilder()
              .setCustomId("name_input")
              .setLabel("Name")
              .setStyle(TextInputStyle.Short),
          ),
        )
        .build();

      try {
        await rest.interactions.createInteractionResponse<InteractionCallbackType.Modal>(
          interaction.id,
          interaction.token,
          {
            type: InteractionCallbackType.Modal,
            data: modal,
          },
        );
      } catch (error) {
        console.error("Failed to respond to interaction", error);
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
});
