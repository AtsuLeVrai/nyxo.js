import type { Readable } from "node:stream";
import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import { HeartbeatManager, UdpManager } from "../managers/index.js";
import {
  AudioService,
  type AudioServiceOptions,
  RtpService,
  type RtpServiceOptions,
} from "../services/index.js";
import {
  SpeakingMode,
  VoiceConnectionStatus,
  VoiceEncryptionMode,
  VoiceGatewayVersion,
  type VoiceIdentifyEntity,
  VoiceOpcodes,
  type VoicePayloadEntity,
  type VoiceReadyEntity,
  type VoiceSelectProtocolEntity,
  type VoiceSessionDescriptionEntity,
} from "../types/index.js";

/**
 * Voice connection configuration options
 */
export const VoiceConnectionOptions = z.object({
  /**
   * Discord bot token for authentication
   */
  token: z.string(),

  /**
   * User ID of the client establishing the connection
   */
  userId: z.string(),

  /**
   * Server ID (guild ID) this voice connection is for
   */
  guildId: z.string(),

  /**
   * Channel ID for the voice channel to connect to
   * Set to null to disconnect from voice
   */
  channelId: z.string().nullable(),

  /**
   * Session ID obtained from the main gateway
   */
  sessionId: z.string(),

  /**
   * Voice server token received from voice server update event
   */
  serverToken: z.string(),

  /**
   * Voice server endpoint received from voice server update event
   * This should be the hostname without protocol (e.g. "us-west.voice.discord.gg")
   */
  endpoint: z.string(),

  /**
   * Voice Gateway version to use
   * @default VoiceGatewayVersion.V8
   */
  gatewayVersion: z
    .nativeEnum(VoiceGatewayVersion)
    .default(VoiceGatewayVersion.V8),

  /**
   * Whether to self-mute
   * @default false
   */
  selfMute: z.boolean().default(false),

  /**
   * Whether to self-deafen
   * @default false
   */
  selfDeaf: z.boolean().default(false),

  /**
   * Whether to enable debug logging
   * @default false
   */
  debug: z.boolean().default(false),

  /**
   * Whether to automatically reconnect if disconnected
   * @default true
   */
  autoReconnect: z.boolean().default(true),

  /**
   * Maximum number of reconnection attempts
   * @default 5
   */
  maxReconnectAttempts: z.number().int().positive().default(5),

  /**
   * Reconnection backoff schedule in milliseconds
   * @default [1000, 2000, 5000, 10000]
   */
  reconnectBackoff: z
    .array(z.number().int().positive())
    .default([1000, 2000, 5000, 10000]),

  /**
   * Preferred encryption mode for voice data
   * @default VoiceEncryptionMode.AeadAes256GcmRtpSize
   */
  preferredEncryptionMode: z
    .nativeEnum(VoiceEncryptionMode)
    .default(VoiceEncryptionMode.AeadAes256GcmRtpSize),
});

export type VoiceConnectionOptions = z.infer<typeof VoiceConnectionOptions>;

/**
 * Events emitted by the Voice Connection
 */
export interface VoiceConnectionEvents {
  /**
   * Emitted when the connection status changes
   * @param status New connection status
   * @param previous Previous connection status
   */
  statusChange: [
    status: VoiceConnectionStatus,
    previous: VoiceConnectionStatus,
  ];

  /**
   * Emitted when the connection is ready to transmit audio
   */
  ready: [];

  /**
   * Emitted when the connection is disconnected
   * @param code Disconnect code
   * @param reason Reason for disconnect
   */
  disconnect: [code: number, reason: string];

  /**
   * Emitted when the connection fails
   * @param error The error that occurred
   */
  error: [error: Error];

  /**
   * Emitted when speaking state changes
   * @param speaking New speaking state
   */
  speaking: [speaking: number];

  /**
   * Emitted when a voice packet is received
   * @param userId User ID of the speaker
   * @param opusPacket Opus encoded packet
   * @param sequence Sequence number
   */
  voicePacket: [userId: string, opusPacket: Buffer, sequence: number];

  /**
   * Emitted when a user speaking state changes
   * @param userId User ID that changed state
   * @param speaking Whether they are speaking
   */
  userSpeaking: [userId: string, speaking: boolean];

  /**
   * Emitted when a WebSocket message is received
   * @param data The message data
   */
  wsMessage: [data: VoicePayloadEntity];

  /**
   * Emitted when a debug message is generated
   * @param message Debug message
   */
  debug: [message: string];

  /**
   * Emitted when audio playback starts
   * @param streamId Unique identifier for the stream
   */
  playbackStart: [streamId: string];

  /**
   * Emitted when audio playback ends
   * @param streamId Unique identifier for the stream
   */
  playbackEnd: [streamId: string];
}

/**
 * Voice connection state and statistics
 */
export interface VoiceConnectionState {
  /**
   * Current connection status
   */
  status: VoiceConnectionStatus;

  /**
   * Ping to the voice server in milliseconds
   */
  ping: number;

  /**
   * SSRC assigned by Discord's voice server
   */
  ssrc: number | null;

  /**
   * Selected encryption mode
   */
  encryptionMode: VoiceEncryptionMode | null;

