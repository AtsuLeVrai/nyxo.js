import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { GuildEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object}
 */
export const GuildTemplateEntity = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  usage_count: z.number().int(),
  creator_id: Snowflake,
  creator: UserEntity,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  source_guild_id: Snowflake,
  serialized_source_guild: GuildEntity.partial(),
  is_dirty: z.boolean().nullable(),
});

export type GuildTemplateEntity = z.infer<typeof GuildTemplateEntity>;
