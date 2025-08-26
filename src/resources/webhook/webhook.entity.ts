import type { StripNull } from "../../utils/index.js";
import type { AnyChannelEntity } from "../channel/index.js";
import type { GuildEntity } from "../guild/index.js";
import type { UserEntity } from "../user/index.js";

export enum WebhookType {
  Incoming = 1,
  ChannelFollower = 2,
  Application = 3,
}

export interface WebhookEntity {
  id: string;
  type: WebhookType;
  guild_id?: string | null;
  channel_id: string | null;
  user?: UserEntity | null;
  name?: string | null;
  avatar?: string | null;
  token?: string;
  application_id: string | null;
  source_guild?: Partial<GuildEntity> | null;
  source_channel?: AnyChannelEntity | null;
  url?: string;
}

export interface IncomingWebhookEntity
  extends Omit<WebhookEntity, "type" | "source_guild" | "source_channel"> {
  type: WebhookType.Incoming;
}

export interface ChannelFollowerWebhookEntity
  extends Omit<WebhookEntity, "type" | "token" | "url"> {
  type: WebhookType.ChannelFollower;
  guild_id: string;
  channel_id: string;
}

export interface ApplicationWebhookEntity extends Pick<WebhookEntity, "id" | "name" | "avatar"> {
  type: WebhookType.Application;
  application_id: string;
}

export type AnyWebhookEntity =
  | IncomingWebhookEntity
  | ChannelFollowerWebhookEntity
  | ApplicationWebhookEntity;

export type GatewayWebhooksUpdateEntity = Required<
  StripNull<Pick<Exclude<AnyWebhookEntity, ApplicationWebhookEntity>, "guild_id" | "channel_id">>
>;

export function isValidWebhookName(name: AnyWebhookEntity["name"]): boolean {
  if (!name) {
    return false;
  }

  if (name.toLowerCase().includes("clyde") || name.toLowerCase().includes("discord")) {
    return false;
  }

  return !(name.length === 0 || name.length > 80);
}
