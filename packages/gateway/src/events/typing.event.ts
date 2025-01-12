import { GuildMemberEntity, Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#typing-start-typing-start-event-fields}
 */
export const TypingEntity = z.object({
  channel_id: Snowflake,
  guild_id: Snowflake.optional(),
  user_id: Snowflake,
  timestamp: z.number().int(),
  member: GuildMemberEntity.optional(),
});

export type TypingEntity = z.infer<typeof TypingEntity>;
