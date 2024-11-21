import type { Snowflake } from "../formatting/index.js";
import type { ChannelEntity } from "./channels.js";
import type { GuildEntity } from "./guilds.js";
import type { UserEntity } from "./users.js";

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
  source_channel?: Partial<ChannelEntity>;
  url?: string;
}
