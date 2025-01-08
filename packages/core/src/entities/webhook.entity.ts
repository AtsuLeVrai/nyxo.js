import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { AnyChannelEntity } from "./channel.entity.js";
import { GuildEntity } from "./guild.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-types}
 */
export enum WebhookType {
  Incoming = 1,
  ChannelFollower = 2,
  Application = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/webhook#webhook-object-webhook-structure}
 */
export const WebhookEntity = z
  .object({
    id: Snowflake,
    type: z.nativeEnum(WebhookType),
    guild_id: Snowflake.nullish(),
    channel_id: Snowflake.nullish(),
    user: UserEntity.optional(),
    name: z.string().nullable(),
    avatar: z.string().nullable(),
    token: z.string().optional(),
    application_id: Snowflake.nullable(),
    source_guild: GuildEntity.partial().optional(),
    source_channel: AnyChannelEntity.optional(),
    url: z.string().url().optional(),
  })
  .strict();

export type WebhookEntity = z.infer<typeof WebhookEntity>;
