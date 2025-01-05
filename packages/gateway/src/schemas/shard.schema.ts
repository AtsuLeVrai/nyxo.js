import { z } from "zod";
import { ShardStatus } from "../constants/index.js";

export const ShardSessionStatsSchema = z
  .object({
    receivedPackets: z.number().nonnegative(),
    sentPackets: z.number().nonnegative(),
    errors: z.number().nonnegative(),
    zombieConnections: z.number().nonnegative(),
    lastReconnectDuration: z.number().optional(),
    avgHeartbeatLatency: z.number().nonnegative(),
    lastSequenceIndex: z.number().optional(),
    totalGuildMembers: z.number().nonnegative(),
  })
  .strict();

export type ShardSessionStats = z.infer<typeof ShardSessionStatsSchema>;

export const ShardSessionSchema = z
  .object({
    shardId: z.number().nonnegative(),
    numShards: z.number().positive(),
    sessionId: z.string().optional(),
    resumeUrl: z.string().optional(),
    sessionIndex: z.number().optional(),
    status: z.nativeEnum(ShardStatus),
    sequence: z.number().optional(),
    latency: z.number().nonnegative(),
    resumeGatewayUrl: z.string().optional(),
    guildCount: z.number().nonnegative(),
    lastHeartbeatReceived: z.number().optional(),
    lastHeartbeatSent: z.number().optional(),
    lastHeartbeatAck: z.number().optional(),
    connectAttempts: z.number().nonnegative(),
    reconnectAttempts: z.number().nonnegative(),
    largeThreshold: z.number().optional(),
    maxReconnectAttempts: z.number().optional(),
    maxRetries: z.number().optional(),
    connectedAt: z.number().optional(),
    readyAt: z.number().optional(),
    disconnectedAt: z.number().optional(),
    lastResumeAt: z.number().optional(),
    isReady: z.boolean().optional(),
    canResume: z.boolean().optional(),
    isActive: z.boolean().optional(),
    stats: ShardSessionStatsSchema.optional(),
  })
  .strict();

export type ShardSession = z.infer<typeof ShardSessionSchema>;

export const ShardStatsSchema = z
  .object({
    totalShards: z.number().nonnegative(),
    connectedShards: z.number().nonnegative(),
    activeShards: z.number().nonnegative(),
    totalGuilds: z.number().nonnegative(),
    averageLatency: z.number().nonnegative(),
    guildsPerShard: z.number().nonnegative(),
    uptimeMs: z.number().nonnegative(),
    memoryUsage: z.number().nonnegative(),
    status: z.record(z.nativeEnum(ShardStatus), z.number().nonnegative()),
  })
  .strict();

export type ShardStats = z.infer<typeof ShardStatsSchema>;

export const HandoffStrategySchema = z.union([
  z.literal("abort"),
  z.literal("graceful"),
]);

export type HandoffStrategy = z.infer<typeof HandoffStrategySchema>;

export const LoadBalancingSchema = z.union([
  z.literal("none"),
  z.literal("round-robin"),
  z.literal("least-loaded"),
]);

export type LoadBalancing = z.infer<typeof LoadBalancingSchema>;

export const ShardOptionsSchema = z
  .object({
    totalShards: z
      .union([z.number().positive(), z.literal("auto")])
      .default("auto"),
    shardList: z.array(z.number().nonnegative()).default([]),
    spawnTimeout: z.number().positive().default(30000),
    spawnDelay: z.number().nonnegative().default(5000),
    largeThreshold: z.number().positive().default(250),
    maxShardConcurrency: z.number().positive().default(1),
    maxGuildsPerShard: z.number().positive().default(2500),
    shardCount: z.number().positive().default(1),
    monitorEnabled: z.boolean().default(true),
    monitorInterval: z.number().positive().default(30000),
    collectMetrics: z.boolean().default(true),
    maxReconnectAttempts: z.number().nonnegative().default(3),
    reconnectDelay: z.number().nonnegative().default(5000),
    handoffStrategy: HandoffStrategySchema.default("graceful"),
    maxConcurrency: z.number().positive().default(1),
    useOptimalSharding: z.boolean().default(true),
    loadBalancing: LoadBalancingSchema.default("round-robin"),
    preferredGuildIds: z.array(z.string()).default([]),
    validateConfiguration: z.boolean().default(true),
    sessions: z.array(ShardSessionSchema).default([]),
  })
  .strict()
  .refine(
    (data) => {
      if (data.maxConcurrency > 16) {
        return false;
      }
      return true;
    },
    {
      message: "maxConcurrency cannot exceed 16",
      path: ["maxConcurrency"],
    },
  );

export type ShardOptions = z.infer<typeof ShardOptionsSchema>;
