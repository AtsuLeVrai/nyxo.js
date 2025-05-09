import { config } from "dotenv";
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonEntity,
  ButtonStyle,
  Client,
  Colors,
  EmbedBuilder,
  GatewayIntentsBits,
  type MessageCreateV1Options,
  type MessageCreateV2Options,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder,
} from "nyxo.js";

// Load environment variables
const { parsed } = config({ debug: true });

if (!parsed?.DISCORD_TOKEN) {
  throw new Error("No token provided in .env file");
}

// Configure the Discord client
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

client.on("ready", (ready) => {
  console.log("[CLIENT] Ready", ready.user.id);
});

client.on("guildCreate", (guild) => {
  console.log("[CLIENT] Joined a new guild", guild.id);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommandInteraction() && interaction.isSlashCommand()) {
    console.log("[CLIENT] Slash command interaction", interaction.commandName);

    if (interaction.commandName === "ping") {
      await interaction.reply("Pong!");
    }
  }

  if (
    interaction.isComponentInteraction() &&
    interaction.isButtonInteraction()
  ) {
    console.log("[CLIENT] Button interaction", interaction.customId);

    if (interaction.customId === "test_button") {
      await interaction.reply("Button clicked!");
    }
  }
});

// client.on("dispatch", (event, data) => {
//   console.log("[CLIENT] Dispatch event", event, data);
// });

client.on("wsClose", (code, reason) => {
  console.log("[CLIENT] WebSocket closed", code, reason);
});

client.on("wsError", (error) => {
  console.error("[CLIENT] WebSocket error", error);
});

client.on("sessionStart", (data) => {
  console.log("[CLIENT] Session started", data);
});

client.on("request", (request) => {
  console.log("[CLIENT] Request successful", request);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  const button = new ButtonBuilder()
    .setCustomId("test_button")
    .setLabel("Test Button")
    .setStyle(ButtonStyle.Success)
    .build();

  const actionRow = new ActionRowBuilder<ButtonEntity>()
    .addComponents(button)
    .build();

  if (message.content === "!ping") {
    const embed = new EmbedBuilder()
      .setTitle("Pong!")
      .setDescription("This is a test embed")
      .setColor(Colors.Green)
      .setTimestamp()
      .build();

    const options: Omit<MessageCreateV1Options, "message_reference"> = {
      embeds: [embed],
      components: [actionRow],
    };

    await message.reply(options);
  }

  if (message.content === "!components") {
    const text = new TextDisplayBuilder()
      .setContent("This is a test message with components")
      .build();

    const separator = new SeparatorBuilder().build();

    const secondText = new TextDisplayBuilder()
      .setContent("This is a second text component")
      .build();

    const options: MessageCreateV2Options = {
      components: [text, separator, secondText, actionRow],
      flags: MessageFlags.IsComponentsV2,
    };

    await message.reply(options);
  }
});

client.on("rateLimitExpire", (request) => {
  console.log("[CLIENT] Rate limit expired", request);
});

client.on("rateLimitHit", (request) => {
  console.log("[CLIENT] Rate limit hit", request);
});

client.on("rateLimitUpdate", (request) => {
  console.log("[CLIENT] Rate limit updated", request);
});

client.on("retry", (request) => {
  console.log("[CLIENT] Retrying request", request);
});

// Error handling
process.on("unhandledRejection", (error) => {
  console.error("[PROCESS] Unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("[PROCESS] Uncaught exception:", error);
});

// Clean shutdown
process.on("SIGINT", async () => {
  console.log("[PROCESS] Shutting down...");

  // Destroy the Discord client
  await client.destroy();
  console.log("[PROCESS] All connections closed, exiting");
  process.exit(0);
});

// Start the bot
async function main(): Promise<void> {
  function formatMemoryUsage(memoryUsage: NodeJS.MemoryUsage): string {
    const mbDivisor = 1024 * 1024;
    const rss = Math.round((memoryUsage.rss / mbDivisor) * 100) / 100;
    const heapTotal =
      Math.round((memoryUsage.heapTotal / mbDivisor) * 100) / 100;
    const heapUsed = Math.round((memoryUsage.heapUsed / mbDivisor) * 100) / 100;
    const external = Math.round((memoryUsage.external / mbDivisor) * 100) / 100;

    return `RSS: ${rss} MB | Heap Total: ${heapTotal} MB | Heap Used: ${heapUsed} MB | External: ${external} MB`;
  }

  const memoryBefore = process.memoryUsage();
  console.log("[MEMORY] Before connection:", formatMemoryUsage(memoryBefore));

  const startTime = Date.now();
  console.log("[CLIENT] Connecting to Discord...");
  await client.gateway.connect();

  const memoryAfter = process.memoryUsage();
  console.log("[CLIENT] Connected successfully", Date.now() - startTime, "ms");
  console.log("[MEMORY] After connection:", formatMemoryUsage(memoryAfter));

  const diffHeapUsed =
    Math.round(
      ((memoryAfter.heapUsed - memoryBefore.heapUsed) / (1024 * 1024)) * 100,
    ) / 100;
  console.log(
    `[MEMORY] Connection increased heap usage by: ${diffHeapUsed} MB`,
  );

  const memoryInterval = setInterval(() => {
    const currentMemory = process.memoryUsage();
    console.log("[MEMORY] Current usage:", formatMemoryUsage(currentMemory));
  }, 5000);

  process.on("SIGINT", async () => {
    console.log("[PROCESS] Shutting down...");
    clearInterval(memoryInterval);
    await client.destroy();
    console.log("[PROCESS] All connections closed, exiting");
    process.exit(0);
  });
}

main().catch(console.error);

/* TODO: Spoiler !
// commands/[subgroup]/[subcommand]/[command].ts
export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping the bot")
    .addStringOption((option) =>
        option
        .setName("message")
        .setDescription("The message to send")
        .setRequired(false),
    )
    .build();

export async function execute(client, interaction, args, ...customArgs): Promise<void> {
  if (args.message) {
    await interaction.reply(`Pong! ${args.message}`);
  } else {
    await interaction.reply("Pong!");
  }
}

// events/[...event].ts
export const name = "messageCreate";
export const once = false;

export async function execute(client, message, ...customArgs): Promise<void> {
  const [message] = args;
  if (message.content === "!ping") {
    await message.reply("Pong!");
  }
}
*/
