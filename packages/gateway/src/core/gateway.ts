import { setTimeout as sleep } from "node:timers/promises";
import type { UnavailableGuildEntity } from "@nyxjs/core";
import type { Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";
import type { z } from "zod";
import { fromError, fromZodError } from "zod-validation-error";
import { HeartbeatManager, ShardManager } from "../managers/index.js";
import { GatewayOptions } from "../options/index.js";
import {
  CircuitBreakerService,
  CompressionService,
  EncodingService,
  FailureType,
} from "../services/index.js";
import {
  type ConnectionCompleteEvent,
  type ConnectionFailureEvent,
  type ConnectionStartEvent,
  type GatewayEvents,
  GatewayOpcodes,
  type GatewayReceiveEvents,
  type GatewaySendEvents,
  type GuildCreateEntity,
  type HelloEntity,
  IdentifyEntity,
  type PayloadEntity,
  type PayloadReceiveEvent,
  type PayloadSendEvent,
  type ReadyEntity,
  type RequestGuildMembersEntity,
  type RequestSoundboardSoundsEntity,
  ResumeEntity,
  type SessionInvalidEvent,
  type SessionResumeEvent,
  type SessionStartEvent,
  UpdatePresenceEntity,
  UpdateVoiceStateEntity,
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

  /** Circuit breaker service */
  readonly #circuitBreaker: CircuitBreakerService;

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
      const parsedOptions = { ...options };
      if (!parsedOptions.token) {
        parsedOptions.token = rest.token;
      }

      this.#options = GatewayOptions.parse(parsedOptions);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#rest = rest;

    this.#heartbeat = new HeartbeatManager(this, this.#options.heartbeat);
    this.#shard = new ShardManager(this, this.#options.shard);
    this.#compression = new CompressionService(this.#options.compressionType);
    this.#encoding = new EncodingService(this.#options.encodingType);
    this.#circuitBreaker = new CircuitBreakerService(
      this,
      this.#rest,
      this.#options.circuitBreaker,
    );
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
   * Gets the CircuitBreakerService instance
   */
  get circuitBreaker(): CircuitBreakerService {
    return this.#circuitBreaker;
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
  updatePresence(presence: z.input<typeof UpdatePresenceEntity>): void {
    this.#validateConnection();

    const result = UpdatePresenceEntity.safeParse(presence);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    this.send(GatewayOpcodes.PresenceUpdate, result.data);
  }

  /**
   * Updates the bot's voice state
   *
   * @param options - Voice state update options
   * @throws {Error} If the connection is not valid
   */
  updateVoiceState(options: z.input<typeof UpdateVoiceStateEntity>): void {
    this.#validateConnection();

    const result = UpdateVoiceStateEntity.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    this.send(GatewayOpcodes.VoiceStateUpdate, result.data);
  }

  /**
   * Requests guild member information
   *
   * @param options - Request options
   * @throws {Error} If the connection is not valid
   */
  requestGuildMembers(
    options: z.input<typeof RequestGuildMembersEntity>,
  ): void {
    this.#validateConnection();
    this.send(GatewayOpcodes.RequestGuildMembers, options);
  }

  /**
   * Requests soundboard sounds
   *
   * @param options - Request options
   * @throws {Error} If the connection is not valid
   */
  requestSoundboardSounds(
    options: z.input<typeof RequestSoundboardSoundsEntity>,
  ): void {
    this.#validateConnection();
    this.send(GatewayOpcodes.RequestSoundboardSounds, options);
  }

  /**
   * Connects to the Discord Gateway
   *
   * @returns A promise that resolves when the connection is ready
   * @throws {Error} If connection fails
   */
  async connect(): Promise<void> {
    // Check if the circuit breaker is open
    if (!this.#circuitBreaker.canExecute("connect")) {
      const remainingTimeout = this.#circuitBreaker.remainingTimeout;

      throw new Error(
        `Connection attempt blocked by circuit breaker. Wait ${Math.ceil(remainingTimeout / 1000)} seconds before retrying.`,
      );
    }

    // Reset connection state if reconnecting
    if (this.#ws !== null) {
      // Don't destroy everything, just close the WebSocket
      this.#closeWebSocket();
    }

    this.#connectStartTime = Date.now();

    // Prepare connection event data
    const connectionStartEvent: ConnectionStartEvent = {
      timestamp: new Date().toISOString(),
      gatewayUrl: "",
      encoding: this.#encoding.type,
      compression: this.#compression.type,
    };

    try {
      // Initialize required services in parallel
      const [gatewayInfo] = await Promise.all([
        this.#rest.gateway.getGatewayBot(),
        this.#encoding.initialize(),
        this.#compression.initialize(),
      ]);

      connectionStartEvent.gatewayUrl = gatewayInfo.url;
      this.emit("connectionStart", connectionStartEvent);

      // Set up sharding if enabled
      if (this.#shard.isEnabled()) {
        const guilds = await this.#rest.users.getCurrentUserGuilds();
        await this.#shard.spawn(
          guilds.length,
          gatewayInfo.session_start_limit.max_concurrency,
          gatewayInfo.shards,
        );
      }

      // Set up WebSocket connection
      await this.#initializeWebSocket(gatewayInfo.url);

      // Wait for READY event with proper cleanup
      const result = await new Promise<void>((resolve, reject) => {
        // Set timeout for the connection
        const connectionTimeout = setTimeout(() => {
          cleanup();
          reject(new Error("Connection timed out waiting for READY event"));
        }, 30000); // 30 second timeout

        const cleanup = (): void => {
          clearTimeout(connectionTimeout);
          this.removeListener("dispatch", readyHandler);
          this.removeListener("error", errorHandler);
          this.removeListener("connectionFailure", failureHandler);
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

        const failureHandler = (event: ConnectionFailureEvent): void => {
          cleanup();
          reject(event.error);
        };

        this.once("dispatch", readyHandler);
        this.once("error", errorHandler);
        this.once("connectionFailure", failureHandler);
      });

      // Reset reconnection attempts
      this.#circuitBreaker.recordSuccess();
      this.#reconnectionAttempts = 0;

      return result;
    } catch (error) {
      const failureEvent: ConnectionFailureEvent = {
        timestamp: new Date().toISOString(),
        gatewayUrl: connectionStartEvent.gatewayUrl,
        encoding: this.#encoding.type,
        compression: this.#compression.type,
        error: error instanceof Error ? error : new Error(String(error)),
        duration: Date.now() - this.#connectStartTime,
        attemptNumber: this.#reconnectionAttempts + 1,
      };

      this.emit("connectionFailure", failureEvent);

      // Record failure in circuit breaker
      const failureType = CircuitBreakerService.detectFailureType(
        error instanceof Error ? error : new Error(String(error)),
      );

      this.#circuitBreaker.recordFailure(
        error instanceof Error ? error : new Error(String(error)),
        failureType,
      );

      // Enhanced error reporting with more context
      throw new Error("Failed to connect to gateway", {
        cause: error,
      });
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
    this.#validateConnection();

    const payload: PayloadEntity = {
      op: opcode,
      d: data,
      s: this.#sequence,
      t: null,
    };

    const encoded = this.#encoding.encode(payload);

    const payloadSendEvent: PayloadSendEvent = {
      timestamp: new Date().toISOString(),
      opcode,
      sequence: this.#sequence,
      payloadSize:
        typeof encoded === "string"
          ? Buffer.byteLength(encoded)
          : encoded.length,
    };

    this.emit("payloadSend", payloadSendEvent);
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
  async destroy(code = 1000): Promise<void> {
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
      this.#circuitBreaker.destroy();

      if (this.#shard.isEnabled()) {
        await this.#shard.destroy();
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

          const connectionCompleteEvent: ConnectionCompleteEvent = {
            timestamp: new Date().toISOString(),
            gatewayUrl: wsUrl,
            encoding: this.#encoding.type,
            compression: this.#compression.type,
            duration: Date.now() - this.#connectStartTime,
            resuming: Boolean(this.#sessionId && this.#sequence > 0),
          };

          this.emit("connectionComplete", connectionCompleteEvent);
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

    // Emit receive event
    const payloadReceiveEvent: PayloadReceiveEvent = {
      timestamp: new Date().toISOString(),
      opcode: payload.op,
      sequence: payload.s ?? this.#sequence,
      eventType: payload.t ?? null,
      payloadSize: processedData.length,
    };

    this.emit("payloadReceive", payloadReceiveEvent);

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
        await this.#handleDispatch(payload);
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
  async #handleDispatch(payload: PayloadEntity): Promise<void> {
    if (!payload.t) {
      return;
    }

    switch (payload.t) {
      case "READY": {
        const data = payload.d as ReadyEntity;
        await this.#handleReady(data);
        break;
      }

      case "GUILD_CREATE": {
        if (this.#shard.isEnabled()) {
          const data = payload.d as GuildCreateEntity;
          if ("id" in data && !("unavailable" in data)) {
            await this.#shard.addGuildToShard(data.id);
          }
        }
        break;
      }

      case "GUILD_DELETE": {
        if (this.#shard.isEnabled()) {
          const data = payload.d as UnavailableGuildEntity;
          if ("id" in data) {
            await this.#shard.removeGuildFromShard(data.id);
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
      payload.t as keyof GatewayReceiveEvents,
      payload.d as never,
    );
  }

  /**
   * Handles the READY dispatch event
   *
   * @param data - Ready payload data
   */
  async #handleReady(data: ReadyEntity): Promise<void> {
    // Update session information
    this.setSession(data.session_id, data.resume_gateway_url);

    // Handle sharding if enabled
    if (this.#shard.isEnabled()) {
      const shard = this.#shard.getShardInfo(data.shard?.[0] ?? 0);
      if (shard) {
        await this.#shard.setShardStatus(shard.shardId, "ready");
        const guildIds = data.guilds.map((guild) => guild.id);
        await this.#shard.addGuildsToShard(shard.shardId, guildIds);
      }
    }

    // Calculate connection time
    const readyTime = Date.now() - this.#connectStartTime;

    // Emit session start event
    const sessionStartEvent: SessionStartEvent = {
      timestamp: new Date().toISOString(),
      sessionId: data.session_id,
      resumeUrl: data.resume_gateway_url,
      userId: data.user.id,
      version: data.v,
      readyTimeout: readyTime,
      guildCount: data.guilds.length,
      shardCount: this.#shard.totalShards,
    };

    this.emit("sessionStart", sessionStartEvent);
  }

  /**
   * Handles WebSocket close events
   *
   * @param code - Close code
   * @param reason - Close reason if provided
   */
  async #handleClose(code: number, reason?: string): Promise<void> {
    this.#heartbeat.destroy();

    // Record failure if not a clean close
    if (code !== 1000 && code !== 1001) {
      const error = new Error(
        `WebSocket closed with code ${code}: ${reason || "No reason provided"}`,
      );
      const failureType =
        code === 4004 ? FailureType.Authentication : FailureType.WebSocket;

      this.#circuitBreaker.recordFailure(error, failureType);
    } else {
      // For clean closures, clear session information
      this.#sessionId = null;
      this.#resumeUrl = null;
      this.#sequence = 0;
    }

    await this.#handleDisconnect(code, reason);
  }

  /**
   * Handles invalid session events
   *
   * @param resumable - Whether the session is resumable
   */
  async #handleInvalidSession(resumable: boolean): Promise<void> {
    const sessionInvalidEvent: SessionInvalidEvent = {
      timestamp: new Date().toISOString(),
      sessionId: this.#sessionId ?? "",
      resumable,
      reason: resumable ? "resumable" : "not_resumable",
    };

    this.emit("sessionInvalid", sessionInvalidEvent);

    // Record failure if not resumable
    if (!resumable) {
      this.#circuitBreaker.recordFailure(
        new Error("Non-resumable invalid session"),
        FailureType.Gateway,
      );

      // Clear session info if not resumable
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
      await sleep(delay);

      // Attempt reconnection
      if (!this.#circuitBreaker.canExecute("reconnect")) {
        // Wait for the circuit breaker to reset
        const additionalDelay = Math.min(
          this.#circuitBreaker.remainingTimeout,
          60000, // Max 1 minute
        );

        await sleep(additionalDelay);
        await this.#handleDisconnect(code, reason);
        return;
      }

      if (this.#shouldResume(code) && this.#canResume()) {
        await this.#handleResume();
      } else {
        // Close any existing connection
        this.#closeWebSocket();
        await this.connect();
      }
    } catch (error) {
      this.emit("error", new Error("Reconnection failed", { cause: error }));

      // Record failure in circuit breaker
      const failureType = CircuitBreakerService.detectFailureType(
        error instanceof Error ? error : new Error(String(error)),
      );

      this.#circuitBreaker.recordFailure(
        error instanceof Error ? error : new Error(String(error)),
        failureType,
      );

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

      const resumeEvent: SessionResumeEvent = {
        timestamp: new Date().toISOString(),
        sessionId: this.#sessionId ?? "",
        resumeUrl: this.#resumeUrl,
        replayedEvents: 0, // Cannot know this yet
        resumeLatency: Date.now() - this.#connectStartTime,
      };

      this.emit("sessionResume", resumeEvent);
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
    if (!this.#options.token) {
      throw new Error(
        "No token available for identification. Please provide a token through Gateway options or ensure REST client has a valid token.",
      );
    }

    if (!this.#sessionId) {
      throw new Error("No session ID available to resume");
    }

    const payload: ResumeEntity = {
      token: this.#options.token,
      session_id: this.#sessionId,
      seq: this.#sequence,
    };

    const result = ResumeEntity.safeParse(payload);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    this.send(GatewayOpcodes.Resume, result.data);
  }

  /**
   * Sends an identify payload
   */
  async #identify(): Promise<void> {
    if (!this.#options.token) {
      throw new Error(
        "No token available for identification. Please provide a token through Gateway options or ensure REST client has a valid token.",
      );
    }

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

    // Validate payload
    const result = IdentifyEntity.safeParse(payload);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    this.send(GatewayOpcodes.Identify, result.data);
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
   * Validates that the connection is open
   *
   * @throws {Error} If the connection is not valid
   */
  #validateConnection(): void {
    if (!this.isConnectionValid()) {
      throw new Error("WebSocket connection is not open");
    }
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
