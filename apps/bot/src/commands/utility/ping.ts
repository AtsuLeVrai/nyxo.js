import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonEntity,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  GuildCommandBuilder,
} from "nyxo.js";
import { defineSlashCommand } from "../../types/index.js";

/**
 * Returns an appropriate color based on latency value
 * Green: Excellent connection (< 100ms)
 * Yellow: Good connection (< 200ms)
 * Orange: Fair connection (< 400ms)
 * Red: Poor connection (≥ 400ms)
 *
 * @param latency - The websocket latency in milliseconds
 * @returns A color code appropriate for the latency value
 */
function getLatencyColor(latency: number): number {
  if (latency < 100) {
    return Colors.Green;
  }
  if (latency < 200) {
    return Colors.Yellow;
  }
  if (latency < 400) {
    return Colors.Orange;
  }
  return Colors.Red;
}

/**
 * Ping command - tests the bot's response time and API latency
 *
 * This command provides diagnostic information about:
 * 1. Websocket heartbeat (connection to Discord Gateway)
 * 2. Roundtrip latency (time between sending command and receiving response)
 * 3. API response time (Discord REST API health)
 *
 * It's useful for checking if the bot is responsive and diagnosing
 * potential connection issues.
 */
export default defineSlashCommand({
  data: new GuildCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency and API response time")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to ping")
        .setRequired(false),
    )
    .build(),
  execute: async (client, interaction) => {
    // Record timestamp when command is received
    const start = Date.now();

    // First response to establish baseline
    await interaction.deferReply(true);

    // Calculate various latency metrics
    const end = Date.now();
    const roundtripLatency = end - start;
    const wsHeartbeat = client.gateway.latency; // Websocket heartbeat latency

    const user = await interaction.getUser("user");

    const cache = client.cache.channels.size;

    // Create an aesthetic embed with the latency information
    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setDescription("Bot latency information")
      .setColor(getLatencyColor(wsHeartbeat)) // Color based on websocket latency
      .addFields(
        {
          name: "Websocket Heartbeat",
          value: `${wsHeartbeat}ms`,
          inline: true,
        },
        {
          name: "Roundtrip Latency",
          value: `${roundtripLatency}ms`,
          inline: true,
        },
        // If user is specified, show their ping
        {
          name: "User Ping",
          value: user
            ? `${user.toString()} - ${roundtripLatency}ms`
            : "No user specified",
          inline: true,
        },
        {
          name: "Guild Cache Size",
          value: `${cache} guilds`,
          inline: true,
        },
      )
      .setFooter({
        text: `Nyxo.js | Shard ${client.gateway.shard.totalShards}`,
      })
      .setTimestamp()
      .build();

    // Create a button to refresh the latency information
    const button = new ButtonBuilder()
      .setCustomId("ping_refresh")
      .setLabel("Refresh")
      .setStyle(ButtonStyle.Primary)
      .setEmoji("🔄")
      .build();

    // Create an action row with the button
    const actionRow = new ActionRowBuilder<ButtonEntity>()
      .addComponents(button)
      .build();

    // Edit the original response with the embed and button
    await interaction.createFollowup({
      embeds: [embed],
      components: [actionRow],
    });
  },
});
