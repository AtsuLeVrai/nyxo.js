import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-guild-members-request-guild-members-structure}
 */
export const RequestGuildMembersSchema = z
  .object({
    guild_id: SnowflakeSchema,
    query: z.string().optional(),
    limit: z.number().int(),
    presences: z.boolean().optional(),
    user_ids: z.union([SnowflakeSchema, z.array(SnowflakeSchema)]).optional(),
    nonce: z.string().optional(),
  })
  .strict();

export type RequestGuildMembersEntity = z.infer<
  typeof RequestGuildMembersSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#request-soundboard-sounds-request-soundboard-sounds-structure}
 */
export const RequestSoundboardSoundsSchema = z
  .object({
    guild_ids: z.array(SnowflakeSchema),
  })
  .strict();

export type RequestSoundboardSoundsEntity = z.infer<
  typeof RequestSoundboardSoundsSchema
>;
