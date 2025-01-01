import { z } from "zod";
import { type Snowflake, SnowflakeSchema } from "../managers/index.js";
import { type AnyChannelEntity, AnyChannelSchema } from "./channel.entity.js";
import { type GuildEntity, GuildSchema } from "./guild.entity.js";
import { type UserEntity, UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
 */
export const WebhookType = {
  incoming: 1,
  channelFollower: 2,
  application: 3,
} as const;

export type WebhookType = (typeof WebhookType)[keyof typeof WebhookType];

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure}
 */
export interface WebhookEntity {
  id: Snowflake;
  type: WebhookType;
  guild_id?: Snowflake | null;
  channel_id: Snowflake | null;
  user?: UserEntity;
  name: string | null;
  avatar: string | null;
  token?: string;
  application_id: Snowflake | null;
  source_guild?: Partial<GuildEntity>;
  source_channel?: Partial<AnyChannelEntity>;
  url?: string;
}

export const WebhookSchema = z
  .object({
    id: SnowflakeSchema,
    type: z.nativeEnum(WebhookType),
    guild_id: SnowflakeSchema.nullish(),
    channel_id: SnowflakeSchema.nullish(),
    user: UserSchema.optional(),
    name: z.string().nullable(),
    avatar: z.string().nullable(),
    token: z.string().optional(),
    application_id: SnowflakeSchema.nullable(),
    source_guild: GuildSchema.partial().optional(),
    source_channel: AnyChannelSchema.optional(),
    url: z.string().url().optional(),
  })
  .strict();
