import type { Gateway } from "../core/index.js";
import type { CompressionType, EncodingType } from "../services/index.js";
import type { ReadyEntity, ResumeEntity } from "../types/index.js";

/**
 * Manages Discord Gateway session state and lifecycle
 *
 * The SessionManager is a critical component that maintains the connection state
 * between your application and Discord's Gateway WebSocket. It handles all aspects
 * of session management including establishment, resumption, and invalidation.
 *
 * Key responsibilities:
 * - **Session Tracking**: Maintains session ID, resume URL, and sequence numbers
 * - **Session Resumption**: Enables reconnecting to existing sessions to avoid re-downloading guild data
 * - **State Management**: Tracks session health, user information, and guild counts
 * - **Event Coordination**: Emits session lifecycle events for monitoring and debugging
 * - **Metrics Collection**: Provides session uptime and health statistics
 *
 * ## Session Lifecycle
 *
 * 1. **Fresh Session**: Initial connection with no prior state
 * 2. **Ready Session**: Received READY event, session is fully operational
 * 3. **Active Session**: Can send/receive events normally
 * 4. **Resumable Session**: Can be resumed if connection drops
 * 5. **Invalid Session**: Must be terminated and recreated
 *
 * ## Performance Considerations
 *
 * Session resumption significantly reduces connection time and server load:
 * - Fresh connection: ~2-5 seconds with full guild data download
 * - Session resumption: ~200-500ms with only missed events
 * - Bandwidth savings: Up to 95% reduction during reconnection
 *
 * The manager automatically tracks sequence numbers to ensure no events are missed
 * during disconnections and properly handles Discord's session invalidation scenarios.
 *
 * @see {@link https://discord.com/developers/docs/events/gateway#sessions}
 * @see {@link https://discord.com/developers/docs/events/gateway#resume}
 */
export class SessionManager {
  /**
   * Session ID assigned by Discord for this connection
   *
   * This unique identifier is provided by Discord in the READY event and is required
   * for session resumption. The session ID remains valid until Discord invalidates
   * the session (typically due to extended disconnection or server maintenance).
   *
   * A null value indicates no active session or a fresh connection state.
   */
  id: string | null = null;

  /**
   * URL for resuming the WebSocket connection
   *
   * Discord provides this URL in the READY event to specify where session resumption
   * should be attempted. This URL is typically different from the initial connection
   * URL and is optimized for the current session's geographic location.
   *
   * Using the correct resume URL ensures optimal performance and reduces the likelihood
   * of resume failures due to server routing issues.
   */
  resumeUrl: string | null = null;

  /**
   * Last received sequence number from Discord
   *
   * Discord assigns sequential numbers to all events sent to clients. This sequence
   * number is crucial for session resumption as it tells Discord which events the
   * client has already received, allowing Discord to send only missed events.
   *
   * The sequence number should be included in heartbeats and resume attempts to
   * maintain synchronization with Discord's event stream.
   */
  sequence = 0;

  /**
   * Timestamp when the session became ready (in milliseconds since epoch)
   *
   * This timestamp is set when the READY event is received and the session becomes
   * fully operational. It's used to calculate session uptime and can help with
   * debugging connection issues or performance monitoring.
   *
   * A null value indicates the session has never been ready or has been reset.
   */
  readyAt: number | null = null;

  /**
   * User ID of the bot/application associated with this session
   *
   * This is the unique Discord user ID for the bot or user account that established
   * the session. It's extracted from the user object in the READY event and can be
   * useful for logging, metrics, or multi-bot applications.
   *
   * The user ID remains constant for the lifetime of the bot token.
   */
  userId: string | null = null;

  /**
   * Total number of guilds (servers) available to this session
   *
   * This count represents the number of guilds the bot has access to and is set
   * during the READY event. It's useful for monitoring bot growth, calculating
   * memory requirements, or implementing shard distribution logic.
   *
   * For large bots (2500+ guilds), this will be the partial guild count as Discord
   * sends guild data in chunks during the ready sequence.
   */
  guildCount = 0;

  /**
   * Whether this session can be resumed if the connection drops
   *
   * Session resumption allows reconnecting to an existing session without
   * re-downloading all guild data. This flag is set to true when a session
   * is successfully established and set to false when Discord invalidates
   * the session.
   *
   * Common reasons for non-resumable sessions:
   * - Session has been offline too long (>24 hours typically)
   * - Discord server maintenance
   * - Invalid sequence number
   * - Authentication issues
   */
  resumable = false;

