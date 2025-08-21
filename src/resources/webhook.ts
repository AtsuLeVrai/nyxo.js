import type { Snowflake } from "../common/index.js";
import type { AnyChannelObject } from "./channel.js";
import type { GuildObject } from "./guild.js";
import type { UserObject } from "./user.js";

export enum WebhookType {
  Incoming = 1,
  ChannelFollower = 2,
  Application = 3,
}

export interface WebhookObject {
  id: Snowflake;
  type: WebhookType;
  guild_id?: Snowflake | null;
  channel_id: Snowflake | null;
  user?: UserObject;
  name: string | null;
  avatar: string | null;
  token?: string;
  application_id: Snowflake | null;
  source_guild?: Partial<GuildObject>;
  source_channel?: Partial<AnyChannelObject>;
  url?: string;
}
