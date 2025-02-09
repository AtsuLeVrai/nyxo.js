import { z } from "zod";

const RECONNECTION_DEFAULTS = {
  BACKOFF_SCHEDULE: [1000, 5000, 10000] as number[],
} as const;

export const ReconnectionOptions = z
  .object({
    backoffSchedule: z
      .array(z.number().positive())
      .default(RECONNECTION_DEFAULTS.BACKOFF_SCHEDULE),
  })
  .strict()
  .readonly();

export type ReconnectionOptions = z.infer<typeof ReconnectionOptions>;