  /**
   * Gateway instance that owns and manages this session
   *
   * Reference to the parent Gateway instance that created this SessionManager.
   * Used for emitting session events and coordinating with other Gateway components
   * like the heartbeat manager and message handlers.
   *
   * @internal
   */
  readonly #gateway: Gateway;

  /**
   * Creates a new SessionManager instance
   *
   * The SessionManager starts in a fresh state with no active session data.
   * All session properties are reset to their initial values and the manager
   * is ready to handle a new connection.
   *
   * @param gateway - The Gateway instance that will own this session manager
   */
  constructor(gateway: Gateway) {
    this.#gateway = gateway;
  }

  /**
   * Gets the session uptime in milliseconds
   *
   * Calculates how long the current session has been active since the READY
   * event was received. This is useful for monitoring session stability,
   * debugging connection issues, or displaying uptime statistics.
   *
   * For sessions that have never been ready, this returns 0.
   *
   * @returns The uptime in milliseconds, or 0 if the session was never ready
   */
  get uptime(): number {
    return this.readyAt ? Date.now() - this.readyAt : 0;
  }

  /**
   * Checks if the session is active and ready to handle events
   *
   * An active session has both a valid session ID and has received the READY
   * event from Discord. Only active sessions can send and receive Gateway events.
   *
   * This is the primary indicator that the session is fully operational and
   * ready for normal Discord API operations.
   *
   * @returns True if the session is active and ready, false otherwise
   */
  get isActive(): boolean {
    return this.id !== null && this.readyAt !== null;
  }

  /**
   * Checks if the session can be resumed after a disconnection
   *
   * A session can be resumed if it has a valid session ID, is marked as resumable,
   * and has received at least one event (sequence > 0). Meeting all these conditions
   * allows attempting session resumption instead of establishing a fresh connection.
   *
   * Resumption is significantly faster than fresh connections and reduces server load.
   *
   * @returns True if the session can be resumed, false if a fresh connection is needed
   */
  get canResume(): boolean {
    return this.resumable && this.id !== null && this.sequence > 0;
  }

  /**
   * Checks if this is a fresh session that has never been ready
   *
   * A fresh session is one that has not yet received the READY event from Discord.
   * This typically occurs during initial connection before the session is fully
   * established.
   *
   * Fresh sessions cannot be resumed and require a complete connection handshake.
   *
   * @returns True if this is a fresh session, false if it has been ready before
   */
  get isFresh(): boolean {
    return this.readyAt === null;
  }

  /**
   * Updates the sequence number from a received Gateway payload
   *
   * Discord includes a sequence number in most Gateway events to maintain ordering
   * and enable proper session resumption. This method should be called for every
   * received event that includes a sequence number.
   *
   * The sequence number should only increase, so this method ignores updates with
   * lower values to prevent race conditions or out-of-order processing.
   *
   * When the sequence is updated, a 'sequenceUpdate' event is emitted to notify
   * other components (like the heartbeat manager) of the change.
   *
   * @param sequence - The sequence number from the received payload
   */
  updateSequence(sequence: number): void {
    if (sequence > this.sequence) {
      this.sequence = sequence;
      this.#gateway.emit("sequenceUpdate", sequence);
    }
  }

