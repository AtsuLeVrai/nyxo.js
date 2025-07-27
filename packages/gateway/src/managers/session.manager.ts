import type { Gateway } from "../core/index.js";
import type { CompressionType, EncodingType } from "../services/index.js";
import type { ReadyEntity, ResumeEntity } from "../types/index.js";

/**
 * Manages Discord Gateway session state and lifecycle.
 * Handles session establishment, resumption, and invalidation.
 *
 * @example
 * ```typescript
 * const session = new SessionManager(gateway);
 *
 * // After READY event
 * if (session.canResume) {
 *   console.log(`Session ${session.id} can be resumed`);
 * }
 *
 * console.log(`Uptime: ${session.uptime}ms`);
 * ```
 *
 * @public
 */
export class SessionManager {
  /**
   * Session ID assigned by Discord for this connection.
   * Required for session resumption.
   *
   * @public
   */
  id: string | null = null;

  /**
   * URL for resuming the WebSocket connection.
   * Provided by Discord in READY event for optimal resumption.
   *
   * @public
   */
  resumeUrl: string | null = null;

  /**
   * Last received sequence number from Discord.
   * Critical for session resumption and event ordering.
   *
   * @public
   */
  sequence = 0;

  /**
   * Timestamp when session became ready.
   * Used to calculate uptime and monitor connection stability.
   *
   * @public
   */
  readyAt: number | null = null;

  /**
   * User ID of bot associated with this session.
   * Extracted from user object in READY event.
   *
   * @public
   */
  userId: string | null = null;

  /**
   * Total number of guilds available to this session.
   * Set during READY event for monitoring and metrics.
   *
   * @public
   */
  guildCount = 0;

  /**
   * Whether session can be resumed if connection drops.
   * Enables faster reconnection without re-downloading guild data.
   *
   * @public
   */
  resumable = false;

  /**
   * Gateway instance that owns this session manager.
   * Used for emitting events and coordinating with other components.
   *
   * @readonly
   * @internal
   */
  readonly #gateway: Gateway;

  /**
   * Creates a new SessionManager instance.
   * Starts in fresh state with no active session data.
   *
   * @param gateway - Gateway instance that will own this session manager
   *
   * @example
   * ```typescript
   * const session = new SessionManager(gateway);
   * ```
   *
   * @public
   */
  constructor(gateway: Gateway) {
    this.#gateway = gateway;
  }

  /**
   * Session uptime in milliseconds.
   * Calculates time since READY event was received.
   *
   * @returns Uptime in milliseconds, or 0 if never ready
   *
   * @public
   */
  get uptime(): number {
    return this.readyAt ? Date.now() - this.readyAt : 0;
  }

  /**
   * Checks if session is active and ready to handle events.
   * Requires valid session ID and successful READY event.
   *
   * @returns True if session is active and ready
   *
   * @public
   */
  get isActive(): boolean {
    return this.id !== null && this.readyAt !== null;
  }

  /**
   * Checks if session can be resumed after disconnection.
   * Requires valid session data and resumable flag.
   *
   * @returns True if session can be resumed
   *
   * @public
   */
  get canResume(): boolean {
    return this.resumable && this.id !== null && this.sequence > 0;
  }

  /**
   * Checks if this is fresh session that has never been ready.
   * Fresh sessions require complete connection handshake.
   *
   * @returns True if session has never been ready
   *
   * @public
   */
  get isFresh(): boolean {
    return this.readyAt === null;
  }

  /**
   * Updates sequence number from received Gateway payload.
   * Maintains event ordering and enables proper session resumption.
   *
   * @param sequence - Sequence number from received payload
   *
   * @example
   * ```typescript
   * session.updateSequence(42);
   * console.log(`Current sequence: ${session.sequence}`);
   * ```
   *
   * @public
   */
  updateSequence(sequence: number): void {
    if (sequence > this.sequence) {
      this.sequence = sequence;
      this.#gateway.emit("sequenceUpdate", sequence);
    }
  }

