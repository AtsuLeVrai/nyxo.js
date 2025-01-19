import { config } from "dotenv";
import {
  Client,
  type CreateGlobalApplicationCommandEntity,
  GatewayIntentsBits,
  InteractionCallbackType,
  InteractionType,
} from "nyx.js";
import type { z } from "zod";

const { parsed } = config({ debug: true });
if (!parsed?.DISCORD_TOKEN) {
  throw new Error("Failed to parse .env file");
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
});

client.on("debug", (message, context) => {
  console.log(message, context ?? "");
});

client.on("ready", (ready) => {
  console.log("Client is ready", ready);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.type === InteractionType.ApplicationCommand) {
    await client.rest.interactions.createInteractionResponse(
      interaction.id,
      interaction.token,
      {
        type: InteractionCallbackType.ChannelMessageWithSource,
        data: {
          content: "Pong!",
        },
      },
    );
  }
});

const COMMANDS: z.input<typeof CreateGlobalApplicationCommandEntity>[] = [
  {
    name: "ping",
    description: "Replies with pong!",
  },
];

async function main(): Promise<void> {
  await client.connect();

  await client.rest.commands.bulkOverwriteGuildApplicationCommands(
    "1011252785989308526",
    "936969912600121384",
    COMMANDS,
  );
}

main().catch(console.error);