  /**
   * Server IP address for UDP connection
   */
  serverIp: string | null;

  /**
   * Server port for UDP connection
   */
  serverPort: number | null;

  /**
   * Local address bound by the UDP socket
   */
  localAddress: string | null;

  /**
   * Local port bound by the UDP socket
   */
  localPort: number | null;

  /**
   * Discovered external IP address
   */
  externalIp: string | null;

  /**
   * Discovered external port
   */
  externalPort: number | null;

  /**
   * Whether UDP is connected
   */
  udpConnected: boolean;

  /**
   * Whether WebSocket is connected
   */
  wsConnected: boolean;

  /**
   * Whether audio is playing
   */
  playing: boolean;

  /**
   * Current speaking state
   */
  speaking: number;

  /**
   * Number of packets sent
   */
  packetsSent: number;

  /**
   * Number of packets received
   */
  packetsReceived: number;

  /**
   * Time when the connection became ready
   */
  readyTimestamp: number | null;

  /**
   * Connection uptime in milliseconds
   */
  uptime: number;
}

/**
 * Main voice connection class
 *
 * Manages the lifecycle of a Discord voice connection, including:
 * - WebSocket connection to voice gateway
 * - UDP connection for voice data
 * - RTP packet encryption and transmission
 * - Audio processing and playback
 */
export class VoiceConnection extends EventEmitter<VoiceConnectionEvents> {
  /**
   * Validated configuration options
   * @private
   */
  readonly #options: VoiceConnectionOptions;

  /**
   * WebSocket connection to Discord's voice gateway
   * @private
   */
  #ws: WebSocket | null = null;

  /**
   * UDP manager for voice data transmission
   * @private
   */
  #udpManager: UdpManager | null = null;

  /**
   * RTP service for packet encryption/decryption
   * @private
   */
  #rtpService: RtpService | null = null;

  /**
   * Audio service for processing and encoding
   * @private
   */
  #audioService: AudioService | null = null;

  /**
   * Heartbeat manager for WebSocket connection
   * @private
   */
  #heartbeat: HeartbeatManager | null = null;

  /**
   * SSRC assigned by Discord's voice server
   * @private
   */
  #ssrc: number | null = null;

  /**
   * Secret key for encryption
   * @private
   */
  #secretKey: Uint8Array | null = null;

  /**
   * Selected encryption mode
   * @private
   */
  #encryptionMode: VoiceEncryptionMode | null = null;

  /**
   * Available encryption modes offered by the server
   * @private
   */
  #availableModes: VoiceEncryptionMode[] = [];

  /**
   * Server IP address for UDP connection
   * @private
   */
  #serverIp: string | null = null;

  /**
   * Server port for UDP connection
   * @private
   */
  #serverPort: number | null = null;

  /**
   * Current connection status
   * @private
   */
  #status: VoiceConnectionStatus = VoiceConnectionStatus.Signaling;

  /**
   * Whether the connection is ready to transmit audio
   * @private
   */
  #ready = false;

  /**
   * Number of reconnection attempts
   * @private
   */
  #reconnectAttempts = 0;

  /**
   * Time when the connection became ready
   * @private
   */
  #readyTime: number | null = null;

