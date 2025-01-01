import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { GuildSchema } from "./guild.entity.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object}
 */
export const GuildTemplateSchema = z
  .object({
    code: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    usage_count: z.number().int(),
    creator_id: SnowflakeSchema,
    creator: UserSchema,
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    source_guild_id: SnowflakeSchema,
    serialized_source_guild: GuildSchema.partial(),
    is_dirty: z.boolean().nullable(),
  })
  .strict();

export type GuildTemplateEntity = z.infer<typeof GuildTemplateSchema>;
