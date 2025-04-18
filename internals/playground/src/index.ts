import {
  VoiceClient,
  VoiceClientState,
  VoiceEncryptionMode,
} from "@nyxjs/voice";
import { config } from "dotenv";
import {
  Client,
  GatewayIntentsBits,
  type VoiceServerUpdateEntity,
  type VoiceStateEntity,
  formatUser,
  sleep,
} from "nyx.js";
import {
  createContinuousToneSource,
  createSilenceSource,
  createSimpleBeepSource,
} from "./voice.js";

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
  encodingType: "etf",
  compressionType: "zstd-stream",
});

// Maps to store voice connections and state information
const voiceConnections = new Map<string, VoiceClient>();
const voiceStates = new Map<string, VoiceStateEntity>();
const voiceServerUpdates = new Map<string, VoiceServerUpdateEntity>();

// Handle gateway dispatch events
client.on("dispatch", async (event, data) => {
  console.log(`[GATEWAY] Event ${event} dispatched`);

  // Handle voice state updates
  if (event === "VOICE_STATE_UPDATE") {
    handleVoiceStateUpdate(data);
  }

  // Handle voice server updates
  else if (event === "VOICE_SERVER_UPDATE") {
    handleVoiceServerUpdate(data);
  }
});

// Process voice state updates
function handleVoiceStateUpdate(data: VoiceStateEntity): void {
  // Ignore if not our bot
  if (data.user_id !== client.user.id) {
    return;
  }

  const guildId = data.guild_id as string;
  console.log(
    `[VOICE] Bot voice state update in guild ${guildId}: ${JSON.stringify(data)}`,
  );

  // Store the voice state
  voiceStates.set(guildId, data);

  // If leaving a channel
  if (!data.channel_id) {
    console.log(`[VOICE] Bot left voice channel in guild ${guildId}`);

    // Clean up voice connection
    const voiceClient = voiceConnections.get(guildId);
    if (voiceClient) {
      voiceClient.disconnect().catch(console.error);
      voiceConnections.delete(guildId);
    }

    // Clean up stored states
    voiceStates.delete(guildId);
    voiceServerUpdates.delete(guildId);
    return;
  }

  // Check if we already received a VOICE_SERVER_UPDATE for this guild
  const serverUpdate = voiceServerUpdates.get(guildId);
  if (serverUpdate) {
    // We have both pieces of information, try to establish the connection
    tryEstablishVoiceConnection(guildId);
  }
}

// Process voice server updates
function handleVoiceServerUpdate(data: VoiceServerUpdateEntity): void {
  const guildId = data.guild_id;
  console.log(
    `[VOICE] Voice server update for guild ${guildId}: ${JSON.stringify(data)}`,
  );

  // Store the server update
  voiceServerUpdates.set(guildId, data);

  // Check if we already received a VOICE_STATE_UPDATE for this guild
  const voiceState = voiceStates.get(guildId);
  if (voiceState) {
    // We have both pieces of information, try to establish the connection
    tryEstablishVoiceConnection(guildId);
  }
}