  /**
   * Initializes a new session with data from Discord's READY event
   *
   * This method processes the READY event payload to establish a new active session.
   * It extracts essential session information including the session ID, resume URL,
   * user details, and guild information.
   *
   * The method also emits a 'sessionStart' event with comprehensive session details
   * for monitoring and debugging purposes. This event includes encoding/compression
   * information and connection metadata.
   *
   * After calling this method, the session becomes active and resumable, and normal
   * Gateway operations can begin.
   *
   * @param data - The READY event data from Discord containing session information
   * @param encoding - The encoding type used for this session (json or etf)
   * @param compression - The compression type used, if any (zlib-stream, zstd-stream, or null)
   */
  initializeSession(
    data: ReadyEntity,
    encoding: EncodingType,
    compression?: CompressionType | null,
  ): void {
    const now = Date.now();

    // Extract and store session information from the READY event
    this.id = data.session_id;
    this.resumeUrl = data.resume_gateway_url;
    this.readyAt = now;
    this.userId = data.user.id;
    this.guildCount = data.guilds.length;
    this.resumable = true;

    // Emit comprehensive session start event for monitoring
    this.#gateway.emit("sessionStart", {
      timestamp: new Date().toISOString(),
      sessionId: data.session_id,
      resumeUrl: data.resume_gateway_url,
      userId: data.user.id,
      guildCount: data.guilds.length,
      encoding: encoding,
      compression: compression,
      shardCount: 0, // Will be set by shard manager if sharding is enabled
    });
  }

  /**
   * Handles successful session resumption after reconnection
   *
   * This method should be called when Discord successfully resumes an existing session
   * (typically after receiving a RESUMED event). It updates the session state to reflect
   * that the connection is active again and emits appropriate events.
   *
   * Session resumption is significantly faster than establishing a fresh connection
   * because Discord only sends events that were missed during the disconnection period.
   *
   * The method updates the ready timestamp for accurate uptime calculation and ensures
   * the session remains marked as resumable for future disconnections.
   *
   * @throws Error If called when no session ID is available (invalid state)
   */
  resumeSession(): void {
    if (!this.id) {
      throw new Error("Cannot resume session: no session ID available");
    }

    // Update ready timestamp for accurate uptime calculation after resumption
    this.readyAt = Date.now();
    this.resumable = true;

    // Emit session resume event with current metrics
    this.#gateway.emit("sessionResume", {
      timestamp: new Date().toISOString(),
      sessionId: this.id,
      sequence: this.sequence,
      latency: 0, // Will be updated by heartbeat manager when next heartbeat completes
    });
  }

  /**
   * Invalidates the current session based on Discord's instructions
   *
   * This method handles session invalidation scenarios where Discord signals that
   * the current session is no longer valid. This can occur due to various reasons
   * including authentication issues, server maintenance, or extended disconnections.
   *
   * The method emits a 'sessionInvalidate' event before making any state changes,
   * allowing other components to react appropriately. Based on the resumable flag,
   * it either preserves session data for potential resumption or completely destroys
   * the session.
   *
   * Common invalidation scenarios:
   * - Invalid session close code (4004, 4007, 4012, etc.)
   * - Authentication token expired or revoked
   * - Session exceeded maximum offline duration
   * - Discord server maintenance requiring fresh connections
   *
   * @param resumable - Whether the session can potentially be resumed later
   * @param reason - Human-readable reason for the invalidation (for logging/debugging)
   */
  invalidateSession(resumable: boolean, reason: string): void {
    const sessionId = this.id ?? "";

    // Emit invalidation event before clearing session data
    this.#gateway.emit("sessionInvalidate", {
      timestamp: new Date().toISOString(),
      sessionId,
      resumable,
      reason,
    });

    // Update session resumability based on Discord's instructions
    this.resumable = resumable;

    // If the session cannot be resumed, completely destroy all session data
    if (!resumable) {
      this.destroy();
    }
  }

  /**
   * Completely destroys the current session and resets all state
   *
   * This method resets the SessionManager to its initial state, clearing all
   * session-related data including the session ID, resume URL, sequence number,
   * and user information. After calling this method, the manager is ready to
   * handle a fresh connection.
   *
   * This is typically called when:
   * - Discord invalidates a session that cannot be resumed
   * - Explicitly starting a fresh connection
   * - Cleaning up before application shutdown
   * - Resetting state after unrecoverable errors
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
   * Prepares session data required for resuming a disconnected session
   *
   * This method creates a properly formatted resume payload that can be sent to
   * Discord to resume an existing session. The payload includes the bot token,
   * session ID, and last received sequence number.
   *
   * Discord uses this information to determine what events need to be resent to
   * bring the client back up to date. Only events with sequence numbers greater
   * than the provided sequence will be sent.
   *
   * @param token - The bot token for authentication during resume
   * @returns A properly formatted resume payload for Discord's Gateway
   * @throws Error If the session cannot be resumed (invalid state)
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
   * Updates the guild count for this session
   *
   * This method allows updating the guild count after the initial session
   * establishment. This is particularly useful for:
   * - Shard managers that need to track guild distribution
   * - Monitoring bot growth over time
   * - Updating counts after guild create/delete events
   *
   * The guild count is primarily used for informational and monitoring purposes
   * and doesn't affect core session functionality.
   *
   * @param count - The new guild count for this session
   */
  updateGuildCount(count: number): void {
    this.guildCount = count;
  }

  /**
   * Marks the session as non-resumable
   *
   * This method explicitly marks the current session as non-resumable, typically
   * in response to specific disconnect codes from Discord that indicate the session
   * cannot be resumed (such as authentication failures or invalid session states).
   *
   * After calling this method, any future disconnection will require establishing
   * a completely fresh connection rather than attempting to resume the current session.
   *
   * Common scenarios for non-resumable sessions:
   * - Close code 4004: Authentication failed
   * - Close code 4007: Invalid sequence number
   * - Close code 4012: Invalid API version
   */
  markNonResumable(): void {
    this.resumable = false;
  }
}
