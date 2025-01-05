import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#resume-resume-structure}
 */
export const ResumeSchema = z
  .object({
    token: z.string(),
    session_id: z.string(),
    seq: z.number().int(),
  })
  .strict();

export type ResumeEntity = z.infer<typeof ResumeSchema>;
