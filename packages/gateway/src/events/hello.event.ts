import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#hello-hello-structure}
 */
export const HelloSchema = z
  .object({
    heartbeat_interval: z.number().int(),
  })
  .strict();

export type HelloEntity = z.infer<typeof HelloSchema>;