  /**
   * Initializes new session with data from READY event.
   * Establishes active session and enables resumption.
   *
   * @param data - READY event data containing session information
   * @param encoding - Encoding type used for this session
   * @param compression - Compression type used, if any
   *
   * @example
   * ```typescript
   * session.initializeSession(readyData, "json", "zlib-stream");
   * ```
   *
   * @public
   */
  initializeSession(
    data: ReadyEntity,
    encoding: EncodingType,
    compression?: CompressionType | null,
  ): void {
    const now = Date.now();

    this.id = data.session_id;
    this.resumeUrl = data.resume_gateway_url;
    this.readyAt = now;
    this.userId = data.user.id;
    this.guildCount = data.guilds.length;
    this.resumable = true;

    this.#gateway.emit("sessionStart", {
      timestamp: new Date().toISOString(),
      sessionId: data.session_id,
      resumeUrl: data.resume_gateway_url,
      userId: data.user.id,
      guildCount: data.guilds.length,
      encoding: encoding,
      compression: compression,
      shardCount: 0,
    });
  }

  /**
   * Handles successful session resumption after reconnection.
   * Updates state to reflect active connection.
   *
   * @throws {Error} If no session ID is available
   *
   * @example
   * ```typescript
   * session.resumeSession();
   * console.log("Session resumed successfully");
   * ```
   *
   * @public
   */
  resumeSession(): void {
    if (!this.id) {
      throw new Error("Cannot resume session: no session ID available");
    }

    this.readyAt = Date.now();
    this.resumable = true;

    this.#gateway.emit("sessionResume", {
      timestamp: new Date().toISOString(),
      sessionId: this.id,
      sequence: this.sequence,
      latency: 0,
    });
  }

  /**
   * Invalidates current session based on Discord's instructions.
   * Handles various invalidation scenarios from Discord.
   *
   * @param resumable - Whether session can potentially be resumed later
   * @param reason - Human-readable reason for invalidation
   *
   * @example
   * ```typescript
   * session.invalidateSession(false, "authentication_failed");
   * ```
   *
   * @public
   */
  invalidateSession(resumable: boolean, reason: string): void {
    const sessionId = this.id ?? "";

    this.#gateway.emit("sessionInvalidate", {
      timestamp: new Date().toISOString(),
      sessionId,
      resumable,
      reason,
    });

    this.resumable = resumable;

    if (!resumable) {
      this.destroy();
    }
  }

  /**
   * Completely destroys current session and resets all state.
   * Prepares manager for fresh connection.
   *
   * @example
   * ```typescript
   * session.destroy();
   * // Manager is now ready for fresh connection
   * ```
   *
   * @public
   */
  destroy(): void {
    this.id = null;
    this.resumeUrl = null;
    this.sequence = 0;
    this.readyAt = 0;
    this.userId = null;
    this.guildCount = 0;
    this.resumable = false;
  }

  /**
   * Prepares session data for resuming disconnected session.
   * Creates properly formatted resume payload for Discord.
   *
   * @param token - Bot token for authentication during resume
   * @returns Formatted resume payload for Discord's Gateway
   *
   * @throws {Error} If session cannot be resumed
   *
   * @example
   * ```typescript
   * const resumeData = session.getResumeData("Bot TOKEN");
   * gateway.send(GatewayOpcodes.Resume, resumeData);
   * ```
   *
   * @public
   */
  getResumeData(token: string): ResumeEntity {
    if (!this.canResume) {
      throw new Error("Session cannot be resumed");
    }

    return {
      token,
      session_id: this.id as string,
      seq: this.sequence,
    };
  }

  /**
   * Updates guild count for this session.
   * Used for monitoring and shard management.
   *
   * @param count - New guild count for this session
   *
   * @example
   * ```typescript
   * session.updateGuildCount(150);
   * ```
   *
   * @public
   */
  updateGuildCount(count: number): void {
    this.guildCount = count;
  }

  /**
   * Marks session as non-resumable.
   * Used when Discord indicates session cannot be resumed.
   *
   * @example
   * ```typescript
   * session.markNonResumable();
   * // Future disconnections will require fresh connection
   * ```
   *
   * @public
   */
  markNonResumable(): void {
    this.resumable = false;
  }
}
