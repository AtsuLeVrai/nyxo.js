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

export interface IncomingWebhookObject
  extends Omit<WebhookObject, "type" | "source_guild" | "source_channel"> {
  type: WebhookType.Incoming;
}

export interface ChannelFollowerWebhookObject
  extends Omit<WebhookObject, "type" | "token" | "url"> {
  type: WebhookType.ChannelFollower;
}

export interface ApplicationWebhookObject
  extends Pick<WebhookObject, "id" | "name" | "avatar" | "application_id"> {
  type: WebhookType.Application;
}

export type AnyWebhookObject =
  | IncomingWebhookObject
  | ChannelFollowerWebhookObject
  | ApplicationWebhookObject;