// Attempt to establish a voice connection with available information
async function tryEstablishVoiceConnection(guildId: string): Promise<void> {
  const voiceState = voiceStates.get(guildId);
  const serverUpdate = voiceServerUpdates.get(guildId);

  if (!(voiceState && serverUpdate)) {
    console.log(
      `[VOICE] Missing information to establish connection for guild ${guildId}`,
    );
    return;
  }

  console.log(
    `[VOICE] Attempting to establish voice connection for guild ${guildId}`,
  );

  try {
    // Clean up any existing connection first
    const existingClient = voiceConnections.get(guildId);
    if (existingClient) {
      console.log(
        `[VOICE] Cleaning up existing connection for guild ${guildId}`,
      );
      await existingClient.disconnect();
      voiceConnections.delete(guildId);
    }

    // Create a structure combining necessary information
    const connectionInfo: VoiceServerUpdateEntity & VoiceStateEntity = {
      guild_id: guildId,
      channel_id: voiceState.channel_id,
      user_id: voiceState.user_id,
      session_id: voiceState.session_id,
      token: serverUpdate.token,
      endpoint: serverUpdate.endpoint,
    };

    // Create voice client with improved configuration
    const voiceClient = new VoiceClient({
      // Ensure we use the latest supported gateway version
      version: 8,
      // Increase timeout for slow connections
      connectionTimeout: 60000,
      // Set the preferred encryption mode (fallbacks handled in the client)
      preferredEncryptionMode: VoiceEncryptionMode.AeadAes256GcmRtpsize,
      // Enable debug mode to get detailed logs
      debug: true,
      // Configure heartbeat for better reliability
      heartbeat: {
        maxMissedHeartbeats: 5,
        autoReconnect: true,
        reconnectDelay: 2000,
      },
      // Ensure our UDP packets get through
      udp: {
        sendBufferSize: 8192,
        receiveBufferSize: 12288,
        sendTimeout: 2000,
        ipDiscovery: {
          maxRetries: 10,
          retryDelay: 500,
          timeout: 3000,
        },
      },
    });

    // Set up event listeners
    setupVoiceEvents(voiceClient, guildId);

    // Connect to voice channel
    await voiceClient.connect(connectionInfo);

    // Store the client if connection succeeds
    voiceConnections.set(guildId, voiceClient);
  } catch (error) {
    console.error(
      `[VOICE] Error establishing voice connection for guild ${guildId}:`,
      error,
    );
  }
}

// Set up event listeners for a voice connection
function setupVoiceEvents(voiceClient: VoiceClient, guildId: string): void {
  voiceClient.on("ready", () => {
    console.log(`[VOICE] Voice connection ready in guild: ${guildId}`);
    console.log(
      `[VOICE] Connection details - SSRC: ${voiceClient.ssrc}, Encryption: ${voiceClient.encryptionMode}`,
    );

    // Wait 3 seconds to ensure connection is stable before playing
    setTimeout(() => {
      // Start with a silent ping to test the connection
      playSilencePing(voiceClient, guildId);
    }, 3000);
  });

  voiceClient.on("ipDiscovered", (info) => {
    console.log("[VOICE] IP discovered:", info);
  });

  voiceClient.on("disconnect", () => {
    console.log(`[VOICE] Voice connection disconnected in guild: ${guildId}`);
  });

  voiceClient.on("error", (error) => {
    console.error(`[VOICE] Error in guild ${guildId}:`, error);
    // Print full stack trace for better debugging
    if (error.stack) {
      console.error(error.stack);
    }
  });

  voiceClient.on("stateChange", (newState, oldState) => {
    console.log(
      `[VOICE] State changed from ${oldState} to ${newState} in guild ${guildId}`,
    );

    // If connection failed, log and clean up
    if (newState === VoiceClientState.Failed) {
      console.error(
        `[VOICE] Connection failed for guild ${guildId}, cleaning up`,
      );
      voiceClient.disconnect().catch(console.error);
      voiceConnections.delete(guildId);
    }
  });

  voiceClient.on("speaking", (ssrc, speaking, flags) => {
    console.log(
      `[VOICE] User speaking state changed: SSRC=${ssrc}, speaking=${speaking}, flags=${flags}`,
    );
  });

  voiceClient.on("audioStart", (metadata, position) => {
    console.log(
      `[VOICE] Started playing audio: ${JSON.stringify(metadata)}, position=${position}`,
    );
  });

  voiceClient.on("audioEnd", (metadata) => {
    console.log(`[VOICE] Finished playing audio: ${JSON.stringify(metadata)}`);
  });

  voiceClient.on("queueEnd", () => {
    console.log(`[VOICE] Audio queue ended in guild ${guildId}`);
  });

  voiceClient.on("audioReceived", (data, userId) => {
    console.log(
      `[VOICE] Received audio data: size=${data.length}, userId=${userId || "unknown"}`,
    );
  });
}

