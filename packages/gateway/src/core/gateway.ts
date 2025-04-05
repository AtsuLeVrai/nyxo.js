import { type UnavailableGuildEntity, sleep } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { HeartbeatManager, ShardManager } from "../managers/index.js";
import { GatewayOptions } from "../options/index.js";
import { CompressionService, EncodingService } from "../services/index.js";
import {
  type GatewayEvents,
  GatewayOpcodes,
  type GatewayReceiveEvents,
  type GatewaySendEvents,
  type GuildCreateEntity,
  type HelloEntity,
  type IdentifyEntity,
  type PayloadEntity,
  type ReadyEntity,
  type RequestGuildMembersEntity,
  type RequestSoundboardSoundsEntity,
  type ResumeEntity,
  type UpdatePresenceEntity,
  type UpdateVoiceStateEntity,
} from "../types/index.js";

/**
 * WebSocket close codes that cannot be resumed
 */
const NON_RESUMABLE_CODES: readonly number[] = [
  4004, // Authentication failed
  4010, // Invalid shard sent
  4011, // Sharding required
  4012, // Invalid API version
  4013, // Invalid intents
  4014, // Disallowed intents
] as const;

/**
 * Main Gateway client for Discord WebSocket communication
 *
 * This class handles:
 * - Establishing and maintaining the WebSocket connection
 * - Processing Gateway events and opcodes
 * - Coordinating heartbeats
 * - Managing session lifecycle
 * - Handling sharding
 */
export class Gateway extends EventEmitter<GatewayEvents> {
  /** Current session ID */
  #sessionId: string | null = null;

  /** URL for resuming the current session */
  #resumeUrl: string | null = null;

  /** Last received sequence number */
  #sequence = 0;

  /** WebSocket connection */
  #ws: WebSocket | null = null;

  /** Timestamp when connection started */
  #connectStartTime = 0;

  /** Timestamp when the connection was last ready */
  #readyAt: number | null = null;

  /** Number of reconnection attempts made */
  #reconnectionAttempts = 0;

  /** Whether a reconnection is in progress */
  #isReconnecting = false;

  /** Discord REST API client */
  readonly #rest: Rest;

  /** Heartbeat manager */
  readonly #heartbeat: HeartbeatManager;

  /** Shard manager */
  readonly #shard: ShardManager;

  /** Compression service */
  readonly #compression: CompressionService;

  /** Encoding service */
  readonly #encoding: EncodingService;

  /** Gateway configuration options */
  readonly #options: GatewayOptions;

