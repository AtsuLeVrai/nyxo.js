import { z } from "zod";

export const ReconnectionOptions = z
  .object({
    backoffSchedule: z
      .array(z.number().positive())
      .default([1000, 5000, 10000]),
  })
  .strict()
  .readonly();

export type ReconnectionOptions = z.infer<typeof ReconnectionOptions>;
