import { z } from "zod";

/**
 * Options for configuring Gateway sharding behavior
 *
 * Sharding is used to distribute the bot's connections across multiple WebSocket
 * connections for scaling and performance.
 */
export const ShardScalingOptions = z
  .object({
    /**
     * Strategy for scaling shards
     *
     * - "balanced": Distributes shards evenly across sessions
     * - "minimal-disruption": Minimizes disruption when scaling up or down
     */
    strategy: z.enum(["balanced", "minimal-disruption"]).default("balanced"),

    /**
     * Whether to wait for all shards to be ready before starting the bot
     *
     * This is useful for ensuring all shards are connected and ready before processing events.
     */
    waitForReady: z.boolean().default(true),

    /**
     * Timeout for waiting for all shards to be ready in milliseconds
     *
     * If all shards are not ready within this time, the bot will start anyway.
     */
    timeout: z.number().int().default(30000),
  })
  .strict()
  .readonly();

export type ShardScalingOptions = z.infer<typeof ShardScalingOptions>;

export const HealthCheckOptions = z
  .object({
    /**
     * Interval for health checks in milliseconds
     *
     * Health checks are used to monitor the bot's status and ensure it's running smoothly.
     */
    interval: z.number().int().positive().default(30000),

    /**
     * Threshold for considering the bot "unhealthy" in milliseconds
     *
     * If the bot does not respond to a health check within this time, it is considered unhealthy.
     */
    latencyThreshold: z.number().int().positive().default(500),

    /**
     * Heartbeat failure threshold before considering the bot "unhealthy"
     */
    heartbeatFailureThreshold: z.number().int().positive().default(3),

    /**
     * Threshold for considering the bot "stalled" in milliseconds
     */
    stalledThreshold: z.number().int().positive().default(90000),

    /**
     * Whether to automatically restart the bot if a health check fails
     */
    autoRevive: z.boolean().default(true),
  })
  .strict()
  .readonly();

export type HealthCheckOptions = z.infer<typeof HealthCheckOptions>;

/**
 * Options for configuring Gateway sharding behavior
 *
 * Sharding is used to distribute the bot's connections across multiple WebSocket
 * connections for scaling and performance.
 */
export const ShardOptions = z
  .object({
    /**
     * Total number of shards to use
     *
     * - When set to a number, uses exactly that many shards
     * - When set to "auto", uses Discord's recommended shard count
     * - When undefined, automatic sharding is determined based on guild count
     */
    totalShards: z
      .union([z.number().int().positive(), z.literal("auto")])
      .optional()
      .describe("Total number of shards to use"),

    /**
     * List of specific shard IDs to spawn
     *
     * When provided, only the specified shards will be spawned.
     * Useful for distributed deployments where different processes handle different shards.
     */
    shardList: z
      .number()
      .int()
      .nonnegative()
      .array()
      .optional()
      .describe("List of specific shard IDs to spawn"),

    /**
     * Delay between spawning each shard in milliseconds
     *
     * Prevents rate limiting during startup when multiple shards need to connect.
     */
    spawnDelay: z
      .number()
      .positive()
      .default(5000)
      .describe("Delay between spawning each shard in milliseconds"),

    /**
     * Threshold for enabling sharding based on guild count
     *
     * When the guild count exceeds this value, sharding will be automatically enabled
     * if it's not explicitly configured.
     */
    largeThreshold: z
      .number()
      .positive()
      .default(2500)
      .describe("Threshold for enabling sharding based on guild count"),

    /**
     * Threshold for treating a bot as "very large" which applies additional scaling optimizations
     *
     * For very large bots, additional validations and optimizations are applied.
     */
    veryLargeThreshold: z
      .number()
      .positive()
      .default(150000)
      .describe("Threshold for treating a bot as 'very large'"),

    /**
     * Minimum session limit to enforce for large bots
     *
     * Ensures enough sessions are allocated for proper functionality of large bots.
     */
    minSessionLimit: z
      .number()
      .positive()
      .default(2000)
      .describe("Minimum session limit to enforce for large bots"),

    /**
     * Number of sessions to allocate per guild (divided by 1000)
     *
     * Used to calculate appropriate session limits for large bots.
     */
    sessionsPerGuilds: z
      .number()
      .positive()
      .default(5)
      .describe("Number of sessions to allocate per 1000 guilds"),

    /**
     * Whether to force sharding even if not recommended
     *
     * By default, sharding is only enabled when the bot is very large or the guild count exceeds the threshold.
     */
    force: z
      .boolean()
      .default(false)
      .optional()
      .describe("Force sharding even if not recommended"),

    /**
     * Scaling options for shards
     *
     * Used to configure scaling behavior for shards
     */
    scaling: ShardScalingOptions.default({}),

    /**
     * Health check options for monitoring bot status
     *
     * Used to configure health checks for monitoring the bot's status and ensuring it's running smoothly.
     */
    healthCheck: HealthCheckOptions.default({}),
  })
  .strict()
  .readonly()
  .refine(
    (data) => {
      if (typeof data.totalShards === "number" && data.shardList) {
        return data.shardList.every(
          (shard) => shard < Number(data.totalShards),
        );
      }
      return true;
    },
    {
      message:
        "Shard list must contain only valid shard IDs for the total shards provided",
      path: ["shardList"],
    },
  )
  .sourceType();

/**
 * Type definition for ShardOptions
 */
export type ShardOptions = z.infer<typeof ShardOptions>;