// Play a silence source as an initial test
async function playSilencePing(
  voiceClient: VoiceClient,
  guildId: string,
): Promise<void> {
  try {
    console.log(`[VOICE] Playing silence ping in guild ${guildId}`);

    if (voiceClient.state !== VoiceClientState.Connected) {
      console.error(
        `[VOICE] Cannot play silence - client not in Connected state (current: ${voiceClient.state})`,
      );
      return;
    }

    // Create a silence source (3 seconds)
    const silenceSource = createSilenceSource(3000);

    // Play the silence source
    await voiceClient.play(silenceSource, {
      title: "Silence Ping",
      type: "test",
    });

    console.log("[VOICE] Silence ping successful");

    // If silence was successful, play a beep after 2 seconds
    setTimeout(() => {
      playTestBeep(voiceClient, guildId);
    }, 2000);
  } catch (error) {
    console.error("[VOICE] Failed to play silence ping:", error);
  }
}

// Play a simple beep test sound
async function playTestBeep(
  voiceClient: VoiceClient,
  guildId: string,
): Promise<void> {
  try {
    console.log(`[VOICE] Playing test beep in guild ${guildId}`);

    if (voiceClient.state !== VoiceClientState.Connected) {
      console.error(
        `[VOICE] Cannot play beep - client not in Connected state (current: ${voiceClient.state})`,
      );
      return;
    }

    // Create a short beep source (2 seconds)
    const beepSource = createSimpleBeepSource({
      frequency: 440,
      duration: 2,
      volume: 0.7,
    });

    // Play the beep source
    await voiceClient.play(beepSource, {
      title: "Test Beep",
      type: "test",
    });

    console.log("[VOICE] Test beep playing");
  } catch (error) {
    console.error("[VOICE] Failed to play test beep:", error);
  }
}

// Start a continuous test tone
async function startContinuousTestTone(
  voiceClient: VoiceClient,
  guildId: string,
): Promise<void> {
  try {
    console.log(`[VOICE] Starting continuous test tone in guild ${guildId}`);

    if (voiceClient.state !== VoiceClientState.Connected) {
      console.error(
        `[VOICE] Cannot play continuous tone - client not in Connected state (current: ${voiceClient.state})`,
      );
      return;
    }

    // Create a continuous tone source (sine wave)
    const toneSource = createContinuousToneSource({
      frequency: 440, // 440 Hz (A4)
      duration: 60 * 5, // 5 minutes
      volume: 0.5, // 50% volume
    });

    // Play the audio source
    const trackId = await voiceClient.play(toneSource, {
      title: "Test Tone",
      type: "test",
      continuous: true,
    });

    console.log(`[VOICE] Continuous test tone playing (Track ID: ${trackId})`);
  } catch (error) {
    console.error("[VOICE] Failed to start continuous test tone:", error);
  }
}

