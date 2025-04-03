import {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
} from "@nyxjs/builders";
import {
  ButtonStyle,
  InteractionCallbackType,
  TextInputStyle,
} from "@nyxjs/core";
import { config } from "dotenv";
import { Client, GatewayIntentsBits } from "nyx.js";

const { parsed } = config({ debug: true });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("No token provided in .env file");
}

const client = new Client({
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
  encodingType: "etf",
  compressionType: "zstd-stream",
});

client.on("requestStart", (event) => {
  console.log("[REST] Request start:", event);
});

client.on("requestSuccess", (event) => {
  console.log("[REST] Request success:", event);
});

client.on("requestFailure", (event) => {
  console.log("[REST] Request failure:", event);
});

client.on("rateLimitHit", (event) => {
  console.log("[REST] Rate limit hit:", event);
});

client.on("rateLimitUpdate", (event) => {
  console.log("[REST] Rate limit update:", event);
});

client.on("rateLimitExpire", (event) => {
  console.log("[REST] Rate limit expire:", event);
});

client.on("queueComplete", (event) => {
  console.log("[REST] Queue complete:", event);
});

client.on("queueTimeout", (event) => {
  console.log("[REST] Queue timeout:", event);
});

client.on("queueReject", (event) => {
  console.log("[REST] Queue reject:", event);
});

client.on("retry", (event) => {
  console.log("[REST] Retry:", event);
});

client.on("connectionAttempt", (event) => {
  console.log("[GATEWAY] Connection attempt:", event);
});

client.on("connectionSuccess", (event) => {
  console.log("[GATEWAY] Connection success:", event);
});

client.on("connectionFailure", (event) => {
  console.log("[GATEWAY] Connection failure:", event);
});

client.on("reconnectionScheduled", (event) => {
  console.log("[GATEWAY] Reconnection scheduled:", event);
});

client.on("heartbeatSent", (event) => {
  console.log("[GATEWAY] Heartbeat sent:", event);
});

client.on("heartbeatAcknowledge", (event) => {
  console.log("[GATEWAY] Heartbeat acknowledged:", event);
});

client.on("heartbeatTimeout", (event) => {
  console.log("[GATEWAY] Heartbeat timeout:", event);
});

client.on("sessionStart", (event) => {
  console.log("[GATEWAY] Session start:", event);
});

client.on("sessionResume", (event) => {
  console.log("[GATEWAY] Session resume:", event);
});

client.on("sessionInvalidate", (event) => {
  console.log("[GATEWAY] Session invalidate:", event);
});

client.on("shardCreate", (event) => {
  console.log("[GATEWAY] Shard create:", event);
});

client.on("shardReady", (event) => {
  console.log("[GATEWAY] Shard ready:", event);
});

client.on("shardDisconnect", (event) => {
  console.log("[GATEWAY] Shard disconnect:", event);
});

client.on("rateLimitDetected", (event) => {
  console.log("[GATEWAY] Rate limit detected:", event);
});

client.on("error", (error) => {
  console.error("[GATEWAY] Error", error);
});

client.on("dispatch", (event, data) => {
  console.log("[GATEWAY] Event dispatched", event, data);
});

client.on("ready", (ready) => {
  console.log("[CLIENT] Client is ready: ", ready.toString());
});

client.on("messageCreate", async (message) => {
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
      await client.rest.messages.createMessage(message.channel_id, {
        content: "Pong",
        embeds: [embed],
        components: [components],
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
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
      await client.rest.interactions.createInteractionResponse<InteractionCallbackType.Modal>(
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
});

async function main(): Promise<void> {
  await client.connect();
}

main().catch(console.error);

process.on("SIGINT", async () => {
  await client.destroy();
  process.exit(0);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection", error);
});
