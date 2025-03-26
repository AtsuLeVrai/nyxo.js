import { z } from "zod";

/**
 * Options for configuring health checks for shards
 */
export const ShardHealthCheckOptions = z
  .object({
    /**
     * Interval for health checks in milliseconds
     */
    interval: z.number().int().positive().default(30000),

    /**
     * Threshold for considering a shard "unhealthy" based on latency in milliseconds
     */
    latencyThreshold: z.number().int().positive().default(500),

    /**
     * Threshold for considering a shard "stalled" in milliseconds
     */
    stalledThreshold: z.number().int().positive().default(90000),

    /**
     * Whether to automatically attempt to revive unhealthy shards
     */
    autoRevive: z.boolean().default(true),
  })
  .strict()
  .readonly();

export type ShardHealthCheckOptions = z.infer<typeof ShardHealthCheckOptions>;

/**
 * Options for configuring Gateway sharding behavior
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
     * Whether to force sharding even if not recommended
     *
     * By default, sharding is only enabled when the guild count exceeds the threshold.
     */
    force: z
      .boolean()
      .default(false)
      .describe("Force sharding even if not recommended"),

    /**
     * Health check options for monitoring shard status
     */
    healthCheck: ShardHealthCheckOptions.default({}),
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
  );

/**
 * Type definition for ShardOptions
 */
export type ShardOptions = z.infer<typeof ShardOptions>;