  /**
   * Creates a new Gateway client
   *
   * @param rest - Discord REST API client
   * @param options - Gateway configuration options
   * @throws {Error} If options validation fails
   */
  constructor(rest: Rest, options: z.input<typeof GatewayOptions>) {
    super();

    try {
      this.#options = GatewayOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#rest = rest;

    this.#heartbeat = new HeartbeatManager(this, this.#options.heartbeat);
    this.#shard = new ShardManager(this, this.#options.shard);
    this.#compression = new CompressionService(this.#options.compressionType);
    this.#encoding = new EncodingService(this.#options.encodingType);
  }

  /**
   * Gets the bot token
   */
  get token(): string {
    return this.#options.token;
  }

  /**
   * Gets the validated Gateway options
   */
  get options(): GatewayOptions {
    return this.#options;
  }

  /**
   * Gets the current WebSocket ready state
   */
  get readyState(): number {
    return this.#ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Gets the timestamp when the connection was started
   */
  get connectStartTime(): number {
    return this.#connectStartTime;
  }

  /**
   * Gets the timestamp when the connection was last ready
   */
  get readyAt(): number {
    return this.#readyAt ?? 0;
  }

  /**
   * Gets the uptime of the connection in milliseconds
   */
  get uptime(): number {
    return this.#readyAt ? Date.now() - this.#readyAt : 0;
  }

  /**
   * Gets the underlying WebSocket instance
   */
  get webSocket(): WebSocket | null {
    return this.#ws;
  }

  /**
   * Gets the last received sequence number
   */
  get sequence(): number {
    return this.#sequence;
  }

  /**
   * Gets the current session ID
   */
  get sessionId(): string | null {
    return this.#sessionId;
  }

  /**
   * Gets the URL for resuming the current session
   */
  get resumeUrl(): string | null {
    return this.#resumeUrl;
  }

  /**
   * Gets the HeartbeatManager instance
   */
  get heartbeat(): HeartbeatManager {
    return this.#heartbeat;
  }

  /**
   * Gets the ShardManager instance
   */
  get shard(): ShardManager {
    return this.#shard;
  }

  /**
   * Gets the CompressionService instance
   */
  get compression(): CompressionService {
    return this.#compression;
  }

  /**
   * Gets the EncodingService instance
   */
  get encoding(): EncodingService {
    return this.#encoding;
  }

  /**
   * Updates session information
   *
   * @param sessionId - New session ID
   * @param resumeUrl - New resume URL
   */
  setSession(sessionId: string, resumeUrl: string): void {
    this.#sessionId = sessionId;
    this.#resumeUrl = resumeUrl;
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
   * Updates the bot's presence information
   *
   * @param presence - New presence data
   * @throws {Error} If the connection is not valid
   */
  updatePresence(presence: UpdatePresenceEntity): void {
    if (!this.isConnectionValid()) {
      throw new Error("Cannot update presence, WebSocket is not open");
    }

    this.send(GatewayOpcodes.PresenceUpdate, presence);
  }

  /**
   * Updates the bot's voice state
   *
   * @param options - Voice state update options
   * @throws {Error} If the connection is not valid
   */
  updateVoiceState(options: UpdateVoiceStateEntity): void {
    if (!this.isConnectionValid()) {
      throw new Error("Cannot update voice state, WebSocket is not open");
    }

    this.send(GatewayOpcodes.VoiceStateUpdate, options);
  }

  /**
   * Requests guild member information
   *
   * @param options - Request options
   * @throws {Error} If the connection is not valid
   */
  requestGuildMembers(options: RequestGuildMembersEntity): void {
    if (!this.isConnectionValid()) {
      throw new Error("Cannot request guild members, WebSocket is not open");
    }

    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  /**
   * Requests soundboard sounds
   *
   * @param options - Request options
   * @throws {Error} If the connection is not valid
   */
  requestSoundboardSounds(options: RequestSoundboardSoundsEntity): void {
    if (!this.isConnectionValid()) {
      throw new Error(
        "Cannot request soundboard sounds, WebSocket is not open",
      );
    }

    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  /**
   * Connects to the Discord Gateway
   *
   * @returns A promise that resolves when the connection is ready
   * @throws {Error} If connection fails
   */
  async connect(): Promise<void> {
    // Reset connection state if reconnecting
    if (this.#ws !== null) {
      // Close the WebSocket but don't destroy everything
      this.#closeWebSocket();
    }

    this.#connectStartTime = Date.now();

    try {
      // Initialize services
      const [gatewayInfo, guilds] = await Promise.all([
        this.#rest.gateway.getGatewayBot(),
        this.#rest.users.getCurrentUserGuilds(),
        this.#encoding.initialize(),
        this.#compression.initialize(),
      ]);

      // Initialize sharding if enabled
      if (this.#shard.isEnabled()) {
        await this.#shard.spawn(
          guilds.length,
          gatewayInfo.session_start_limit.max_concurrency,
          gatewayInfo.shards,
        );
      }

      // Emit connection attempt event
      this.emit("connectionAttempt", {
        timestamp: new Date().toISOString(),
        gatewayUrl: gatewayInfo.url,
        encoding: this.#encoding.type,
        compression: this.#compression.type,
      });

      // Set up WebSocket connection
      await this.#initializeWebSocket(gatewayInfo.url);

      // Wait for READY event
      await this.#waitForReady();

      // Reset reconnection attempts on successful connection
      this.#reconnectionAttempts = 0;
    } catch (error) {
      this.emit("connectionFailure", {
        timestamp: new Date().toISOString(),
        gatewayUrl: null,
        error: error instanceof Error ? error : new Error(String(error)),
        attemptNumber: this.#reconnectionAttempts + 1,
      });

      // Throw enhanced error with more context
      throw new Error("Failed to connect to gateway", { cause: error });
    }
  }

  /**
   * Sends a payload to the Gateway
   *
   * @param opcode - Gateway opcode
   * @param data - Payload data
   * @throws {Error} If the connection is not valid
   */
  send<T extends keyof GatewaySendEvents>(
    opcode: T,
    data: GatewaySendEvents[T],
  ): void {
    if (!this.isConnectionValid()) {
      throw new Error("Cannot send data, WebSocket is not open");
    }

    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: this.#sequence,
      t: null,
    };

    const encoded = this.#encoding.encode(payload);
    this.#ws?.send(encoded);
  }

  /**
   * Gracefully disconnects from the Gateway
   *
   * Use this method to cleanly disconnect without triggering reconnection
   *
   * @param code - WebSocket close code (defaults to 1000 - Normal Closure)
   * @param reason - Reason for disconnection
   */
  disconnect(code = 1000, reason = "Normal closure"): void {
    // Send a clean close to Discord
    this.#closeWebSocket(code, reason);

    // If the code is a clean close, clear session info
    if (code === 1000 || code === 1001) {
      this.#sessionId = null;
      this.#resumeUrl = null;
      this.#sequence = 0;
    }
  }

  /**
   * Destroys the Gateway connection and all associated resources
   *
   * @param code - WebSocket close code
   * @throws {Error} If destruction fails
   */
  destroy(code = 1000): void {
    try {
      // Close the WebSocket connection
      this.#closeWebSocket(code);

      // Clear session information
      this.#sessionId = null;
      this.#resumeUrl = null;
      this.#sequence = 0;

      // Destroy services
      this.#encoding.destroy();
      this.#compression.destroy();
      this.#heartbeat.destroy();

      if (this.#shard.isEnabled()) {
        this.#shard.destroy();
      }

      // Clear any event listeners
      this.removeAllListeners();
    } catch (error) {
      throw new Error("Failed to destroy gateway connection", {
        cause: error,
      });
    }
  }

  /**
   * Checks if the connection is valid for sending
   */
  isConnectionValid(): boolean {
    return this.#ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Checks if the connection is ready
   */
  isReady(): boolean {
    return this.#ws?.readyState === WebSocket.OPEN && this.#sessionId !== null;
  }

  /**
   * Waits for the READY event after connection
   *
   * @private
   */
  async #waitForReady(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Set timeout for the connection
      const connectionTimeout = setTimeout(() => {
        cleanup();
        reject(new Error("Connection timed out waiting for READY event"));
      }, 30000); // 30 second timeout

      const cleanup = (): void => {
        clearTimeout(connectionTimeout);
        this.removeListener("dispatch", readyHandler);
        this.removeListener("error", errorHandler);
      };

      const readyHandler = (event: keyof GatewayReceiveEvents): void => {
        if (event === "READY") {
          cleanup();
          resolve();
        }
      };

      const errorHandler = (error: Error | string): void => {
        cleanup();
        reject(error);
      };

      this.once("dispatch", readyHandler);
      this.once("error", errorHandler);
    });
  }

  /**
   * Closes only the WebSocket without destroying services
   *
   * @param code - Close code to send
   * @param reason - Optional close reason
   * @private
   */
  #closeWebSocket(code = 1000, reason?: string): void {
    const ws = this.#ws;
    if (ws) {
      ws.removeAllListeners();
      try {
        ws.close(code, reason);
      } catch (_error) {
        // Ignore errors during close
      }
      this.#ws = null;
    }
  }

