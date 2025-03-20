import { setTimeout } from "node:timers/promises";
import type { VoiceStateEntity } from "@nyxjs/core";
import type { VoiceServerUpdateEntity } from "@nyxjs/gateway";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { UdpManager, VoiceHeartbeatManager } from "../managers/index.js";
import { VoiceConnectionOptions } from "../options/index.js";
import { VoiceEncryptionService } from "../services/index.js";
import {
  EncryptionMode,
  NON_RESUMABLE_VOICE_CLOSE_CODES,
  SpeakingFlags,
  type VoiceConnectionEvents,
  VoiceGatewayVersion,
  type VoiceHello,
  type VoiceIdentify,
  VoiceOpcodes,
  type VoicePayloadEntity,
  type VoiceReady,
  type VoiceResume,
  type VoiceSelectProtocol,
  type VoiceSessionDescription,
  type VoiceSpeaking,
} from "../types/index.js";

/**
 * Discord Voice Client for connecting to voice channels
 *
 * This class handles:
 * - Establishing and maintaining WebSocket connections to Discord's Voice Gateways
 * - Coordinating voice heartbeats
 * - Managing UDP connections for voice data transmission
 * - Handling encryption for voice packets
 * - Managing session lifecycle and resumption
 */
export class VoiceConnection extends EventEmitter<VoiceConnectionEvents> {
  /** Current session ID */
  #sessionId: string | null = null;

  /** Current server (guild) ID */
  #serverId: string | null = null;

  /** Current channel ID */
  #channelId: string | null = null;

  /** Current user ID */
  #userId: string | null = null;

  /** Voice token */
  #token: string | null = null;

  /** Voice gateway endpoint */
  #endpoint: string | null = null;

  /** Last received sequence number */
  #sequence = 0;

  /** Number of reconnection attempts made */
  #reconnectionAttempts = 0;

  /** WebSocket connection */
  #ws: WebSocket | null = null;

  /** Voice SSRC */
  #ssrc: number | null = null;

  /** Voice ready state */
  #ready = false;

  /** Voice gateway version */
  readonly #gatewayVersion: VoiceGatewayVersion;

  /** UDP connection manager */
  readonly #udp: UdpManager;

  /** Heartbeat manager */
  readonly #heartbeat: VoiceHeartbeatManager;

  /** Encryption service */
  readonly #encryption: VoiceEncryptionService;

  /** Voice client options */
  readonly #options: VoiceConnectionOptions;

  /**
   * Creates a new Voice Connection client
   *
   * @param options - Voice client configuration options
   * @throws {Error} If options validation fails
   */
  constructor(options: z.input<typeof VoiceConnectionOptions> = {}) {
    super();

    try {
      this.#options = VoiceConnectionOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#gatewayVersion = this.#options.gatewayVersion;
    this.#udp = new UdpManager(this);
    this.#heartbeat = new VoiceHeartbeatManager(
      this,
      this.#options.heartbeat.maxMissed,
    );
    this.#encryption = new VoiceEncryptionService();
  }

  /**
   * Gets the voice gateway version
   */
  get gatewayVersion(): number {
    return this.#gatewayVersion;
  }

  /**
   * Gets the current server (guild) ID
   */
  get serverId(): string | null {
    return this.#serverId;
  }

  /**
   * Gets the current channel ID
   */
  get channelId(): string | null {
    return this.#channelId;
  }

  /**
   * Gets the current session ID
   */
  get sessionId(): string | null {
    return this.#sessionId;
  }

  /**
   * Gets the last received sequence number
   */
  get sequence(): number {
    return this.#sequence;
  }

  /**
   * Gets the current SSRC
   */
  get ssrc(): number | null {
    return this.#ssrc;
  }

  /**
   * Gets the current WebSocket ready state
   */
  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Gets whether the voice client is ready
   */
  get isReady(): boolean {
    return this.#ready;
  }

  /**
   * Gets the UDP manager
   */
  get udp(): UdpManager {
    return this.#udp;
  }

  /**
   * Gets the heartbeat manager
   */
  get heartbeat(): VoiceHeartbeatManager {
    return this.#heartbeat;
  }

  /**
   * Gets the encryption service
   */
  get encryption(): VoiceEncryptionService {
    return this.#encryption;
  }

  /**
   * Gets the connection options
   */
  get options(): VoiceConnectionOptions {
    return this.#options;
  }

  /**
   * Updates the sequence number
   *
   * @param sequence - New sequence number
   */
  updateSequence(sequence: number): void {
    this.#sequence = sequence;
  }

