import { setTimeout } from "node:timers/promises";
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
  type VoiceCloseEventCodes,
  type VoiceConnectionEvents,
  type VoiceHello,
  type VoiceIdentify,
  VoiceOpcodes,
  type VoicePayloadEntity,
  type VoiceReady,
  type VoiceResume,
  type VoiceSelectProtocol,
  type VoiceServer,
  type VoiceSessionDescription,
  type VoiceSpeaking,
  type VoiceState,
} from "../types/index.js";

/**
 * Discord Voice Client for connecting to voice channels
 *
 * Handles WebSocket and UDP connections for voice communication
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
  readonly #gatewayVersion: number;

  /** UDP connection manager */
  readonly #udp: UdpManager;

  /** Heartbeat manager */
  readonly #heartbeat: VoiceHeartbeatManager;

  /** Encryption service */
  readonly #encryption: VoiceEncryptionService;

  /** Voice client options */
  readonly #options: VoiceConnectionOptions;

  /**
   * Creates a new Voice Client
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
   * Updates the sequence number
   *
   * @param sequence - New sequence number
   */
  updateSequence(sequence: number): void {
    this.#sequence = sequence;
  }

  /**
   * Connects to a voice channel
   *
   * @param state - Voice state update data
   * @param server - Voice server update data
   * @returns Promise that resolves when connection is ready
   */
  async connect(
    state: VoiceState & { session_id: string },
    server: VoiceServer,
  ): Promise<void> {
    if (!(server.token && server.endpoint)) {
      throw new Error("Invalid voice server data");
    }

    // Store connection information
    this.#serverId = state.guild_id;
    this.#channelId = state.channel_id;
    this.#sessionId = state.session_id;
    this.#token = server.token;
    this.#endpoint = server.endpoint;

    // Reset connection state if reconnecting
    if (this.#ws) {
      this.disconnect();
    }

    this.#ready = false;

    try {
      // Connect to the voice WebSocket
      await this.#connectWebSocket();

      // Wait for READY opcode with proper cleanup
      await new Promise<void>((resolve, reject) => {
        const cleanup = (): void => {
          this.removeListener("ready", readyHandler);
          this.removeListener("error", errorHandler);
          this.removeListener("disconnected", disconnectHandler);
        };

        const readyHandler = (): void => {
          cleanup();
          resolve();
        };

        const errorHandler = (error: Error): void => {
          cleanup();
          reject(error);
        };

        const disconnectHandler = (code: number, reason: string): void => {
          cleanup();
          reject(new Error(`Disconnected: ${code} - ${reason}`));
        };

        this.once("ready", readyHandler);
        this.once("error", errorHandler);
        this.once("disconnected", disconnectHandler);
      });

      // Connection is now ready
      this.#reconnectionAttempts = 0;
      this.emit("connected", this.#serverId, this.#channelId || "");
    } catch (error) {
      // Emit appropriate error
      const wrappedError = new Error("Failed to connect to voice channel", {
        cause: error instanceof Error ? error : new Error(String(error)),
      });

      this.emit("error", wrappedError);
      throw wrappedError;
    }
  }

  /**
   * Reconnects to the voice channel
   *
   * @returns Promise that resolves when reconnection is complete
   */
  async reconnect(): Promise<void> {
    if (!(this.#sessionId && this.#token && this.#endpoint)) {
      throw new Error("Cannot reconnect without an existing connection");
    }

    // Destroy existing connection
    this.disconnect(false);

    // Attempt to reconnect
    this.#reconnectionAttempts++;
    const delay = this.#getReconnectionDelay();

    if (delay > 0) {
      await setTimeout(delay);
    }

    // Reconnect to WebSocket
    return this.#connectWebSocket();
  }

  /**
   * Sets the speaking state
   *
   * @param speaking - Speaking flags
   * @param delay - Voice delay (0 for bots)
   */
  setSpeaking(speaking: number, delay = 0): void {
    if (!(this.#ready && this.#ssrc)) {
      throw new Error("Voice connection not ready");
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

      try {
        ws.removeAllListeners();
        ws.close(1000);
      } catch (error) {
        this.emit("debug", `Error closing WebSocket: ${error}`);
      }
    }

    // Reset state
    this.#ready = false;
    this.#ssrc = null;
    this.#encryption.reset();

    if (emitEvent) {
      this.emit("disconnected", 1000, "Disconnected by client");
    }
  }

  /**
   * Destroys the voice client and cleans up resources
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
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket connection not open");
    }

    const payload: VoicePayloadEntity<T> = {
      op: opcode,
      d: data,
    };

    // Emit debug message
    this.emit("debug", `Sending payload: ${JSON.stringify(payload)}`);

    this.#ws.send(JSON.stringify(payload));
    this.emit("packet", opcode, data);
  }

  /**
   * Sets the user ID
   *
   * @param userId - User ID
   */
  setUserId(userId: string): void {
    this.#userId = userId;
  }

  /**
   * Connects to the voice WebSocket
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
        this.emit("debug", `Connecting to voice WebSocket: ${wsUrl}`);

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
          this.emit("debug", "Voice WebSocket connection opened");
          resolve();
        });
      } catch (error) {
        this.emit("debug", `Failed to connect to voice WebSocket: ${error}`);
        reject(error);
      }
    });
  }

  /**
   * Builds the voice gateway URL
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

      // Debug mode logging
      this.emit("debug", `Received payload: ${JSON.stringify(payload)}`);

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
    this.emit("debug", `Voice WebSocket closed: ${code} - ${reasonStr}`);

    // Stop services
    this.#stopServices();

    // Emit disconnected event
    this.emit("disconnected", code, reasonStr);

    // Handle reconnection
    if (this.#options.autoReconnect && this.#shouldReconnect(code)) {
      this.emit(
        "debug",
        `Attempting to reconnect, attempt ${this.#reconnectionAttempts + 1}`,
      );
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
        break;

      case VoiceOpcodes.Resumed:
        this.#handleResumed();
        break;

      case VoiceOpcodes.ClientDisconnect:
        // Client disconnect handling
        break;

      default:
        // Unknown opcode
        break;
    }
  }

  /**
   * Handles the Ready opcode
   *
   * @param data - Ready payload
   * @private
   */
  async #handleReady(data: VoiceReady): Promise<void> {
    try {
      if (!(data.ssrc && data.ip && data.port && data.modes)) {
        throw new Error("Invalid Ready payload from voice server");
      }

      this.#ssrc = data.ssrc;

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
    }
  }

  /**
   * Handles the SessionDescription opcode
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
      this.emit(
        "ready",
        this.#ssrc as number,
        this.#udp.localIp || "",
        this.#udp.localPort || 0,
      );
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
   * @private
   */
  #handleResumed(): void {
    this.emit("debug", "Voice session resumed");
    this.emit("resumed", this.#sessionId || "");
  }

  /**
   * Selects the protocol for voice communication
   *
   * @param availableModes - Available encryption modes
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
    // Fallback to any available mode
    else if (availableModes.length > 0) {
      mode = availableModes[0] as EncryptionMode;
    } else {
      throw new Error("No encryption modes available");
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

    // Create the payload
    const payload: VoiceIdentify = {
      server_id: this.#serverId,
      user_id: this.#userId || "",
      session_id: this.#sessionId,
      token: this.#token,
    };

    this.send(VoiceOpcodes.Identify, payload);
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
    if (this.#gatewayVersion >= 8) {
      payload.seq_ack = this.#sequence;
    }

    this.send(VoiceOpcodes.Resume, payload);
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
   * @private
   */
  #shouldReconnect(code: number): boolean {
    return !NON_RESUMABLE_VOICE_CLOSE_CODES.includes(
      code as VoiceCloseEventCodes,
    );
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
}