  /**
   * Initializes and opens the WebSocket connection
   *
   * @param url - Gateway URL
   * @throws {Error} If initialization fails
   */
  async #initializeWebSocket(url: string): Promise<void> {
    try {
      const wsUrl = this.#buildGatewayUrl(url);
      const ws = new WebSocket(wsUrl);
      this.#ws = ws;

      // Set up event handlers
      ws.on("message", this.#handleMessage.bind(this));
      ws.on("close", this.#handleClose.bind(this));
      ws.on("error", this.#handleWebSocketError.bind(this));

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        // Set a timeout for connection establishment
        const connectionTimeout = setTimeout(() => {
          reject(new Error("WebSocket connection timed out"));
        }, 15000); // 15 second timeout

        ws.once("open", () => {
          clearTimeout(connectionTimeout);

          this.emit("connectionSuccess", {
            timestamp: new Date().toISOString(),
            gatewayUrl: wsUrl,
            resumed: Boolean(this.#sessionId && this.#sequence > 0),
          });

          resolve();
        });

        ws.once("error", (err) => {
          clearTimeout(connectionTimeout);
          reject(err);
        });
      });
    } catch (error) {
      throw new Error("Failed to initialize WebSocket", { cause: error });
    }
  }

  /**
   * Handles WebSocket errors
   *
   * @param error - WebSocket error
   * @private
   */
  #handleWebSocketError(error: Error): void {
    // Emit the error
    this.emit("error", new Error("WebSocket error", { cause: error }));

    // Don't attempt to handle the error here - let the close handler do it
    // as an error is typically followed by a close event
  }

