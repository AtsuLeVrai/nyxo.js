import { z } from "zod";

const MAX_MISSED_HEARTBEATS = 3;
const MAX_HISTORY_SIZE = 100;
const RECONNECT_DELAY = 1000;
const MIN_INTERVAL = 1;

export const HeartbeatOptions = z
  .object({
    maxMissedHeartbeats: z
      .number()
      .int()
      .positive()
      .default(MAX_MISSED_HEARTBEATS),
    autoReconnect: z.boolean().default(true),
    maxHistorySize: z.number().positive().default(MAX_HISTORY_SIZE),
    reconnectDelay: z.number().positive().default(RECONNECT_DELAY),
    minInterval: z.number().positive().default(MIN_INTERVAL),
  })
  .strict();

export type HeartbeatOptions = z.infer<typeof HeartbeatOptions>;
