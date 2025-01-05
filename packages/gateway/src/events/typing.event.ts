import { GuildMemberSchema, SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#typing-start-typing-start-event-fields}
 */
export const TypingSchema = z
  .object({
    channel_id: SnowflakeSchema,
    guild_id: SnowflakeSchema.optional(),
    user_id: SnowflakeSchema,
    timestamp: z.number().int(),
    member: GuildMemberSchema.optional(),
  })
  .strict();

export type TypingEntity = z.infer<typeof TypingSchema>;
