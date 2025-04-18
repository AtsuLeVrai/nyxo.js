import type { VoiceStateEntity } from "@nyxjs/core";
import type { VoiceServerUpdateEntity } from "@nyxjs/gateway";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  AudioManager,
  AudioQueueOptions,
  VoiceHeartbeatManager,
  VoiceHeartbeatOptions,
} from "../managers/index.js";
import {
  AudioPlayerOptions,
  AudioPlayerService,
  type AudioSource,
  OpusOptions,
  OpusService,
} from "../services/index.js";
import {
  VoiceEncryptionMode,
  type VoiceEvents,
  VoiceGatewayVersion,
  type VoiceHelloEntity,
  type VoiceIdentifyEntity,
  VoiceOpcodes,
  type VoicePayloadEntity,
  type VoiceReadyEntity,
  type VoiceResumeEntity,
  type VoiceSendEvents,
  type VoiceSessionDescriptionEntity,
  type VoiceSpeakingEntity,
  VoiceSpeakingFlags,
} from "../types/index.js";
import { VoiceUdp, VoiceUdpOptions } from "./voice-udp.js";

/**
 * Options for the voice client
 */
export const VoiceClientOptions = z.object({
  /**
   * Voice gateway protocol version to use
   * V8 (recommended) includes server message buffering and missed message re-delivery
   * @default 8
   */
  version: z.nativeEnum(VoiceGatewayVersion).default(VoiceGatewayVersion.V8),

  /**
   * Maximum time in ms to wait for a WebSocket connection
   * @default 30000
   */
  connectionTimeout: z.number().int().positive().default(30000),

  /**
   * Close codes that indicate a non-resumable disconnection
   * @default [4004, 4006, 4009, 4011, 4012, 4014, 4016]
   */
  nonResumableCodes: z
    .array(z.number().int())
    .default([4004, 4006, 4009, 4011, 4012, 4014, 4016]),

  /**
   * Maximum DAVE protocol version supported for E2EE
   * @default 0
   */
  maxDaveProtocolVersion: z.number().int().min(0).max(1).default(0),

  /**
   * Preferred encryption mode to use
   * @default VoiceEncryptionMode.AeadAes256GcmRtpsize if available, otherwise AeadXchacha20Poly1305Rtpsize
   */
  preferredEncryptionMode: z
    .nativeEnum(VoiceEncryptionMode)
    .default(VoiceEncryptionMode.AeadAes256GcmRtpsize),

  /**
   * Automatically disconnect after this duration of inactivity (in ms)
   * 0 to disable automatic disconnection
   * @default 300000 (5 minutes)
   */
  idleTimeout: z.number().int().min(0).default(300000),

  /**
   * Playback buffer size in milliseconds
   * Higher values reduce stuttering but increase latency
   * @default 1000
   */
  playbackBufferMs: z.number().int().min(0).max(5000).default(1000),

  /**
   * Debug mode - logs additional information
   * @default false
   */
  debug: z.boolean().default(false),

  /**
   * Options for the UDP client
   */
  udp: VoiceUdpOptions.default({}),

  /**
   * Options for the audio queue manager
   */
  audio: AudioQueueOptions.default({}),

  /**
   * Options for the audio player service
   */
  player: AudioPlayerOptions.default({}),

  /**
   * Options for the heartbeat manager
   */
  heartbeat: VoiceHeartbeatOptions.default({}),

  /**
   * Options for the Opus service
   */
  opus: OpusOptions.default({}),
});

export type VoiceClientOptions = z.infer<typeof VoiceClientOptions>;

/**
 * Possible states for the voice client
 */
export enum VoiceClientState {
  /** Disconnected (initial state) */
  Disconnected = "disconnected",

  /** Connecting to WebSocket gateway */
  ConnectingWs = "connecting-ws",

  /** Identifying with the gateway */
  Identifying = "identifying",

  /** Waiting for UDP connection */
  ConnectingUdp = "connecting-udp",

  /** Fully connected and operational */
  Connected = "connected",

  /** Disconnecting */
  Disconnecting = "disconnecting",

  /** Attempting to resume session */
  Resuming = "resuming",

  /** Connection failed */
  Failed = "failed",
}

/**
 * Main client for Discord voice connections
 *
 * This class handles both WebSocket and UDP connections required for
 * establishing and maintaining a full voice connection to Discord.
 * It provides a high-level interface for joining voice channels,
 * sending audio, and managing audio sources.
 *
 * Main features:
 * - Complete voice channel connection with Discord
 * - Audio source playback with queue and controls
 * - Speaker detection and event emission
 * - Automatic connection and disconnection management
 * - Unified event system across all components
 *
 * This is the main entry point for using Discord voice functionality.
 */
export class VoiceClient extends EventEmitter<VoiceEvents> {
  /**
   * Current client state
   * @private
   */
  #state: VoiceClientState = VoiceClientState.Disconnected;