// Handle user messages
client.on("messageCreate", async (message) => {
  // Ignore bot messages
  if (message.author.bot) {
    return;
  }

  // Command: !ping
  if (message.content === "!ping") {
    try {
      await message.reply({
        content: "Pong! Voice module is loaded.",
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  }

  // Command: !join
  else if (message.content.startsWith("!join")) {
    try {
      // Extract channel ID if provided, otherwise use default
      let channelId = "1232694742350041089"; // Default channel ID
      const args = message.content.split(" ");
      if (args.length > 1) {
        channelId = args[1];
      }

      await message.reply(
        `Attempting to connect to voice channel ${channelId}...`,
      );

      // Send a command to the Gateway to join the voice channel
      client.gateway.updateVoiceState({
        guild_id: message.guildId as string,
        channel_id: channelId,
        self_mute: false,
        self_deaf: false,
      });
    } catch (error) {
      console.error("Failed to join voice channel", error);
      await message.reply("Failed to join voice channel");
    }
  }

  // Command: !silence
  else if (message.content === "!silence") {
    const voiceClient = voiceConnections.get(message.guildId as string);

    if (!voiceClient) {
      await message.reply(
        "I'm not connected to a voice channel. Use !join first.",
      );
      return;
    }

    if (voiceClient.state !== VoiceClientState.Connected) {
      await message.reply(
        `Voice client is not ready (current state: ${voiceClient.state})`,
      );
      return;
    }

    try {
      await message.reply("Playing silence ping test...");
      playSilencePing(voiceClient, message.guildId as string);
    } catch (error) {
      console.error("Failed to play silence test", error);
      await message.reply("Failed to play silence test");
    }
  }

  // Command: !beep
  else if (message.content === "!beep") {
    const voiceClient = voiceConnections.get(message.guildId as string);

    if (!voiceClient) {
      await message.reply(
        "I'm not connected to a voice channel. Use !join first.",
      );
      return;
    }

    if (voiceClient.state !== VoiceClientState.Connected) {
      await message.reply(
        `Voice client is not ready (current state: ${voiceClient.state})`,
      );
      return;
    }

    try {
      await message.reply("Playing test beep...");
      playTestBeep(voiceClient, message.guildId as string);
    } catch (error) {
      console.error("Failed to play test beep", error);
      await message.reply("Failed to play test beep");
    }
  }

  // Command: !tone
  else if (message.content === "!tone") {
    const voiceClient = voiceConnections.get(message.guildId as string);

    if (!voiceClient) {
      await message.reply(
        "I'm not connected to a voice channel. Use !join first.",
      );
      return;
    }

    if (voiceClient.state !== VoiceClientState.Connected) {
      await message.reply(
        `Voice client is not ready (current state: ${voiceClient.state})`,
      );
      return;
    }

    try {
      await message.reply("Starting continuous test tone...");
      startContinuousTestTone(voiceClient, message.guildId as string);
    } catch (error) {
      console.error("Failed to play test tone", error);
      await message.reply("Failed to play test tone");
    }
  }

  // Command: !stop
  else if (message.content === "!stop") {
    const voiceClient = voiceConnections.get(message.guildId as string);

    if (!voiceClient) {
      await message.reply("I'm not connected to a voice channel.");
      return;
    }

    try {
      await voiceClient.audio.stop();
      await message.reply("Playback stopped.");
    } catch (error) {
      console.error("Failed to stop playback", error);
      await message.reply("Failed to stop playback");
    }
  }

  // Command: !leave
  else if (message.content === "!leave") {
    try {
      // Send a command to the Gateway to leave the voice channel
      client.gateway.updateVoiceState({
        guild_id: message.guildId as string,
        channel_id: null, // null = leave the channel
        self_mute: false,
        self_deaf: false,
      });

      await message.reply("Left voice channel.");
    } catch (error) {
      console.error("Failed to leave voice channel", error);
      await message.reply("Failed to leave voice channel");
    }
  }

  // Command: !status
  else if (message.content === "!status") {
    const voiceClient = voiceConnections.get(message.guildId as string);

    if (!voiceClient) {
      await message.reply("Not connected to any voice channel in this guild.");
      return;
    }

    const status = {
      state: voiceClient.state,
      endpoint: voiceClient.channelId,
      ready: voiceClient.isReady,
      ssrc: voiceClient.ssrc,
      encryptionMode: voiceClient.encryptionMode,
      wsConnected: voiceClient.isWsConnected,
    };

    await message.reply(
      `Voice client status:\n\`\`\`json\n${JSON.stringify(status, null, 2)}\n\`\`\``,
    );
  }
});

// Set up other event handlers
client.on("ready", async (ready) => {
  console.log(`[CLIENT] Client is ready: ${ready.user.id}`);

  await sleep(1500);

  console.log(
    "[CHANNEL] Channels:",
    client.cache.channels.map(
      (channel) => `${channel.id} [${channel.name}] (${channel.type})`,
    ),
  );
});

// Handle slash commands
client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand() && interaction.interactionData.name === "ping") {
    try {
      await interaction.reply({
        content: `Pong ${formatUser(interaction.user?.id ?? client.user.id)}`,
      });
    } catch (error) {
      console.error("Failed to respond to interaction", error);
    }
  }
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

  // Disconnect all voice clients
  for (const [guildId, client] of voiceConnections.entries()) {
    console.log(`[VOICE] Disconnecting from guild ${guildId}`);
    await client.disconnect().catch(console.error);
  }

  // Destroy the Discord client
  await client.destroy();
  console.log("[PROCESS] All connections closed, exiting");
  process.exit(0);
});

// Start the bot
async function main(): Promise<void> {
  console.log("[CLIENT] Connecting to Discord...");
  await client.connect();
  console.log("[CLIENT] Connected successfully");
}

main().catch(console.error);
