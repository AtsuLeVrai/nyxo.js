import { z } from "zod";

/**
 * Options for configuring Gateway heartbeat behavior
 *
 * Heartbeats are essential for maintaining the WebSocket connection to Discord's Gateway.
 * They serve as a periodic health check that ensures the connection remains active.
 */
export const HeartbeatOptions = z.object({
  /**
   * Maximum number of consecutive heartbeat failures before triggering a reconnection
   *
   * If this number of heartbeats are missed without acknowledgement, the connection
   * will be considered dead and a reconnection attempt will be initiated.
   */
  maxRetries: z
    .number()
    .int()
    .positive()
    .default(3)
    .describe("Maximum consecutive missed heartbeats before reconnection"),

  /**
   * Whether to automatically attempt reconnection after heartbeat failures
   *
   * When true, the client will automatically attempt to reconnect after
   * reaching the maxRetries limit. When false, the client will simply
   * report the failure but not attempt reconnection.
   */
  autoReconnect: z
    .boolean()
    .default(true)
    .describe("Whether to automatically reconnect after heartbeat failures"),

  /**
   * Maximum number of latency measurements to keep in history
   *
   * Used for calculating average latency over time.
   */
  maxHistorySize: z
    .number()
    .positive()
    .default(100)
    .describe("Maximum number of latency measurements to keep in history"),

  /**
   * Delay in milliseconds before attempting reconnection after heartbeat failure
   *
   * Provides a buffer before reconnection attempts to prevent rapid reconnection cycles.
   */
  reconnectDelay: z
    .number()
    .positive()
    .default(1000)
    .describe("Delay in milliseconds before attempting reconnection"),

  /**
   * Minimum allowed heartbeat interval in milliseconds
   *
   * Safety check to prevent extremely low heartbeat intervals that could
   * cause excessive traffic or resource usage.
   */
  minInterval: z
    .number()
    .positive()
    .default(1)
    .describe("Minimum allowed heartbeat interval in milliseconds"),
});

/**
 * Type definition for HeartbeatOptions
 */
export type HeartbeatOptions = z.infer<typeof HeartbeatOptions>;