  /**
   * Handles an incoming WebSocket message
   *
   * @param data - Raw message data
   */
  async #handleMessage(data: Buffer): Promise<void> {
    let processedData = data;

    // Decompress if needed
    if (this.#compression.isInitialized()) {
      try {
        processedData = this.#compression.decompress(data);
      } catch (error) {
        this.emit(
          "error",
          new Error("Failed to decompress message", { cause: error }),
        );
        return;
      }
    }

    // Decode the payload
    let payload: PayloadEntity;
    try {
      payload = this.#encoding.decode(processedData);
    } catch (error) {
      this.emit(
        "error",
        new Error("Failed to decode message", { cause: error }),
      );
      return;
    }

    // Process the payload
    try {
      await this.#handlePayload(payload);
    } catch (error) {
      this.emit(
        "error",
        new Error("Error handling gateway payload", { cause: error }),
      );
    }
  }

  /**
   * Processes a decoded Gateway payload
   *
   * @param payload - Decoded payload
   */
  async #handlePayload(payload: PayloadEntity): Promise<void> {
    // Update sequence number if provided
    if (payload.s !== null) {
      this.updateSequence(payload.s);
    }

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.#handleDispatch(payload);
        break;

      case GatewayOpcodes.Hello:
        await this.#handleHello(payload.d as HelloEntity);
        break;

      case GatewayOpcodes.Heartbeat:
        this.#heartbeat.sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        this.#heartbeat.ackHeartbeat();
        break;

      case GatewayOpcodes.InvalidSession:
        await this.#handleInvalidSession(Boolean(payload.d));
        break;

      case GatewayOpcodes.Reconnect:
        await this.#handleReconnect();
        break;

      default:
        break;
    }
  }

  /**
   * Handles the Hello opcode
   *
   * @param hello - Hello payload data
   */
  async #handleHello(hello: HelloEntity): Promise<void> {
    this.#heartbeat.start(hello.heartbeat_interval);

    if (this.#canResume()) {
      this.#sendResume();
    } else {
      await this.#identify();
    }
  }

  /**
   * Handles dispatch events
   *
   * @param payload - Dispatch payload
   */
  #handleDispatch(payload: PayloadEntity): void {
    if (!payload.t) {
      return;
    }

    switch (payload.t) {
      case "READY": {
        const data = payload.d as ReadyEntity;
        this.#handleReady(data);
        break;
      }

      case "GUILD_CREATE": {
        if (this.#shard.isEnabled()) {
          const data = payload.d as GuildCreateEntity;
          if ("id" in data && !("unavailable" in data)) {
            this.#shard.addGuildToShard(data.id);
          }
        }
        break;
      }

      case "GUILD_DELETE": {
        if (this.#shard.isEnabled()) {
          const data = payload.d as UnavailableGuildEntity;
          if ("id" in data) {
            this.#shard.removeGuildFromShard(data.id);
          }
        }
        break;
      }

      default:
        break;
    }

    // Forward the dispatch event
    this.emit(
      "dispatch",
      payload.t,
      payload.d as GatewayReceiveEvents[typeof payload.t],
    );
  }

  /**
   * Handles the READY dispatch event
   *
   * @param data - Ready payload data
   */
  #handleReady(data: ReadyEntity): void {
    // Update session information
    this.setSession(data.session_id, data.resume_gateway_url);

    // Handle sharding if enabled
    if (this.#shard.isEnabled()) {
      const shard = this.#shard.getShardInfo(data.shard?.[0] ?? 0);
      if (shard) {
        this.#shard.setShardStatus(shard.shardId, "ready");
        const guildIds = data.guilds.map((guild) => guild.id);
        this.#shard.addGuildsToShard(shard.shardId, guildIds);
      }
    }

    // Emit the ready event
    this.#readyAt = Date.now();

    this.emit("sessionStart", {
      timestamp: new Date().toISOString(),
      sessionId: data.session_id,
      resumeUrl: data.resume_gateway_url,
      userId: data.user.id,
      guildCount: data.guilds.length,
      duration: Date.now() - this.#connectStartTime,
    });
  }

  /**
   * Handles WebSocket close events
   *
   * @param code - Close code
   * @param reason - Close reason if provided
   */
  async #handleClose(code: number, reason?: string): Promise<void> {
    // Destroy heartbeat to stop sending
    this.#heartbeat.destroy();

    // For clean closures, clear session information
    if (code === 1000 || code === 1001) {
      this.#sessionId = null;
      this.#resumeUrl = null;
      this.#sequence = 0;
    }

    // Emit disconnect event for any active shards
    if (this.#shard.isEnabled()) {
      for (const shard of this.#shard.shards) {
        if (shard.status !== "disconnected") {
          this.emit("shardDisconnect", {
            timestamp: new Date().toISOString(),
            shardId: shard.shardId,
            totalShards: shard.totalShards,
            closeCode: code,
            reason: reason || "Connection closed",
            willReconnect: this.#options.heartbeat.autoReconnect,
          });
        }
      }
    }

    await this.#handleDisconnect(code, reason);
  }

  /**
   * Handles invalid session events
   *
   * @param resumable - Whether the session is resumable
   */
  async #handleInvalidSession(resumable: boolean): Promise<void> {
    this.emit("sessionInvalidate", {
      timestamp: new Date().toISOString(),
      sessionId: this.#sessionId ?? "",
      resumable,
      reason: resumable ? "server_request" : "authentication_failed",
    });

    // Clear session info if not resumable
    if (!resumable) {
      this.#sessionId = null;
      this.#resumeUrl = null;
      this.#sequence = 0;
    }

    if (resumable && this.#canResume()) {
      await this.#handleResume();
    } else {
      await this.#handleReconnect();
    }
  }

  /**
   * Determines if a session should be resumed based on close code
   *
   * @param code - WebSocket close code
   */
  #shouldResume(code: number): boolean {
    const isClean = code === 1000 || code === 1001;
    return !(isClean || NON_RESUMABLE_CODES.includes(code));
  }

  /**
   * Handles reconnect events
   */
  async #handleReconnect(): Promise<void> {
    if (this.#isReconnecting) {
      return;
    }

    this.#isReconnecting = true;

    try {
      this.#closeWebSocket(4000);
      await this.#handleDisconnect(4000);
    } finally {
      this.#isReconnecting = false;
    }
  }

  /**
   * Handles disconnection and reconnection logic
   *
   * @param code - WebSocket close code
   * @param reason - Close reason if available
   */
  async #handleDisconnect(code: number, reason?: string): Promise<void> {
    if (!this.#options.heartbeat.autoReconnect) {
      return;
    }

    // Wait for any existing reconnection to finish
    if (this.#isReconnecting) {
      // Wait a bit for the current reconnection to complete
      await sleep(1000);
      return;
    }

    this.#isReconnecting = true;
    this.#reconnectionAttempts++;

    try {
      const delay = this.#getReconnectionDelay();

      // Emit reconnection scheduled event
      this.emit("reconnectionScheduled", {
        timestamp: new Date().toISOString(),
        delayMs: delay,
        reason: this.#shouldResume(code)
          ? "connection_closed"
          : "invalid_session",
        previousAttempts: this.#reconnectionAttempts - 1,
      });

      await sleep(delay);

      if (this.#shouldResume(code) && this.#canResume()) {
        await this.#handleResume();
      } else {
        // Close any existing connection
        this.#closeWebSocket();
        await this.connect();
      }
    } catch (error) {
      this.emit("error", new Error("Reconnection failed", { cause: error }));

      // Try again after a delay
      await sleep(5000);
      await this.#handleDisconnect(code, reason);
    } finally {
      this.#isReconnecting = false;
    }
  }

  /**
   * Handles session resumption
   */
  async #handleResume(): Promise<void> {
    if (!this.#resumeUrl) {
      throw new Error("No resume URL available for session resumption");
    }

    try {
      // Initialize WebSocket with resume URL
      await this.#initializeWebSocket(this.#resumeUrl);
      this.#sendResume();

      this.emit("sessionResume", {
        timestamp: new Date().toISOString(),
        sessionId: this.#sessionId ?? "",
        sequence: this.#sequence,
        replayedEvents: 0,
        latencyMs: this.#heartbeat.latency,
      });
    } catch (_error) {
      // If resume fails, try clean reconnect
      await this.#handleDisconnect(4000);
    }
  }

  /**
   * Checks if session can be resumed
   */
  #canResume(): boolean {
    return Boolean(this.#sessionId && this.#sequence > 0);
  }

  /**
   * Sends a resume payload
   */
  #sendResume(): void {
    if (!this.#sessionId) {
      throw new Error("No session ID available to resume");
    }

    const payload: ResumeEntity = {
      token: this.#options.token,
      session_id: this.#sessionId,
      seq: this.#sequence,
    };

    this.send(GatewayOpcodes.Resume, payload);
  }

  /**
   * Sends an identify payload
   */
  async #identify(): Promise<void> {
    const payload: IdentifyEntity = {
      token: this.#options.token,
      properties: {
        os: process.platform,
        browser: "nyx.js",
        device: "nyx.js",
      },
      compress: this.#compression.isInitialized(),
      large_threshold: this.#options.largeThreshold,
      intents: this.#options.intents,
    };

    // Add shard info if sharding is enabled
    if (this.#shard.isEnabled() && this.#shard.totalShards > 0) {
      payload.shard = await this.#shard.getAvailableShard();
    }

    // Add presence if provided
    if (this.#options.presence) {
      payload.presence = this.#options.presence;
    }

    this.send(GatewayOpcodes.Identify, payload);
  }

  /**
   * Builds the Gateway URL with query parameters
   *
   * @param baseUrl - Base Gateway URL
   * @returns Complete Gateway URL with parameters
   */
  #buildGatewayUrl(baseUrl: string): string {
    const params = new URLSearchParams({
      v: String(this.#options.version),
      encoding: this.#encoding.type,
    });

    if (this.#compression.type) {
      params.append("compress", this.#compression.type);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Gets the reconnection delay based on attempt count
   *
   * @returns Delay in milliseconds
   */
  #getReconnectionDelay(): number {
    return (
      this.#options.backoffSchedule[this.#reconnectionAttempts - 1] ??
      this.#options.backoffSchedule.at(-1) ??
      0
    );
  }
}
