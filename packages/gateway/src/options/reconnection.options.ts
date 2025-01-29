import { z } from "zod";

const BACKOFF_SCHEDULE = [1000, 5000, 10000];

export const ReconnectionOptions = z
  .object({
    backoffSchedule: z.array(z.number().positive()).default(BACKOFF_SCHEDULE),
  })
  .strict();

export type ReconnectionOptions = z.infer<typeof ReconnectionOptions>;
