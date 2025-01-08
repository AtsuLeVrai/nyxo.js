import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-guild-members-request-guild-members-structure}
 */
export const RequestGuildMembersEntity = z
  .object({
    guild_id: Snowflake,
    query: z.string().optional(),
    limit: z.number().int(),
    presences: z.boolean().optional(),
    user_ids: z.union([Snowflake, z.array(Snowflake)]).optional(),
    nonce: z.string().optional(),
  })
  .strict();

export type RequestGuildMembersEntity = z.infer<
  typeof RequestGuildMembersEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-soundboard-sounds-request-soundboard-sounds-structure}
 */
export const RequestSoundboardSoundsEntity = z
  .object({
    guild_ids: z.array(Snowflake),
  })
  .strict();

export type RequestSoundboardSoundsEntity = z.infer<
  typeof RequestSoundboardSoundsEntity
>;
