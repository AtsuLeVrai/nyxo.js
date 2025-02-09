import { z } from "zod";

const HEARTBEAT_DEFAULTS = {
  MAX_MISSED_HEARTBEATS: 3,
  MAX_HISTORY_SIZE: 100,
  RECONNECT_DELAY: 1000,
  MIN_INTERVAL: 1,
} as const;

export const HeartbeatOptions = z
  .object({
    maxMissedHeartbeats: z
      .number()
      .int()
      .positive()
      .default(HEARTBEAT_DEFAULTS.MAX_MISSED_HEARTBEATS),
    autoReconnect: z.boolean().default(true),
    maxHistorySize: z
      .number()
      .positive()
      .default(HEARTBEAT_DEFAULTS.MAX_HISTORY_SIZE),
    reconnectDelay: z
      .number()
      .positive()
      .default(HEARTBEAT_DEFAULTS.RECONNECT_DELAY),
    minInterval: z.number().positive().default(HEARTBEAT_DEFAULTS.MIN_INTERVAL),
  })
  .strict()
  .readonly();

export type HeartbeatOptions = z.infer<typeof HeartbeatOptions>;