  /**
   * Sets the user ID for this connection
   * Should be called before connecting
   *
   * @param userId - Discord user ID
   */
  setUserId(userId: string): void {
    this.#userId = userId;
  }

  /**
   * Connects to a voice channel
   *
   * @param options - Voice state and server update data
   * @returns Promise that resolves when connection is ready
   * @throws {Error} If connection fails
   */
  async connect(
    options: Pick<
      VoiceStateEntity & VoiceServerUpdateEntity,
      "guild_id" | "channel_id" | "session_id" | "token" | "endpoint"
    >,
  ): Promise<void> {
    if (!(options.token && options.endpoint)) {
      throw new Error("Invalid voice server data: missing token or endpoint");
    }

    // Store connection information
    this.#serverId = options.guild_id;
    this.#channelId = options.channel_id;
    this.#sessionId = options.session_id;
    this.#token = options.token;
    this.#endpoint = options.endpoint;

    // Reset connection state if reconnecting
    if (this.#ws) {
      this.disconnect(false);
    }

    this.#ready = false;

    // Emit the connecting event
    this.emit("connecting", {
      serverId: this.#serverId,
      channelId: this.#channelId,
      timestamp: new Date().toISOString(),
    });

    try {
      // Connect to the voice WebSocket
      await this.#connectWebSocket();

      // Wait for READY opcode with proper cleanup
      await new Promise<void>((resolve, reject) => {
        const cleanup = (): void => {
          this.removeListener("ready", readyHandler);
          this.removeListener("error", errorHandler);
        };

        const readyHandler = (): void => {
          cleanup();
          resolve();
        };

        const errorHandler = (error: Error): void => {
          cleanup();
          reject(error);
        };

        this.once("ready", readyHandler);
        this.once("error", errorHandler);
      });

      // Connection is now ready
      this.#reconnectionAttempts = 0;

      this.emit("connected", {
        serverId: this.#serverId,
        channelId: this.#channelId as string,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Emit connection failure
      this.emit("connectionFailure", {
        serverId: this.#serverId,
        channelId: this.#channelId,
        attempt: this.#reconnectionAttempts + 1,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error : new Error(String(error)),
      });

      // Enhanced error reporting with more context
      throw new Error("Failed to connect to voice channel", {
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Reconnects to the voice channel
   *
   * Attempts to reuse the existing session information if possible.
   *
   * @returns Promise that resolves when reconnection is complete
   * @throws {Error} If reconnection fails
   */
  async reconnect(): Promise<void> {
    if (!(this.#sessionId && this.#token && this.#endpoint)) {
      throw new Error("Cannot reconnect without an existing connection");
    }

    // Destroy existing connection but keep session info
    this.disconnect(false);

    // Attempt to reconnect
    this.#reconnectionAttempts++;
    const delay = this.#getReconnectionDelay();

    this.emit("reconnecting", {
      attempt: this.#reconnectionAttempts,
      delay,
      sessionId: this.#sessionId,
    });

    if (delay > 0) {
      await setTimeout(delay);
    }

    // Reconnect to WebSocket
    try {
      await this.#connectWebSocket();
      return new Promise<void>((resolve, reject) => {
        const cleanup = (): void => {
          this.removeListener("ready", readyHandler);
          this.removeListener("resumed", resumedHandler);
          this.removeListener("error", errorHandler);
        };

        const readyHandler = (): void => {
          cleanup();
          resolve();
        };

        const resumedHandler = (): void => {
          cleanup();
          resolve();
        };

        const errorHandler = (error: Error): void => {
          cleanup();
          reject(error);
        };

        this.once("ready", readyHandler);
        this.once("resumed", resumedHandler);
        this.once("error", errorHandler);
      });
    } catch (error) {
      throw new Error("Failed to reconnect to voice channel", {
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Sets the speaking state
   *
   * Must be called before sending voice data. For bots, the delay should
   * typically be 0 as they don't have user-facing delay requirements.
   *
   * @param speaking - Speaking flags (bitfield)
   * @param delay - Voice delay in milliseconds (0 for bots)
   * @throws {Error} If the connection is not ready
   */
  setSpeaking(speaking: SpeakingFlags, delay = 0): void {
    this.#validateConnection();

    if (!this.#ssrc) {
      throw new Error("Cannot set speaking state: SSRC not available");
    }

    const payload: VoiceSpeaking = {
      speaking,
      delay,
      ssrc: this.#ssrc,
    };

    this.send(VoiceOpcodes.Speaking, payload);
  }

  /**
   * Disconnects from the voice channel
   *
   * @param emitEvent - Whether to emit the disconnected event
   */
  disconnect(emitEvent = true): void {
    this.#stopServices();

    if (this.#ws) {
      const ws = this.#ws;
      this.#ws = null;

      ws.removeAllListeners();
      ws.close(1000);
    }

    // Reset state
    this.#ready = false;
    this.#ssrc = null;
    this.#encryption.reset();

    if (emitEvent) {
      this.emit("disconnected", {
        code: 1000,
        reason: "Disconnected by client",
        serverId: this.#serverId,
        channelId: this.#channelId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Destroys the voice client and cleans up all resources
   *
   * Should be called when the client is no longer needed.
   */
  destroy(): void {
    this.disconnect();
    this.#udp.destroy();
    this.removeAllListeners();
  }

  /**
   * Sends a payload to the voice gateway
   *
   * @param opcode - Voice opcode
   * @param data - Payload data
   * @throws {Error} If the connection is not valid
   */
  send<T>(opcode: VoiceOpcodes, data: T): void {
    this.#validateConnection();

    const payload: VoicePayloadEntity<T> = {
      op: opcode,
      d: data,
    };

    try {
      this.#ws?.send(JSON.stringify(payload));
      this.emit("packet", opcode, data);
    } catch (error) {
      throw new Error(`Failed to send voice payload: ${opcode}`, {
        cause: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Connects to the voice WebSocket
   *
   * @returns Promise that resolves when WebSocket connection is established
   * @throws {Error} If WebSocket connection fails
   * @private
   */
  async #connectWebSocket(): Promise<void> {
    // Validate required connection information
    if (!(this.#token && this.#endpoint)) {
      throw new Error("Missing token or endpoint for voice connection");
    }

    return new Promise<void>((resolve, reject) => {
      try {
        // Build the WebSocket URL
        const wsUrl = this.#buildGatewayUrl();

        // Create and connect the WebSocket
        const ws = new WebSocket(wsUrl);
        this.#ws = ws;

        // Set up event handlers
        ws.on("message", this.#handleMessage.bind(this));
        ws.on("close", this.#handleClose.bind(this));
        ws.on("error", (error) => {
          this.emit(
            "error",
            error instanceof Error ? error : new Error(String(error)),
          );
          reject(error);
        });

        // Wait for WebSocket to open
        ws.once("open", () => {
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Builds the voice gateway URL with the appropriate version
   *
   * @returns Complete Gateway URL with parameters
   * @throws {Error} If no endpoint is available
   * @private
   */
  #buildGatewayUrl(): string {
    if (!this.#endpoint) {
      throw new Error("No voice endpoint available");
    }

    // Remove port if present in the endpoint
    const endpoint = this.#endpoint.includes(":")
      ? this.#endpoint.split(":")[0]
      : this.#endpoint;

    return `wss://${endpoint}?v=${this.#gatewayVersion}`;
  }

  /**
   * Handles an incoming WebSocket message
   *
   * @param data - Raw message data
   * @private
   */
  #handleMessage(data: WebSocket.Data): void {
    if (!(typeof data === "string" || data instanceof Buffer)) {
      return;
    }

    try {
      // Parse the JSON payload
      const payload: VoicePayloadEntity = JSON.parse(
        typeof data === "string" ? data : data.toString(),
      );

      // Update sequence if provided
      if (payload.s !== undefined && payload.s !== null) {
        this.updateSequence(payload.s);
      }

      // Process the payload
      this.#handlePayload(payload);
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to parse voice gateway message", {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Handles WebSocket close events
   *
   * @param code - Close code
   * @param reason - Close reason
   * @private
   */
  #handleClose(code: number, reason: Buffer): void {
    const reasonStr = reason.toString() || "No reason provided";

    // Stop services
    this.#stopServices();

    // Emit disconnected event
    this.emit("disconnected", {
      code,
      reason: reasonStr,
      serverId: this.#serverId,
      channelId: this.#channelId,
      timestamp: new Date().toISOString(),
    });

    // Handle reconnection
    if (this.#options.autoReconnect && this.#shouldReconnect(code)) {
      this.reconnect().catch((error) => {
        this.emit(
          "error",
          new Error("Failed to reconnect to voice", {
            cause: error instanceof Error ? error : new Error(String(error)),
          }),
        );
      });
    }
  }

  /**
   * Processes a decoded voice gateway payload
   *
   * @param payload - Decoded payload
   * @private
   */
  #handlePayload(payload: VoicePayloadEntity): void {
    this.emit("packet", payload.op, payload.d);

    switch (payload.op) {
      case VoiceOpcodes.Ready:
        this.#handleReady(payload.d as VoiceReady).catch((error) => {
          this.emit(
            "error",
            new Error("Failed to handle Ready opcode", {
              cause: error instanceof Error ? error : new Error(String(error)),
            }),
          );
        });
        break;

      case VoiceOpcodes.SessionDescription:
        this.#handleSessionDescription(payload.d as VoiceSessionDescription);
        break;

      case VoiceOpcodes.Hello:
        this.#handleHello(payload.d as VoiceHello);
        break;

      case VoiceOpcodes.HeartbeatAck:
        this.#heartbeat.ackHeartbeat(payload.d as number);
        break;

      case VoiceOpcodes.Speaking:
        // Additional speaking handling could be implemented here
        // This could track which users are speaking if needed
        break;

      case VoiceOpcodes.Resumed:
        this.#handleResumed();
        break;

      case VoiceOpcodes.ClientDisconnect:
        // Client disconnect handling
        // This indicates another user has disconnected from the voice channel
        break;

      default:
        break;
    }
  }

  /**
   * Handles the Ready opcode
   *
   * @param data - Ready payload
   * @throws {Error} If Ready payload is invalid or UDP connection fails
   * @private
   */
  async #handleReady(data: VoiceReady): Promise<void> {
    try {
      if (!(data.ssrc && data.ip && data.port && data.modes)) {
        throw new Error("Invalid Ready payload from voice server");
      }

      this.#ssrc = data.ssrc;

      // Verify that at least one of the required encryption modes is available
      const hasRequiredMode = data.modes.some(
        (mode) =>
          mode === EncryptionMode.AeadAes256GcmRtpsize ||
          mode === EncryptionMode.AeadXChaCha20Poly1305Rtpsize,
      );

      if (!hasRequiredMode) {
        throw new Error(
          `Voice server does not support required encryption modes. Required: aead_aes256_gcm_rtpsize or aead_xchacha20_poly1305_rtpsize. Available: ${data.modes.join(", ")}`,
        );
      }

      // Initialize the UDP connection
      await this.#udp.connect(data.ip, data.port, data.ssrc);

      // After IP discovery, select the voice protocol
      this.#selectProtocol(data.modes);
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to handle Ready opcode", {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
      throw error; // Re-throw to allow connect() to handle it
    }
  }

  /**
   * Handles the SessionDescription opcode
   *
   * This finalizes the voice connection setup by initializing encryption.
   *
   * @param data - Session description payload
   * @private
   */
  #handleSessionDescription(data: VoiceSessionDescription): void {
    try {
      if (!(data.mode && data.secret_key && Array.isArray(data.secret_key))) {
        throw new Error("Invalid SessionDescription payload from voice server");
      }

      // Convert secret key to Uint8Array
      const secretKey = new Uint8Array(data.secret_key);

      // Initialize encryption
      this.#encryption.initialize(data.mode, secretKey);

      // Set encryption in UDP manager
      this.#udp.setEncryption(data.mode, secretKey);

      // Mark as ready
      this.#ready = true;

      // Send initial speaking state
      if (this.#ssrc) {
        this.setSpeaking(SpeakingFlags.Microphone);
      }

      // Emit ready event with SSRC
      this.emit("ready", {
        ssrc: this.#ssrc as number,
        ip: this.#udp.localIp as string,
        port: this.#udp.localPort as number,
        encryptionMode: data.mode,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to handle SessionDescription opcode", {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Handles the Hello opcode
   *
   * @param data - Hello payload
   * @private
   */
  #handleHello(data: VoiceHello): void {
    try {
      if (!data.heartbeat_interval || data.heartbeat_interval <= 0) {
        throw new Error("Invalid Hello payload from voice server");
      }

      // Start heartbeating
      this.#heartbeat.start(data.heartbeat_interval);

      // Check if we need to resume or identify
      if (this.#canResume()) {
        this.#sendResume();
      } else {
        this.#sendIdentify();
      }
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to handle Hello opcode", {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Handles the Resumed opcode
   *
   * @private
   */
  #handleResumed(): void {
    // If we were ready before, mark as ready again
    if (this.#ssrc) {
      this.#ready = true;

      // Re-send speaking state to ensure it's current
      this.setSpeaking(SpeakingFlags.Microphone);
    }

    this.emit("resumed", this.#sessionId || "");
  }

  /**
   * Selects the protocol for voice communication
   *
   * @param availableModes - Available encryption modes
   * @throws {Error} If no compatible encryption mode is available
   * @private
   */
  #selectProtocol(availableModes: EncryptionMode[]): void {
    if (!(this.#udp.localIp && this.#udp.localPort)) {
      throw new Error("Cannot select protocol without local IP discovery");
    }

    // Choose the encryption mode
    let mode: EncryptionMode;

    // First try the preferred mode
    if (availableModes.includes(this.#options.preferredEncryption)) {
      mode = this.#options.preferredEncryption;
    }
    // Always include the required mode (XChaCha20)
    else if (
      availableModes.includes(EncryptionMode.AeadXChaCha20Poly1305Rtpsize)
    ) {
      mode = EncryptionMode.AeadXChaCha20Poly1305Rtpsize;
    }
    // Try AES256-GCM as another option
    else if (availableModes.includes(EncryptionMode.AeadAes256GcmRtpsize)) {
      mode = EncryptionMode.AeadAes256GcmRtpsize;
    }
    // No valid encryption mode available
    else {
      throw new Error(
        "No supported encryption modes available. Discord requires " +
          "aead_aes256_gcm_rtpsize or aead_xchacha20_poly1305_rtpsize " +
          "as of November 18, 2024.",
      );
    }

    // Create the payload
    const payload: VoiceSelectProtocol = {
      protocol: "udp",
      data: {
        address: this.#udp.localIp,
        port: this.#udp.localPort,
        mode,
      },
    };

    this.send(VoiceOpcodes.SelectProtocol, payload);
  }

  /**
   * Sends an Identify payload
   * @private
   */
  #sendIdentify(): void {
    if (!(this.#serverId && this.#sessionId && this.#token)) {
      throw new Error(
        "Cannot identify without server ID, session ID, and token",
      );
    }

    if (!this.#userId) {
      throw new Error(
        "User ID is required for identification. Call setUserId() before connecting.",
      );
    }

    // Create the payload
    const payload: VoiceIdentify = {
      server_id: this.#serverId,
      user_id: this.#userId,
      session_id: this.#sessionId,
      token: this.#token,
      // For v8, we can add max_dave_protocol_version to indicate DAVE protocol support
      // Set to 0 to indicate no support
      max_dave_protocol_version: 0,
    };

    try {
      this.send(VoiceOpcodes.Identify, payload);
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to send Identify payload", {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Sends a Resume payload
   * @private
   */
  #sendResume(): void {
    if (!(this.#serverId && this.#sessionId && this.#token)) {
      throw new Error("Cannot resume without server ID, session ID, and token");
    }

    this.emit("resuming", this.#sessionId);

    // Create the payload
    const payload: VoiceResume = {
      server_id: this.#serverId,
      session_id: this.#sessionId,
      token: this.#token,
    };

    // Add seq_ack for v8
    if (this.#gatewayVersion >= VoiceGatewayVersion.V8) {
      payload.seq_ack = this.#sequence;
    }

    try {
      this.send(VoiceOpcodes.Resume, payload);
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to send Resume payload", {
          cause: error instanceof Error ? error : new Error(String(error)),
        }),
      );
    }
  }

  /**
   * Checks if session can be resumed
   * @private
   */
  #canResume(): boolean {
    return Boolean(
      this.#serverId && this.#sessionId && this.#token && this.#ssrc,
    );
  }

  /**
   * Determines if the client should reconnect based on close code
   *
   * @param code - WebSocket close code
   * @returns True if reconnection should be attempted
   * @private
   */
  #shouldReconnect(code: number): boolean {
    return !NON_RESUMABLE_VOICE_CLOSE_CODES.includes(code);
  }

  /**
   * Stops all voice services
   * @private
   */
  #stopServices(): void {
    this.#heartbeat.stop();
    this.#udp.destroy();
  }

  /**
   * Gets the reconnection delay based on attempt count
   *
   * @returns Delay in milliseconds
   * @private
   */
  #getReconnectionDelay(): number {
    const index = Math.min(
      this.#reconnectionAttempts,
      this.#options.backoffSchedule.length - 1,
    );
    return this.#options.backoffSchedule[index] || 0;
  }

  /**
   * Validates that the WebSocket connection is open
   *
   * @throws {Error} If the connection is not open
   * @private
   */
  #validateConnection(): void {
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket connection is not open");
    }
  }
}