  /**
   * Ongoing reconnection timeout
   * @private
   */
  #reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Packet queue size stats
   * @private
   */
  #packetStats = {
    sent: 0,
    received: 0,
  };

  /**
   * Creates a new voice connection
   *
   * @param options Configuration options for the voice connection
   */
  constructor(options: z.input<typeof VoiceConnectionOptions>) {
    super();

    // Validate options
    this.#options = VoiceConnectionOptions.parse(options);

    // Set initial status
    this.#setStatus(VoiceConnectionStatus.Signaling);
  }

  /**
   * Gets the current connection status
   * @returns Current status of the voice connection
   */
  get status(): VoiceConnectionStatus {
    return this.#status;
  }

  /**
   * Gets whether the connection is ready for audio transmission
   * @returns True if connection is ready, false otherwise
   */
  get isReady(): boolean {
    return this.#ready && this.#status === VoiceConnectionStatus.Connected;
  }

  /**
   * Gets the guild ID for this connection
   * @returns Guild ID
   */
  get guildId(): string {
    return this.#options.guildId;
  }

  /**
   * Gets the channel ID for this connection
   * @returns Channel ID or null if not connected to a channel
   */
  get channelId(): string | null {
    return this.#options.channelId;
  }

  /**
   * Gets the ping to the voice server in milliseconds
   * @returns Ping in milliseconds, or -1 if not connected
   */
  get ping(): number {
    return this.#heartbeat?.latency ?? -1;
  }

  /**
   * Gets the encryption mode being used
   * @returns Encryption mode or null if not connected
   */
  get encryptionMode(): VoiceEncryptionMode | null {
    return this.#encryptionMode;
  }

  /**
   * Gets the available encryption modes offered by the server
   * @returns Array of available encryption modes
   */
  get availableModes(): VoiceEncryptionMode[] {
    return [...this.#availableModes];
  }

  /**
   * Gets the time when the connection became ready
   * @returns Timestamp in milliseconds, or null if not ready
   */
  get readyTime(): number | null {
    return this.#readyTime;
  }

  /**
   * Gets the uptime of the connection in milliseconds
   * @returns Uptime in milliseconds, or 0 if not connected
   */
  get uptime(): number {
    if (!this.#readyTime) {
      return 0;
    }
    return Date.now() - this.#readyTime;
  }

  /**
   * Gets the UDP manager for this connection
   * @returns UDP manager instance or null if not initialized
   */
  get udpManager(): UdpManager | null {
    return this.#udpManager;
  }

  /**
   * Gets the RTP service for this connection
   * @returns RTP service instance or null if not initialized
   */
  get rtpService(): RtpService | null {
    return this.#rtpService;
  }

  /**
   * Gets the audio service for this connection
   * @returns Audio service instance or null if not initialized
   */
  get audioService(): AudioService | null {
    return this.#audioService;
  }

  /**
   * Gets current state information about the voice connection
   * @returns Voice connection state object
   */
  getState(): VoiceConnectionState {
    return {
      status: this.#status,
      ping: this.ping,
      ssrc: this.#ssrc,
      encryptionMode: this.#encryptionMode,
      serverIp: this.#serverIp,
      serverPort: this.#serverPort,
      localAddress: this.#udpManager?.localPort ? this.#options.endpoint : null,
      localPort: this.#udpManager?.localPort ?? null,
      externalIp: this.#udpManager?.externalIp ?? null,
      externalPort: this.#udpManager?.externalPort ?? null,
      udpConnected: !!this.#udpManager?.isReady,
      wsConnected: this.#ws?.readyState === WebSocket.OPEN,
      playing: (this.#audioService?.activeStreams ?? 0) > 0,
      speaking: this.#audioService?.speaking ?? 0,
      packetsSent: this.#packetStats.sent,
      packetsReceived: this.#packetStats.received,
      readyTimestamp: this.#readyTime,
      uptime: this.uptime,
    };
  }

  /**
   * Connects to Discord's voice server
   *
   * Establishes both WebSocket and UDP connections needed for voice transmission.
   *
   * @returns Promise that resolves when connected
   * @throws {Error} If connection fails
   */
  async connect(): Promise<void> {
    // Skip if already connected
    if (this.#status === VoiceConnectionStatus.Connected && this.#ready) {
      return;
    }

    try {
      // Update status
      this.#setStatus(VoiceConnectionStatus.Connecting);

      // Debug log
      this.#debug("Connecting to voice server", {
        endpoint: this.#options.endpoint,
        guildId: this.#options.guildId,
        channelId: this.#options.channelId,
      });

      // Step 1: Connect to voice WebSocket gateway
      await this.#connectWebSocket();

      // Wait for connection to be ready
      await this.#waitForReady();

      // Reset reconnect attempts on successful connection
      this.#reconnectAttempts = 0;

      // Update status
      this.#setStatus(VoiceConnectionStatus.Connected);
      this.#ready = true;
      this.#readyTime = Date.now();

      // Emit ready event
      this.emit("ready");

      this.#debug("Voice connection ready", {
        guildId: this.#options.guildId,
        channelId: this.#options.channelId,
        ssrc: this.#ssrc,
        encryptionMode: this.#encryptionMode,
      });
    } catch (error) {
      // Clean up resources on failure
      this.#cleanup();

      // Update status
      this.#setStatus(VoiceConnectionStatus.Disconnected);

      // Emit error
      const wrappedError =
        error instanceof Error
          ? error
          : new Error(`Failed to connect: ${String(error)}`);

      this.emit("error", wrappedError);

      // Attempt reconnection if auto-reconnect is enabled
      this.#attemptReconnect();

      // Rethrow error
      throw wrappedError;
    }
  }

  /**
   * Disconnects from the voice server
   *
   * @param code WebSocket close code (defaults to 1000 - Normal Closure)
   * @param reason Reason for disconnection
   */
  disconnect(code = 1000, reason = "Normal closure"): void {
    // Skip if already disconnected
    if (this.#status === VoiceConnectionStatus.Disconnected) {
      return;
    }

    // Update status
    this.#setStatus(VoiceConnectionStatus.Disconnected);

    // Emit disconnect event
    this.emit("disconnect", code, reason);

    // Clean up resources
    this.#cleanup();

    this.#debug("Disconnected from voice server", { code, reason });
  }

  /**
   * Plays audio from a stream
   *
   * @param stream Readable stream with PCM audio data
   * @param options Playback options
   * @returns Promise that resolves when playback completes
   * @throws {Error} If not connected or audio service is not initialized
   */
  async playStream(
    stream: Readable,
    options: {
      volume?: number;
      speakingMode?: SpeakingMode;
      id?: string;
    } = {},
  ): Promise<string> {
    // Ensure connection is ready
    if (!this.isReady) {
      throw new Error("Cannot play audio: Voice connection not ready");
    }

    // Ensure audio service is initialized
    if (!this.#audioService) {
      throw new Error("Cannot play audio: Audio service not initialized");
    }

    try {
      // Set volume from options or default
      const volume = options.volume ?? 1.0;

      // Set speaking mode from options or default
      const speakingMode = options.speakingMode ?? SpeakingMode.Microphone;

      // Play the stream
      const streamId = await this.#audioService.playStream(
        stream,
        speakingMode,
        {
          id: options.id,
          volume,
        },
      );

      return streamId;
    } catch (error) {
      const wrappedError =
        error instanceof Error
          ? error
          : new Error(`Failed to play stream: ${String(error)}`);

      this.emit("error", wrappedError);
      throw wrappedError;
    }
  }

  /**
   * Plays audio from a PCM buffer
   *
   * @param buffer PCM audio data
   * @param options Playback options
   * @returns Promise that resolves when playback completes
   * @throws {Error} If not connected or audio service is not initialized
   */
  async playPcm(
    buffer: Buffer,
    options: {
      volume?: number;
      speakingMode?: SpeakingMode;
    } = {},
  ): Promise<string> {
    // Ensure connection is ready
    if (!this.isReady) {
      throw new Error("Cannot play audio: Voice connection not ready");
    }

    // Ensure audio service is initialized
    if (!this.#audioService) {
      throw new Error("Cannot play audio: Audio service not initialized");
    }

    try {
      // Set volume from options or default
      const volume = options.volume ?? 1.0;

      // Set speaking mode from options or default
      const speakingMode = options.speakingMode ?? SpeakingMode.Microphone;

      // Play the PCM buffer
      return await this.#audioService.playPcmBuffer(buffer, speakingMode, {
        volume,
      });
    } catch (error) {
      const wrappedError =
        error instanceof Error
          ? error
          : new Error(`Failed to play PCM: ${String(error)}`);

      this.emit("error", wrappedError);
      throw wrappedError;
    }
  }

  /**
   * Stops playing a specific audio stream
   *
   * @param streamId ID of the stream to stop
   * @returns True if stream was found and stopped, false otherwise
   */
  stopStream(streamId: string): boolean {
    if (!this.#audioService) {
      return false;
    }

    return this.#audioService.stopStream(streamId);
  }

  /**
   * Stops all playing audio streams
   */
  stopAllStreams(): void {
    if (this.#audioService) {
      this.#audioService.stopAllStreams();
    }
  }

  /**
   * Pauses audio playback
   */
  pauseAudio(): void {
    if (this.#audioService) {
      this.#audioService.pause();
    }
  }

  /**
   * Resumes paused audio playback
   */
  resumeAudio(): void {
    if (this.#audioService) {
      this.#audioService.resume();
    }
  }

  /**
   * Sets the volume for a specific audio stream
   *
   * @param streamId ID of the stream to adjust
   * @param volume New volume level (0.0-2.0)
   * @returns True if stream was found and volume adjusted, false otherwise
   */
  setStreamVolume(streamId: string, volume: number): boolean {
    if (!this.#audioService) {
      return false;
    }

    return this.#audioService.setStreamVolume(streamId, volume);
  }

  /**
   * Sets global volume for all audio streams
   *
   * @param volume New volume level (0.0-2.0)
   */
  setGlobalVolume(volume: number): void {
    if (this.#audioService) {
      this.#audioService.setGlobalVolume(volume);
    }
  }

  /**
   * Updates self-mute and self-deaf settings
   *
   * @param mute Whether to self-mute
   * @param deaf Whether to self-deafen
   */
  setSelfDeaf(mute: boolean, deaf: boolean): void {
    this.#options.selfMute = mute;
    this.#options.selfDeaf = deaf;

    // If connected, update voice state through WebSocket
    if (this.#ws && this.#ws.readyState === WebSocket.OPEN) {
      this.#sendVoiceStateUpdate();
    }
  }

  /**
   * Destroys the voice connection and cleans up resources
   */
  destroy(): void {
    // Disconnect with normal close code
    this.disconnect(1000, "Connection destroyed");

    // Remove all listeners
    this.removeAllListeners();
  }

  /**
   * Connects to Discord's voice WebSocket gateway
   *
   * @private
   */
  async #connectWebSocket(): Promise<void> {
    // Close existing connection if any
    this.#closeWebSocket();

    try {
      // Build WebSocket URL
      const wsUrl = this.#buildGatewayUrl();

      // Debug log
      this.#debug("Connecting to voice WebSocket", { url: wsUrl });

      // Create new WebSocket connection
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      // Set up event handlers
      ws.onmessage = this.#handleWsMessage.bind(this);
      ws.onclose = this.#handleWsClose.bind(this);
      ws.onerror = this.#handleWsError.bind(this);
      ws.onopen = this.#handleWsOpen.bind(this);

      // Wait for connection to open with timeout
      await new Promise<void>((resolve, reject) => {
        // Set timeout to prevent hanging
        const connectionTimeout = setTimeout(() => {
          reject(new Error("WebSocket connection timed out"));
        }, 15000);

        // Use existing onopen handler
        const originalOnOpen = ws.onopen;
        ws.onopen = (ev) => {
          clearTimeout(connectionTimeout);
          if (originalOnOpen) {
            originalOnOpen.call(ws, ev);
          }
          resolve();
        };

        // Handle connection error
        const originalOnError = ws.onerror;
        ws.onerror = (ev) => {
          clearTimeout(connectionTimeout);
          if (originalOnError) {
            originalOnError.call(ws, ev);
          }
          reject(new Error("WebSocket connection failed"));
        };
      });
    } catch (error) {
      // Clean up on error
      this.#closeWebSocket();
      throw error;
    }
  }

  /**
   * Waits for the voice connection to be fully ready
   *
   * @private
   */
  async #waitForReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Set a timeout to prevent hanging
      const readyTimeout = setTimeout(() => {
        reject(new Error("Voice connection ready timeout"));
      }, 30000);

      // Create one-time event handlers
      const checkReady = () => {
        // Check if we have all required components
        if (
          this.#ssrc !== null &&
          this.#serverIp !== null &&
          this.#serverPort !== null &&
          this.#encryptionMode !== null &&
          this.#secretKey !== null &&
          this.#udpManager?.isReady
        ) {
          clearTimeout(readyTimeout);
          resolve();
        }
      };

      // Check if already ready
      checkReady();

      // Set up event listeners to track readiness
      const handleUdpReady = () => {
        checkReady();
      };

      const handleError = (error: Error) => {
        clearTimeout(readyTimeout);
        reject(error);
      };

      // Listen for relevant events
      this.once("error", handleError);

      if (this.#udpManager) {
        this.#udpManager.once("ready", handleUdpReady);
        this.#udpManager.once("ipDiscovered", checkReady);
      }

      // Clean up listeners on timeout
      readyTimeout.unref();
    });
  }

  /**
   * Builds the WebSocket gateway URL
   *
   * @returns Complete WebSocket URL for voice gateway
   * @private
   */
  #buildGatewayUrl(): string {
    const baseUrl = `wss://${this.#options.endpoint}`;
    const query = new URLSearchParams({
      v: this.#options.gatewayVersion.toString(),
    });

    return `${baseUrl}?${query.toString()}`;
  }

  /**
   * Handles WebSocket open event
   *
   * @private
   */
  #handleWsOpen(): void {
    this.#debug("Voice WebSocket opened");

    // Send identify payload to establish session
    this.#sendIdentify();
  }

  /**
   * Handles WebSocket message event
   *
   * @param event Message event
   * @private
   */
  #handleWsMessage(event: MessageEvent): void {
    try {
      // Parse message data
      const packet = JSON.parse(event.data as string) as VoicePayloadEntity;

      // Emit raw message event
      this.emit("wsMessage", packet);

      // Process based on opcode
      this.#handleVoicePacket(packet);
    } catch (error) {
      this.#debug("Error parsing WebSocket message", {
        error: String(error),
        data: event.data,
      });
    }
  }

  /**
   * Handles WebSocket close event
   *
   * @param event Close event
   * @private
   */
  #handleWsClose(event: CloseEvent): void {
    this.#debug("Voice WebSocket closed", {
      code: event.code,
      reason: event.reason,
    });

    // Update connection status
    if (this.#status !== VoiceConnectionStatus.Disconnected) {
      this.#setStatus(VoiceConnectionStatus.Disconnected);
    }

    // Emit disconnect event
    this.emit("disconnect", event.code, event.reason);

    // Attempt reconnection if appropriate
    if (
      this.#options.autoReconnect &&
      event.code !== 1000 && // Normal closure
      event.code !== 1001 // Going away
    ) {
      this.#attemptReconnect();
    }
  }

  /**
   * Handles WebSocket error event
   *
   * @param event Error event
   * @private
   */
  #handleWsError(_event: Event): void {
    const error = new Error("Voice WebSocket error");
    this.#debug("Voice WebSocket error", { error: String(error) });

    // Emit error event
    this.emit("error", error);
  }

  /**
   * Handles a voice gateway packet
   *
   * @param packet Voice payload entity
   * @private
   */
  #handleVoicePacket(packet: VoicePayloadEntity): void {
    switch (packet.op) {
      case VoiceOpcodes.Ready:
        this.#handleReady(packet.d as VoiceReadyEntity);
        break;

      case VoiceOpcodes.SessionDescription:
        this.#handleSessionDescription(
          packet.d as VoiceSessionDescriptionEntity,
        );
        break;

      case VoiceOpcodes.Hello:
        this.#handleHello(packet.d);
        break;

      case VoiceOpcodes.HeartbeatAck:
        this.#handleHeartbeatAck();
        break;

      case VoiceOpcodes.Speaking:
        this.#handleSpeaking(packet.d);
        break;

      case VoiceOpcodes.Resumed:
        this.#handleResumed();
        break;
    }
  }

  /**
   * Handles Hello opcode from voice gateway
   *
   * @param data Hello payload data
   * @private
   */
  #handleHello(data: any): void {
    this.#debug("Received Hello from voice gateway", {
      heartbeatInterval: data.heartbeat_interval,
    });

    // Initialize heartbeat manager
    const heartbeatInterval = data.heartbeat_interval;
    if (!this.#heartbeat) {
      this.#heartbeat = new HeartbeatManager(
        (sequence) => this.#sendHeartbeat(sequence),
        {
          autoRestart: true,
          maxMissedHeartbeats: 3,
        },
      );

      // Listen for heartbeat events
      this.#heartbeat.on("beat", (timestamp) => {
        this.#debug("Sent heartbeat", { timestamp });
      });

      this.#heartbeat.on("ack", (latency) => {
        this.#debug("Received heartbeat ack", { latency });
      });

      this.#heartbeat.on("timeout", (missedCount) => {
        this.#debug("Heartbeat timeout", { missedCount });
      });

      this.#heartbeat.on("dead", () => {
        this.#debug("Connection dead due to missed heartbeats");
        this.disconnect(4000, "Heartbeat timeout");
      });
    }

    // Start heartbeating
    this.#heartbeat.start(heartbeatInterval);
  }

  /**
   * Handles Ready opcode from voice gateway
   *
   * @param data Ready payload data
   * @private
   */
  #handleReady(data: VoiceReadyEntity): void {
    this.#debug("Received Ready from voice gateway", {
      ssrc: data.ssrc,
      ip: data.ip,
      port: data.port,
      modes: data.modes,
    });

    // Store SSRC, IP, and port
    this.#ssrc = data.ssrc;
    this.#serverIp = data.ip;
    this.#serverPort = data.port;

    // Store available encryption modes
    this.#availableModes = [...data.modes];

    // Initialize UDP manager if we have all required data
    this.#initializeUdpManager();
  }

  /**
   * Handles Session Description opcode from voice gateway
   *
   * @param data Session description payload data
   * @private
   */
  #handleSessionDescription(data: VoiceSessionDescriptionEntity): void {
    this.#debug("Received Session Description from voice gateway", {
      mode: data.mode,
    });

    // Store encryption mode and secret key
    this.#encryptionMode = data.mode;
    this.#secretKey = Uint8Array.from(data.secret_key);

    // Initialize RTP service if we have all required data
    this.#initializeRtpService();

    // Initialize audio service if we have all required data
    this.#initializeAudioService();
  }

  /**
   * Handles HeartbeatAck opcode from voice gateway
   *
   * @private
   */
  #handleHeartbeatAck(): void {
    if (this.#heartbeat) {
      this.#heartbeat.ack();
    }
  }

  /**
   * Handles Speaking opcode from voice gateway
   *
   * @param data Speaking payload data
   * @private
   */
  #handleSpeaking(data: any): void {
    this.#debug("Received Speaking from voice gateway", {
      userId: data.user_id,
      speaking: data.speaking,
    });

    // Emit user speaking event
    if (data.user_id && typeof data.speaking === "number") {
      this.emit("userSpeaking", data.user_id, data.speaking > 0);
    }
  }

  /**
   * Handles Resumed opcode from voice gateway
   *
   * @private
   */
  #handleResumed(): void {
    this.#debug("Voice connection resumed");

    // Update status
    this.#setStatus(VoiceConnectionStatus.Connected);
    this.#ready = true;

    // Reset reconnect attempts
    this.#reconnectAttempts = 0;

    // Emit ready event
    this.emit("ready");
  }

  /**
   * Sends an Identify payload to the voice gateway
   *
   * @private
   */
  #sendIdentify(): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload: VoiceIdentifyEntity = {
      server_id: this.#options.guildId,
      user_id: this.#options.userId,
      session_id: this.#options.sessionId,
      token: this.#options.serverToken,
    };

    this.#sendOp(VoiceOpcodes.Identify, payload);
    this.#debug("Sent Identify to voice gateway");
  }

  /**
   * Sends a voice state update to the main gateway
   *
   * @private
   */
  #sendVoiceStateUpdate(): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      guild_id: this.#options.guildId,
      channel_id: this.#options.channelId,
      self_mute: this.#options.selfMute,
      self_deaf: this.#options.selfDeaf,
    };

    this.#sendOp(4, payload);
    this.#debug("Sent Voice State Update");
  }

  /**
   * Sends a heartbeat to the voice gateway
   *
   * @param sequence Last sequence number
   * @private
   */
  #sendHeartbeat(sequence: number): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      t: Date.now(),
      seq_ack: sequence >= 0 ? sequence : undefined,
    };

    this.#sendOp(VoiceOpcodes.Heartbeat, payload);
  }

  /**
   * Sends a Select Protocol payload to the voice gateway
   *
   * @param address External IP address
   * @param port External port
   * @param mode Encryption mode to use
   * @private
   */
  #sendSelectProtocol(
    address: string,
    port: number,
    mode: VoiceEncryptionMode,
  ): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload: VoiceSelectProtocolEntity = {
      protocol: "udp",
      data: {
        address,
        port,
        mode,
      },
    };

    this.#sendOp(VoiceOpcodes.SelectProtocol, payload);
    this.#debug("Sent Select Protocol", {
      address,
      port,
      mode,
    });
  }

  /**
   * Sends a Speaking payload to the voice gateway
   *
   * @param speaking Speaking mode flags
   * @private
   */
  #sendSpeaking(speaking: number): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      speaking,
      delay: 0,
      ssrc: this.#ssrc,
    };

    this.#sendOp(VoiceOpcodes.Speaking, payload);

    // Emit speaking event
    this.emit("speaking", speaking);

    this.#debug("Sent Speaking", { speaking });
  }

  /**
   * Sends a Resume payload to the voice gateway
   *
   * @private
   */
  #sendResume(): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = {
      server_id: this.#options.guildId,
      session_id: this.#options.sessionId,
      token: this.#options.serverToken,
    };

    this.#sendOp(VoiceOpcodes.Resume, payload);
    this.#debug("Sent Resume");
  }

  /**
   * Sends an opcode with payload to the voice gateway
   *
   * @param op Opcode to send
   * @param d Payload data
   * @private
   */
  #sendOp(op: number, d: any): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload = { op, d };
    this.#ws.send(JSON.stringify(payload));
  }

  /**
   * Initializes the UDP manager when ready data is received
   *
   * @private
   */
  #initializeUdpManager(): void {
    // Skip if required data is missing
    if (!(this.#ssrc && this.#serverIp && this.#serverPort)) {
      return;
    }

    // Create UDP manager options
    const options: UdpManagerOptions = {
      ssrc: this.#ssrc,
      serverIp: this.#serverIp,
      serverPort: this.#serverPort,
      localPort: 0,
      localAddress: "0.0.0.0",
      ipDiscovery: {},
      socketTimeout: 10000,
      handlePackets: true,
      packetQueueLimit: 100,
      sendBufferSize: 1024 * 512,
      receiveBufferSize: 1024 * 512,
    };

    // Create UDP manager
    this.#udpManager = new UdpManager(options);

    // Listen for events
    this.#udpManager.on("ready", (localPort) => {
      this.#debug("UDP socket ready", { localPort });
    });

    this.#udpManager.on("ipDiscovered", (address, port) => {
      this.#debug("IP discovery complete", { address, port });

      // Select encryption mode and send protocol selection
      const mode = this.#selectEncryptionMode();
      if (mode) {
        this.#sendSelectProtocol(address, port, mode);
      } else {
        this.emit(
          "error",
          new Error("No compatible encryption mode available"),
        );
      }
    });

    this.#udpManager.on("error", (error, operation) => {
      this.#debug("UDP error", { error: String(error), operation });
      this.emit("error", error);
    });

    this.#udpManager.on("packetReceived", (_size, packet) => {
      // Update stats
      this.#packetStats.received++;

      // Process incoming packet if it's an RTP packet
      if (packet && this.#rtpService && this.#audioService) {
        try {
          // Only process packets with matching SSRC
          if (packet.ssrc === this.#ssrc) {
            // Decrypt the audio data
            const opusPacket = this.#rtpService.decryptAudio(packet);

            // Emit voice packet event
            this.emit(
              "voicePacket",
              this.#options.userId,
              opusPacket,
              packet.sequence,
            );
          }
        } catch (error) {
          this.#debug("Error processing RTP packet", { error: String(error) });
        }
      }
    });

    this.#udpManager.on("packetSent", (_size) => {
      // Update stats
      this.#packetStats.sent++;
    });

    // Connect to UDP server
    this.#udpManager.connect().catch((error) => {
      this.#debug("Failed to connect UDP", { error: String(error) });
      this.emit("error", error);
    });
  }

  /**
   * Initializes the RTP service when session description is received
   *
   * @private
   */
  #initializeRtpService(): void {
    // Skip if required data is missing
    if (!(this.#encryptionMode && this.#secretKey)) {
      return;
    }

    // Create RTP service options
    const options: RtpServiceOptions = {
      encryptionMode: this.#encryptionMode,
      secretKey: this.#secretKey,
      useDaveProtocol: false,
      bufferPoolSize: 10,
      maxPacketSize: 1500,
    };

    // Create RTP service
    this.#rtpService = new RtpService(options);

    // Set RTP service in UDP manager
    if (this.#udpManager) {
      this.#udpManager.setRtpService(this.#rtpService);
    }
  }

  /**
   * Initializes the audio service when all prerequisites are met
   *
   * @private
   */
  #initializeAudioService(): void {
    // Skip if required data is missing
    if (!this.#ssrc) {
      return;
    }

    // Create audio service options
    const options: AudioServiceOptions = {
      ssrc: this.#ssrc,
      opus: {
        channels: 2,
        rate: 48000,
        frameSize: 960,
      },
      playback: {
        volume: 1.0,
        maxBufferedPackets: 50,
        handleErrors: true,
        normalize: false,
      },
      silenceFrameCount: 5,
      silenceFrameDelay: 20,
    };

    // Create audio service
    this.#audioService = new AudioService(options);

    // Initialize audio service
    this.#audioService.initialize();

    // Listen for speaking changes
    this.#audioService.on("speaking", (speaking) => {
      // Send speaking state to voice gateway
      this.#sendSpeaking(speaking);
    });

    // Listen for playback events
    this.#audioService.on("playbackStart", (streamId) => {
      this.emit("playbackStart", streamId);
    });

    this.#audioService.on("playbackEnd", (streamId) => {
      this.emit("playbackEnd", streamId);
    });

    this.#audioService.on("error", (error) => {
      this.#debug("Audio service error", { error: String(error) });
    });

    // Set audio service in UDP manager
    if (this.#udpManager) {
      this.#udpManager.setAudioService(this.#audioService);
    }
  }

  /**
   * Selects the best available encryption mode
   *
   * @returns Selected encryption mode or null if none available
   * @private
   */
  #selectEncryptionMode(): VoiceEncryptionMode | null {
    // No modes available
    if (this.#availableModes.length === 0) {
      return null;
    }

    // Check if preferred mode is available
    if (this.#availableModes.includes(this.#options.preferredEncryptionMode)) {
      return this.#options.preferredEncryptionMode;
    }

    // Check for AES-256-GCM with RTP size
    if (
      this.#availableModes.includes(VoiceEncryptionMode.AeadAes256GcmRtpSize)
    ) {
      return VoiceEncryptionMode.AeadAes256GcmRtpSize;
    }

    // Check for XChaCha20-Poly1305 with RTP size
    if (
      this.#availableModes.includes(
        VoiceEncryptionMode.AeadXChaCha20Poly1305RtpSize,
      )
    ) {
      return VoiceEncryptionMode.AeadXChaCha20Poly1305RtpSize;
    }

    // Fall back to first available mode
    return this.#availableModes[0];
  }

  /**
   * Attempts to reconnect to the voice server
   *
   * Uses exponential backoff for retry timing.
   *
   * @private
   */
  #attemptReconnect(): void {
    // Skip if auto-reconnect is disabled
    if (!this.#options.autoReconnect) {
      return;
    }

    // Check if max reconnect attempts has been reached
    if (this.#reconnectAttempts >= this.#options.maxReconnectAttempts) {
      this.emit(
        "error",
        new Error(
          `Failed to reconnect after ${this.#reconnectAttempts} attempts`,
        ),
      );
      return;
    }

    // Update status
    this.#setStatus(VoiceConnectionStatus.Reconnecting);

    // Clear existing timeout
    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout);
    }

    // Calculate delay using exponential backoff
    const backoffIndex = Math.min(
      this.#reconnectAttempts,
      this.#options.reconnectBackoff.length - 1,
    );
    const delay = this.#options.reconnectBackoff[backoffIndex];

    // Increment attempts
    this.#reconnectAttempts++;

    this.#debug("Attempting reconnection", {
      attempt: this.#reconnectAttempts,
      delay,
      maxAttempts: this.#options.maxReconnectAttempts,
    });

    // Set up reconnect timeout
    this.#reconnectTimeout = setTimeout(() => {
      this.#reconnectTimeout = null;

      // Attempt to connect
      this.connect().catch((error) => {
        this.#debug("Reconnection attempt failed", { error: String(error) });

        // Try again if we haven't exceeded max attempts
        if (this.#reconnectAttempts < this.#options.maxReconnectAttempts) {
          this.#attemptReconnect();
        } else {
          this.emit(
            "error",
            new Error(
              `Failed to reconnect after ${this.#reconnectAttempts} attempts`,
            ),
          );
        }
      });
    }, delay);
  }

  /**
   * Closes the WebSocket connection
   *
   * @private
   */
  #closeWebSocket(): void {
    if (this.#ws) {
      try {
        // Remove event handlers
        this.#ws.onmessage = null;
        this.#ws.onclose = null;
        this.#ws.onerror = null;
        this.#ws.onopen = null;

        // Close the connection
        if (
          this.#ws.readyState === WebSocket.OPEN ||
          this.#ws.readyState === WebSocket.CONNECTING
        ) {
          this.#ws.close();
        }
      } catch (error) {
        this.#debug("Error closing WebSocket", { error: String(error) });
      }

      this.#ws = null;
    }
  }

  /**
   * Cleans up all resources used by the voice connection
   *
   * @private
   */
  #cleanup(): void {
    // Clean up heartbeat manager
    if (this.#heartbeat) {
      this.#heartbeat.destroy();
      this.#heartbeat = null;
    }

    // Clean up audio service
    if (this.#audioService) {
      this.#audioService.destroy();
      this.#audioService = null;
    }

    // Clean up RTP service
    if (this.#rtpService) {
      this.#rtpService.destroy();
      this.#rtpService = null;
    }

    // Clean up UDP manager
    if (this.#udpManager) {
      this.#udpManager.destroy();
      this.#udpManager = null;
    }

    // Close WebSocket
    this.#closeWebSocket();

    // Clear reconnect timeout
    if (this.#reconnectTimeout) {
      clearTimeout(this.#reconnectTimeout);
      this.#reconnectTimeout = null;
    }

    // Reset state
    this.#ssrc = null;
    this.#serverIp = null;
    this.#serverPort = null;
    this.#secretKey = null;
    this.#encryptionMode = null;
    this.#availableModes = [];
    this.#ready = false;
    this.#readyTime = null;
  }

  /**
   * Updates the connection status and emits an event
   *
   * @param status New connection status
   * @private
   */
  #setStatus(status: VoiceConnectionStatus): void {
    if (this.#status === status) {
      return;
    }

    const previousStatus = this.#status;
    this.#status = status;

    this.emit("statusChange", status, previousStatus);
    this.#debug("Voice connection status changed", {
      previous: VoiceConnectionStatus[previousStatus],
      current: VoiceConnectionStatus[status],
    });
  }

  /**
   * Logs a debug message if debug is enabled
   *
   * @param message Debug message
   * @param data Additional data to log
   * @private
   */
  #debug(message: string, data: Record<string, any> = {}): void {
    if (this.#options.debug) {
      const debugMessage = `[Voice] ${message}`;
      this.emit("debug", JSON.stringify({ message: debugMessage, ...data }));
    }
  }
}