  /**
   * Last audio activity timestamp
   * Used for automatic disconnection
   * @private
   */
  #lastActivity = 0;

  /**
   * WebSocket for gateway connection
   * @private
   */
  #ws: WebSocket | null = null;

  /**
   * Information received in the Ready message
   * @private
   */
  #ready: VoiceReadyEntity | null = null;

  /**
   * Whether we have successfully identified
   * @private
   */
  #identified = false;

  /**
   * Whether this is the first connection attempt (not resuming)
   * @private
   */
  #firstConnection = true;

  /**
   * Negotiated encryption mode
   * @private
   */
  #negotiatedEncryptionMode: string | null = null;

  /**
   * Last reconnection attempt timestamp
   * Used to prevent reconnection loops
   * @private
   */
  #lastReconnectAttempt = 0;

  /**
   * Connection timeout timer
   * @private
   */
  #connectionTimeout: NodeJS.Timeout | null = null;

  /**
   * Inactivity check timer
   * @private
   */
  #idleTimer: NodeJS.Timeout | null = null;

  /**
   * Current connection information
   * @private
   */
  #connectionInfo: {
    // Gateway information
    endpoint: string | null;
    token: string | null;
    resumeUrl: string | null;

    // Guild information
    guildId: string | null;
    channelId: string | null;
    sessionId: string | null;
    userId: string | null;
  } = {
    endpoint: null,
    token: null,
    resumeUrl: null,
    guildId: null,
    channelId: null,
    sessionId: null,
    userId: null,
  };

  /**
   * UDP client for audio transmission
   * @private
   */
  readonly #udp: VoiceUdp;

  /**
   * Opus service for encoding/decoding audio
   * @private
   */
  readonly #opus: OpusService;

  /**
   * Audio player service
   * @private
   */
  readonly #player: AudioPlayerService;

  /**
   * Audio queue manager
   * @private
   */
  readonly #audioManager: AudioManager;

  /**
   * Heartbeat manager
   * @private
   */
  readonly #heartbeat: VoiceHeartbeatManager;

  /**
   * Client configuration options
   * @private
   */
  readonly #options: VoiceClientOptions;

  /**
   * Creates a new voice client
   *
   * @param options - Configuration options
   */
  constructor(options: z.input<typeof VoiceClientOptions> = {}) {
    super();

    try {
      // Parse options
      this.#options = VoiceClientOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    // Create the Opus service
    this.#opus = new OpusService(this.#options.opus);

    // Create underlying components
    this.#udp = new VoiceUdp(this, this.#options.udp);
    this.#heartbeat = new VoiceHeartbeatManager(this, this.#options.heartbeat);

    // Create audio services
    this.#player = new AudioPlayerService(
      this,
      this.#opus,
      this.#options.player,
    );
    this.#audioManager = new AudioManager(this.#player, this.#options.audio);

    // Initialize the Opus service and UDP
    this.#initializeServices();

    // Set up event listeners
    this.#setupEventListeners();
  }

  /**
   * Gets the current client state
   */
  get state(): VoiceClientState {
    return this.#state;
  }

  /**
   * Checks if the client is connected and ready
   */
  get isReady(): boolean {
    return this.#state === VoiceClientState.Connected;
  }

  /**
   * Checks if the WebSocket connection is established
   */
  get isWsConnected(): boolean {
    return this.#ws !== null && this.#ws.readyState === WebSocket.OPEN;
  }

  /**
   * Gets the current guild ID
   */
  get guildId(): string | null {
    return this.#connectionInfo.guildId;
  }

  /**
   * Gets the current channel ID
   */
  get channelId(): string | null {
    return this.#connectionInfo.channelId;
  }

  /**
   * Gets the negotiated encryption mode
   */
  get encryptionMode(): string | null {
    return this.#negotiatedEncryptionMode;
  }

  /**
   * Gets the audio manager for playback control
   */
  get audio(): AudioManager {
    return this.#audioManager;
  }

  /**
   * Gets the gateway protocol version being used
   */
  get version(): VoiceGatewayVersion {
    return this.#options.version;
  }

  /**
   * Gets the SSRC value for this connection
   */
  get ssrc(): number | null {
    return this.#ready?.ssrc ?? null;
  }

  /**
   * Gets the session ID for this connection
   */
  get sessionId(): string | null {
    return this.#connectionInfo.sessionId;
  }

  /**
   * Connects to a voice channel
   *
   * @param options - Connection information
   * @returns A promise that resolves when the connection is established
   */
  async connect(
    options: VoiceServerUpdateEntity & VoiceStateEntity,
  ): Promise<void> {
    // Check if we're already connected
    if (this.#state !== VoiceClientState.Disconnected) {
      this.#logDebug(`Already in state ${this.#state}, disconnecting first`);
      await this.disconnect();
    }

    // Validate parameters
    if (
      !(
        options.guild_id &&
        options.channel_id &&
        options.session_id &&
        options.endpoint &&
        options.token &&
        options.user_id
      )
    ) {
      throw new Error("Incomplete connection parameters");
    }

    this.#logDebug(
      `Connecting to voice channel: ${options.channel_id} in guild: ${options.guild_id}`,
    );
    this.#logDebug(
      `Using endpoint: ${options.endpoint}, session: ${options.session_id}`,
    );

    // Store connection information
    this.#connectionInfo = {
      endpoint: options.endpoint,
      token: options.token,
      resumeUrl: null,
      guildId: options.guild_id,
      channelId: options.channel_id,
      sessionId: options.session_id,
      userId: options.user_id,
    };

    // Reset for new connection
    this.#firstConnection = true;
    this.#identified = false;
    this.#ready = null;

    // Update state
    this.#setState(VoiceClientState.ConnectingWs);

    try {
      // Ensure Opus is initialized
      if (!this.#opus.isInitialized) {
        this.#logDebug("Initializing Opus service");
        await this.#opus.initialize();
      }

      // Connect to the voice gateway
      await this.#connectWebSocket();
    } catch (error) {
      // Reset state on error
      const errorMessage = `Connection failed: ${error instanceof Error ? error.message : String(error)}`;
      this.#logDebug(errorMessage);
      this.#setState(VoiceClientState.Failed);
      throw new Error(errorMessage);
    }
  }

  /**
   * Disconnects from the voice channel
   *
   * @returns A promise that resolves when disconnection is complete
   */
  async disconnect(): Promise<void> {
    // If already disconnected, nothing to do
    if (this.#state === VoiceClientState.Disconnected) {
      return;
    }

    this.#logDebug(
      `Disconnecting from voice channel: ${this.#connectionInfo.channelId}`,
    );

    // Update state
    this.#setState(VoiceClientState.Disconnecting);

    try {
      // Stop audio playback
      await this.#audioManager.stop();

      // Disconnect underlying clients
      this.#udp.disconnect();
      this.#closeWebSocket();

      // Clean up timers
      this.#clearIdleTimer();
      this.#clearConnectionTimeout();

      // Reset connection information
      this.#connectionInfo = {
        endpoint: null,
        token: null,
        resumeUrl: null,
        guildId: null,
        channelId: null,
        sessionId: null,
        userId: null,
      };

      // Reset state
      this.#ready = null;
      this.#identified = false;
      this.#negotiatedEncryptionMode = null;
      this.#setState(VoiceClientState.Disconnected);

      // Emit event
      this.emit("disconnect");
      this.#logDebug("Disconnected successfully");
    } catch (error) {
      // Reset state even on error
      this.#setState(VoiceClientState.Disconnected);
      const errorMessage = `Error during disconnect: ${error instanceof Error ? error.message : String(error)}`;
      this.#logDebug(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Changes voice channel within the same guild
   *
   * @param channelId - ID of the new channel
   * @returns A promise that resolves when the change is complete
   */
  async switchChannel(channelId: string): Promise<void> {
    // Check if we're connected
    if (!this.isReady) {
      throw new Error("Not connected");
    }

    // Check if the channel is different
    if (channelId === this.#connectionInfo.channelId) {
      return;
    }

    this.#logDebug(`Switching to channel: ${channelId}`);

    // Update channel ID
    this.#connectionInfo.channelId = channelId;

    // The actual update is handled at the main Gateway level
    // which sends the new VOICE_STATE_UPDATE and VOICE_SERVER_UPDATE events
  }

  /**
   * Plays an audio source
   *
   * @param source - Audio source to play
   * @param metadata - Optional metadata
   * @returns ID of the source in the queue
   */
  play(
    source: AudioSource,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    // Check if we're connected
    if (!this.isReady) {
      this.#logDebug(
        `Cannot play audio - not in Connected state (current: ${this.#state})`,
      );
      throw new Error(
        `Cannot play audio - not connected (state: ${this.#state})`,
      );
    }

    this.#logDebug(
      `Playing audio${metadata ? ` with metadata: ${JSON.stringify(metadata)}` : ""}`,
    );

    // Update activity timestamp
    this.#updateActivity();

    // Ask the audio manager to play the source
    return this.#audioManager.enqueue(source, metadata);
  }

  /**
   * Updates the bot's speaking status
   *
   * @param speaking - true to indicate the bot is speaking, false otherwise
   * @returns true if the update was successful
   */
  setSpeaking(speaking: boolean): boolean {
    const flags = speaking ? VoiceSpeakingFlags.Microphone : 0;
    return this.updateSpeaking(flags);
  }

  /**
   * Updates the speaking status with specific flags
   *
   * @param speaking - Speaking flags to set
   * @param delay - Audio delay (usually 0)
   * @returns true if the update was sent successfully
   */
  updateSpeaking(speaking: number, delay = 0): boolean {
    if (!this.isReady || this.ssrc === null) {
      this.#logDebug("Cannot update speaking status - not ready or no SSRC");
      return false;
    }

    try {
      this.#logDebug(
        `Updating speaking status: flags=${speaking}, delay=${delay}`,
      );
      this.send(VoiceOpcodes.Speaking, {
        speaking,
        delay,
        ssrc: this.ssrc,
      });
      return true;
    } catch (error) {
      this.#logDebug(
        `Failed to update speaking status: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Sends a message to the voice gateway
   *
   * @param op - Operation code to send
   * @param d - Data associated with the operation
   * @throws {Error} If the connection is not established
   */
  send<T extends keyof VoiceSendEvents>(op: T, d: VoiceSendEvents[T]): void {
    if (!this.isWsConnected) {
      throw new Error("Cannot send message: WebSocket not connected");
    }

    const payload: VoicePayloadEntity = { op, d };
    const payloadStr = JSON.stringify(payload);

    this.#logDebug(
      `Sending opcode ${op}: ${payloadStr.length > 200 ? `${payloadStr.substring(0, 200)}...` : payloadStr}`,
    );

    this.#ws?.send(payloadStr);
  }

  /**
   * Selects the UDP protocol for audio transmission
   *
   * @param address - Discovered external IP address
   * @param port - Discovered external UDP port
   * @param mode - Encryption mode to use
   * @returns true if the selection was sent successfully
   */
  selectProtocol(address: string, port: number, mode: string): boolean {
    try {
      this.#logDebug(
        `Selecting protocol: address=${address}, port=${port}, mode=${mode}`,
      );

      this.send(VoiceOpcodes.SelectProtocol, {
        protocol: "udp",
        data: {
          address,
          port,
          mode,
        },
      });
      return true;
    } catch (error) {
      this.#logDebug(
        `Failed to select protocol: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Attempts to resume a previously established session
   *
   * @returns true if the resume attempt was sent
   */
  resume(): boolean {
    const { guildId, sessionId, token } = this.#connectionInfo;

    if (!(guildId && sessionId && token && this.isWsConnected)) {
      this.#logDebug(
        "Cannot resume: missing connection information or WebSocket not connected",
      );
      return false;
    }

    try {
      this.#logDebug(`Attempting to resume session: ${sessionId}`);

      const payload: VoiceResumeEntity = {
        server_id: guildId,
        session_id: sessionId,
        token,
      };

      // Add seq_ack for versions 8+
      if (this.version >= VoiceGatewayVersion.V8) {
        payload.seq_ack = this.#heartbeat.getSequenceAck();
        this.#logDebug(`Including seq_ack: ${payload.seq_ack}`);
      }

      this.send(VoiceOpcodes.Resume, payload);
      this.#setState(VoiceClientState.Resuming);
      return true;
    } catch (error) {
      this.#logDebug(
        `Failed to resume: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /**
   * Releases all resources used by this client
   */
  async destroy(): Promise<void> {
    this.#logDebug("Destroying voice client");

    // Disconnect first
    await this.disconnect();

    // Destroy underlying clients
    this.#udp.destroy();
    this.#heartbeat.destroy();

    // Destroy audio managers
    await this.#audioManager.destroy();
    await this.#player.destroy();

    // Destroy Opus service
    this.#opus.destroy();

    // Clean up event listeners
    this.removeAllListeners();

    this.#logDebug("Voice client destroyed");
  }

  /**
   * Sends an audio packet to the voice server
   * This is called directly by AudioPlayerService
   *
   * @param packet - Encoded audio packet to send
   * @param speakingFlags - Speaking flags to use
   */
  sendAudioPacket(packet: Uint8Array, speakingFlags: number): void {
    // Check if we're ready to send
    if (!this.isReady) {
      this.#logDebug("Cannot send audio packet: not connected");
      return;
    }

    // Update activity timestamp
    this.#updateActivity();

    // Update speaking status
    this.updateSpeaking(speakingFlags);

    // Send the packet
    this.#udp.sendAudioPacket(packet).catch((error) => {
      const errorMessage = `Audio send error: ${error instanceof Error ? error.message : String(error)}`;
      this.#logDebug(errorMessage);
      this.emit("error", new Error(errorMessage));
    });
  }

  /**
   * Initialize Opus and UDP services
   */
  async #initializeServices(): Promise<void> {
    try {
      // Initialize Opus service
      await this.#opus.initialize();

      // After Opus is initialized, initialize UDP
      await this.#udp.initialize();

      this.#logDebug("Services initialized successfully");
    } catch (error) {
      const errorMessage = `Initialization failed: ${error instanceof Error ? error.message : String(error)}`;
      this.#logDebug(errorMessage);
      this.emit("error", new Error(errorMessage));
    }
  }

  /**
   * Establishes a WebSocket connection to the voice gateway
   * @private
   */
  async #connectWebSocket(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Clean up any existing connection
      this.#closeWebSocket();

      // Get the full URL for the connection
      const url = this.#getGatewayUrl();
      this.#logDebug(`Connecting to WebSocket: ${url}`);

      try {
        // Create a new WebSocket connection
        this.#ws = new WebSocket(url);

        // Set up event listeners
        const ws = this.#ws;

        // Open event
        ws.once("open", () => {
          this.#logDebug("WebSocket connection opened");
          this.#clearConnectionTimeout();
          resolve();
        });

        // Message event
        ws.on("message", (data) => {
          this.#handleMessage(data);
        });

        // Close event
        ws.on("close", (code, reason) => {
          this.#logDebug(
            `WebSocket closed with code ${code}: ${reason || "No reason provided"}`,
          );
          this.#handleClose(code);
        });

        // Error event
        ws.on("error", (error) => {
          this.#logDebug(`WebSocket error: ${error.message}`);
          this.#handleError(error);

          // Reject the promise if we haven't resolved yet
          reject(error);
        });

        // Set up a timeout for the connection
        this.#setConnectionTimeout(() => {
          this.#logDebug(
            `Connection timeout of ${this.#options.connectionTimeout}ms exceeded`,
          );
          this.#closeWebSocket(1006, "Connection timeout exceeded");
          reject(new Error("WebSocket connection timeout exceeded"));
        });
      } catch (error) {
        this.#clearConnectionTimeout();
        this.#logDebug(
          `Error creating WebSocket: ${error instanceof Error ? error.message : String(error)}`,
        );
        reject(error);
      }
    });
  }

  /**
   * Closes the WebSocket connection properly
   *
   * @param code - WebSocket close code
   * @param reason - Close reason
   * @private
   */
  #closeWebSocket(code = 1000, reason = "Normal disconnection"): void {
    const ws = this.#ws;
    if (!ws) {
      return;
    }

    this.#logDebug(`Closing WebSocket with code ${code}: ${reason}`);

    try {
      // Remove all listeners to avoid callbacks after closing
      ws.removeAllListeners();

      // Close the connection
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close(code, reason);
      }
    } catch (error) {
      this.#logDebug(
        `Error closing WebSocket: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Ignore errors during closing
    } finally {
      this.#ws = null;
    }
  }

  /**
   * Builds the voice gateway URL with the appropriate version
   * @private
   */
  #getGatewayUrl(): string {
    const baseUrl =
      this.#connectionInfo.resumeUrl || this.#connectionInfo.endpoint;

    if (!baseUrl) {
      throw new Error("Gateway endpoint not available");
    }

    // Add the protocol if not present
    const url = baseUrl.startsWith("wss://") ? baseUrl : `wss://${baseUrl}`;

    // Add the version
    return `${url}?v=${this.version}`;
  }

  /**
   * Sets a timeout for the WebSocket connection
   *
   * @param callback - Function to call if the timeout is reached
   * @private
   */
  #setConnectionTimeout(callback: () => void): void {
    this.#clearConnectionTimeout();
    this.#connectionTimeout = setTimeout(
      callback,
      this.#options.connectionTimeout,
    );
  }

  /**
   * Clears the connection timeout
   * @private
   */
  #clearConnectionTimeout(): void {
    if (this.#connectionTimeout) {
      clearTimeout(this.#connectionTimeout);
      this.#connectionTimeout = null;
    }
  }

  /**
   * Updates the last activity timestamp
   * @private
   */
  #updateActivity(): void {
    this.#lastActivity = Date.now();
  }

  /**
   * Starts the inactivity check timer
   * @private
   */
  #startIdleTimer(): void {
    // Clean up any existing timer
    this.#clearIdleTimer();

    // If automatic disconnection is disabled, do nothing
    if (this.#options.idleTimeout <= 0) {
      return;
    }

    this.#logDebug(
      `Starting idle timer with timeout: ${this.#options.idleTimeout}ms`,
    );

    // Initialize activity timestamp
    this.#updateActivity();

    // Create a new timer
    this.#idleTimer = setInterval(() => {
      const idleTime = Date.now() - this.#lastActivity;

      // Disconnect if inactive for too long
      if (idleTime >= this.#options.idleTimeout) {
        this.#logDebug(`Idle timeout reached: ${idleTime}ms`);
        this.disconnect().catch((error) => {
          const errorMessage = `Error during automatic disconnection: ${error instanceof Error ? error.message : String(error)}`;
          this.#logDebug(errorMessage);
          this.emit("error", new Error(errorMessage));
        });
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Clears the inactivity check timer
   * @private
   */
  #clearIdleTimer(): void {
    if (this.#idleTimer) {
      clearInterval(this.#idleTimer);
      this.#idleTimer = null;
    }
  }

  /**
   * Handles a message received from the voice gateway
   *
   * @param data - Raw data received
   * @private
   */
  #handleMessage(data: WebSocket.Data): void {
    try {
      // Convert data to string if necessary
      let message: string;
      if (Buffer.isBuffer(data)) {
        message = data.toString();
      } else {
        message = data as string;
      }

      // Parse JSON
      const payload = JSON.parse(message) as VoicePayloadEntity;
      const { op, d, seq } = payload;

      this.#logDebug(
        `Received opcode ${op}${seq !== undefined ? ` with seq ${seq}` : ""}`,
      );

      // Update sequence number for V8+ buffered resume
      if (seq !== undefined && this.version >= VoiceGatewayVersion.V8) {
        this.#heartbeat.setSequenceAck(seq);
      }

      // Process based on operation code
      switch (op) {
        case VoiceOpcodes.Ready:
          this.#handleReady(d as VoiceReadyEntity);
          break;

        case VoiceOpcodes.SessionDescription:
          this.#handleSessionDescription(d as VoiceSessionDescriptionEntity);
          break;

        case VoiceOpcodes.Speaking:
          this.#handleSpeaking(d as VoiceSpeakingEntity);
          break;

        case VoiceOpcodes.HeartbeatAck:
          this.#handleHeartbeatAck();
          break;

        case VoiceOpcodes.Hello:
          this.#handleHello(d as VoiceHelloEntity);
          break;

        case VoiceOpcodes.Resumed:
          this.#handleResumed();
          break;

        // Other opcodes are ignored for now
        default:
          this.#logDebug(`Unhandled opcode: ${op}`);
          break;
      }
    } catch (error) {
      const errorMessage = `Error processing message: ${error instanceof Error ? error.message : String(error)}`;
      this.#logDebug(errorMessage);
      this.emit("error", new Error(errorMessage));
    }
  }

  /**
   * Handles the closure of the WebSocket connection
   *
   * @param code - Close code
   * @private
   */
  #handleClose(code: number): void {
    // Stop heartbeats immediately
    this.#heartbeat.destroy();

    // Check if we can resume the session
    const canResume = this.#canResume(code);
    this.#logDebug(
      `WebSocket closed with code ${code}, can resume: ${canResume}`,
    );

    // Clean up if we can't resume
    if (!canResume) {
      this.#cleanup();
    }

    // Update state
    if (this.#state !== VoiceClientState.Disconnecting) {
      if (canResume) {
        this.#setState(VoiceClientState.Resuming);
        this.#attemptReconnect();
      } else {
        this.#setState(VoiceClientState.Failed);
        // Complete disconnection after a short delay
        setTimeout(() => this.disconnect(), 1000);
      }
    }
  }

  /**
   * Handles a connection error
   *
   * @param error - The error that occurred
   * @private
   */
  #handleError(error: Error): void {
    this.#logDebug(`Connection error: ${error.message}`);
    this.emit("error", error);
  }

  /**
   * Handles a Hello message from the gateway
   *
   * @param data - Hello data received
   * @private
   */
  #handleHello(data: VoiceHelloEntity): void {
    this.#logDebug(
      `Received Hello with heartbeat interval: ${data.heartbeat_interval}ms`,
    );

    // First connection should always identify, not resume
    if (this.#firstConnection) {
      this.#logDebug("First connection, identifying");
      this.#identify();
      this.#firstConnection = false;
    }
    // Only try to resume if we were previously identified (reconnecting)
    else if (this.#connectionInfo.sessionId && !this.#identified) {
      this.#logDebug("Attempting to resume previous session");
      this.resume();
    }
    // Default case - identify
    else if (!this.#identified) {
      this.#logDebug("Not identified, sending identify");
      this.#identify();
    }

    // Start heartbeats
    this.#heartbeat.start(data.heartbeat_interval);
  }

  /**
   * Handles a Ready message from the gateway
   *
   * @param data - Ready data received
   * @private
   */
  #handleReady(data: VoiceReadyEntity): void {
    this.#logDebug(
      `Received Ready with SSRC: ${data.ssrc}, IP: ${data.ip}, port: ${data.port}`,
    );
    this.#logDebug(`Available encryption modes: ${data.modes.join(", ")}`);

    // Store Ready information
    this.#ready = data;
    this.#identified = true;

    // Update state
    this.#setState(VoiceClientState.ConnectingUdp);

    // Negotiate encryption mode before connecting UDP
    this.#negotiateEncryptionMode(data.modes);

    // Connect to the UDP server
    this.#udp
      .connect({
        ip: data.ip,
        port: data.port,
        ssrc: data.ssrc,
      })
      .catch(async (error) => {
        const errorMessage = `UDP connection failed: ${error instanceof Error ? error.message : String(error)}`;
        this.#logDebug(errorMessage);
        this.emit("error", new Error(errorMessage));

        await this.disconnect();
      });
  }

  /**
   * Handles a Resumed message from the gateway
   * @private
   */
  #handleResumed(): void {
    this.#logDebug("Successfully resumed session");

    // Update state
    this.#setState(VoiceClientState.Connected);

    // Start heartbeats if they aren't already running
    if (!this.#heartbeat.isActive) {
      this.#logDebug("Restarting heartbeats after resume");
      this.#heartbeat.start(this.#ready?.heartbeat_interval || 30000);
    }

    // Reconnect UDP if needed
    if (this.#ready && !this.#udp.isReady) {
      this.#logDebug("Reconnecting UDP after resume");
      this.#udp
        .connect({
          ip: this.#ready.ip,
          port: this.#ready.port,
          ssrc: this.#ready.ssrc,
        })
        .catch((error) => {
          this.#logDebug(
            `Failed to reconnect UDP after resume: ${error instanceof Error ? error.message : String(error)}`,
          );
          this.emit(
            "error",
            new Error(
              `UDP reconnection failed after resume: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
        });
    }
  }

  /**
   * Handles a SessionDescription message from the gateway
   *
   * @param data - SessionDescription data received
   * @private
   */
  #handleSessionDescription(data: VoiceSessionDescriptionEntity): void {
    this.#logDebug(`Received SessionDescription with mode: ${data.mode}`);

    // Set the secret key for encryption
    this.#udp.setSecretKey(data.secret_key, data.mode);

    // Update negotiated mode
    this.#negotiatedEncryptionMode = data.mode;

    // Connected and ready
    this.#setState(VoiceClientState.Connected);

    // Start inactivity timer
    this.#startIdleTimer();

    // Emit event
    this.emit("ready");
    this.#logDebug("Voice connection established and ready");
  }

  /**
   * Handles a heartbeat acknowledgement
   *
   * @private
   */
  #handleHeartbeatAck(): void {
    this.#logDebug("Received heartbeat acknowledgement");
    // Inform the heartbeat manager
    this.#heartbeat.acknowledgeHeartbeat();
  }

  /**
   * Handles a Speaking message from the gateway
   *
   * @param data - Speaking data received
   * @private
   */
  #handleSpeaking(data: VoiceSpeakingEntity): void {
    if (typeof data !== "object" || data === null) {
      return;
    }

    const speakingFlags = data.speaking;
    const ssrc = data.ssrc;

    this.#logDebug(
      `Received Speaking event: SSRC=${ssrc}, flags=${speakingFlags}`,
    );

    // Emit appropriate event
    this.emit("speaking", ssrc, speakingFlags > 0, speakingFlags);
  }

  /**
   * Handles IP discovery success
   *
   * @param info - Discovered IP information
   * @private
   */
  async #handleIpDiscovered(info: {
    address: string;
    port: number;
  }): Promise<void> {
    this.#logDebug(
      `IP discovery successful: address=${info.address}, port=${info.port}`,
    );

    // Emit event
    this.emit("ipDiscovered", info);

    // Select protocol on the voice gateway
    if (!this.#negotiatedEncryptionMode) {
      const errorMessage =
        "Cannot select protocol: Encryption mode not negotiated";
      this.#logDebug(errorMessage);
      this.emit("error", new Error(errorMessage));
      await this.disconnect();
      return;
    }

    // Send Select Protocol opcode
    this.selectProtocol(
      info.address,
      info.port,
      this.#negotiatedEncryptionMode,
    );
  }

  /**
   * Identifies with the voice gateway
   * @private
   */
  #identify(): void {
    const { guildId, userId, sessionId, token } = this.#connectionInfo;

    if (!(guildId && userId && sessionId && token)) {
      const errorMessage = "Cannot identify: Incomplete connection information";
      this.#logDebug(errorMessage);
      throw new Error(errorMessage);
    }

    this.#logDebug(`Identifying with session ID: ${sessionId}`);

    // Build identification payload
    const payload: VoiceIdentifyEntity = {
      server_id: guildId,
      user_id: userId,
      session_id: sessionId,
      token: token,
    };

    // Add DAVE protocol support if configured
    if (this.#options.maxDaveProtocolVersion > 0) {
      payload.max_dave_protocol_version = this.#options.maxDaveProtocolVersion;
      this.#logDebug(
        `Including DAVE protocol version: ${payload.max_dave_protocol_version}`,
      );
    }

    // Send identification
    this.send(VoiceOpcodes.Identify, payload);

    // Update state
    this.#setState(VoiceClientState.Identifying);
  }

  /**
   * Attempts to reconnect after a disconnection
   * @private
   */
  #attemptReconnect(): void {
    const now = Date.now();

    // Limit reconnection attempt frequency
    if (now - this.#lastReconnectAttempt < 1000) {
      return;
    }

    this.#lastReconnectAttempt = now;
    this.#logDebug("Attempting to reconnect");

    // Try to reconnect
    this.#connectWebSocket().catch((error) => {
      const errorMessage = `Reconnection failed: ${error instanceof Error ? error.message : String(error)}`;
      this.#logDebug(errorMessage);
      this.emit("error", new Error(errorMessage));

      // Schedule another reconnect attempt
      setTimeout(() => {
        if (this.#state === VoiceClientState.Resuming) {
          this.#attemptReconnect();
        }
      }, 5000);
    });
  }

  /**
   * Determines if a session can be resumed based on the close code
   *
   * @param code - WebSocket close code
   * @returns true if the session can be resumed
   * @private
   */
  #canResume(code: number): boolean {
    // Check if the code is in the list of non-resumable codes
    return !this.#options.nonResumableCodes.includes(code);
  }

  /**
   * Negotiates the encryption mode to use
   *
   * @param availableModes - Available modes offered by Discord
   * @private
   */
  #negotiateEncryptionMode(availableModes: string[]): void {
    this.#logDebug(
      `Negotiating encryption mode from available modes: ${availableModes.join(", ")}`,
    );

    let selectedMode: string | null = null;

    // If a preferred mode is specified, check if it's available
    if (
      this.#options.preferredEncryptionMode &&
      availableModes.includes(this.#options.preferredEncryptionMode)
    ) {
      selectedMode = this.#options.preferredEncryptionMode;
      this.#logDebug(`Using preferred encryption mode: ${selectedMode}`);
    } else {
      // Otherwise, try to use one of the recommended modes
      // AeadAes256GcmRtpsize is preferred if available
      if (availableModes.includes(VoiceEncryptionMode.AeadAes256GcmRtpsize)) {
        selectedMode = VoiceEncryptionMode.AeadAes256GcmRtpsize;
        this.#logDebug("Selected AeadAes256GcmRtpsize encryption mode");
      } else if (
        availableModes.includes(
          VoiceEncryptionMode.AeadXchacha20Poly1305Rtpsize,
        )
      ) {
        selectedMode = VoiceEncryptionMode.AeadXchacha20Poly1305Rtpsize;
        this.#logDebug("Selected AeadXchacha20Poly1305Rtpsize encryption mode");
      }
    }

    // If no acceptable mode is found, use the first available mode
    if (!selectedMode && availableModes.length > 0) {
      selectedMode = availableModes[0] as string;
      this.#logDebug(
        `Falling back to first available encryption mode: ${selectedMode}`,
      );
    }

    // If no mode is available, it's a fatal error
    if (!selectedMode) {
      const errorMessage = "No compatible encryption mode available";
      this.#logDebug(errorMessage);
      throw new Error(errorMessage);
    }

    // Store the negotiated mode
    this.#negotiatedEncryptionMode = selectedMode;
    this.#logDebug(`Negotiated encryption mode: ${selectedMode}`);
  }

  /**
   * Updates the client state and emits an event if changed
   *
   * @param newState - New state to set
   * @private
   */
  #setState(newState: VoiceClientState): void {
    if (this.#state === newState) {
      return;
    }

    const oldState = this.#state;
    this.#state = newState;

    this.#logDebug(`State changed from ${oldState} to ${newState}`);
    this.emit("stateChange", newState, oldState);
  }

  /**
   * Sets up event listeners for the underlying components
   * @private
   */
  #setupEventListeners(): void {
    // UDP client listeners
    this.#udp.on("ready", () => {
      this.#logDebug("UDP ready event received");
      // State is updated after IP discovery
    });

    this.#udp.on("ipDiscovered", async (address, port) => {
      this.#logDebug(`IP discovered: address=${address}, port=${port}`);
      await this.#handleIpDiscovered({ address, port });
    });

    this.#udp.on("audioPacket", (data, sequence, timestamp, ssrc) => {
      this.#logDebug(
        `Audio packet received: seq=${sequence}, timestamp=${timestamp}, ssrc=${ssrc}`,
      );
      this.emit("audioReceived", data, null);
    });

    this.#udp.on("error", (error) => {
      this.#logDebug(`UDP error: ${error.message}`);
      this.emit("error", error);
    });

    // Audio manager listeners
    this.#audioManager.on("start", (item, position) => {
      this.#logDebug(
        `Audio playback started: ${JSON.stringify(item.metadata)}, position=${position}`,
      );
      this.#updateActivity();
      this.emit("audioStart", item.metadata, position);
    });

    this.#audioManager.on("finish", (item) => {
      this.#logDebug(
        `Audio playback finished: ${JSON.stringify(item.metadata)}`,
      );
      this.emit("audioEnd", item.metadata);
    });

    this.#audioManager.on("queueEnd", () => {
      this.#logDebug("Audio queue ended");
      this.emit("queueEnd");
    });

    this.#audioManager.on("error", (error) => {
      this.#logDebug(`Audio manager error: ${error.message}`);
      this.emit("error", error);
    });
  }

  /**
   * Cleans up resources and resets state
   * @private
   */
  #cleanup(): void {
    this.#logDebug("Cleaning up resources");

    // Stop heartbeats
    this.#heartbeat.destroy();

    // Reset flags
    this.#identified = false;
    this.#firstConnection = true;

    // Reset Ready data
    this.#ready = null;
  }

  /**
   * Log debug messages if debug mode is enabled
   * @private
   */
  #logDebug(_message: string): void {
    if (this.#options.debug) {
    }
  }
}
