import type { AnyChannelEntity } from "../channel/index.js";
import type { GuildEntity } from "../guild/index.js";
import type { UserEntity } from "../user/index.js";

export enum WebhookType {
  Incoming = 1,
  ChannelFollower = 2,
  Application = 3,
}

export function isValidWebhookName(name?: string | null): boolean {
  if (!name) {
    return false;
  }
  if (name.toLowerCase().includes("clyde") || name.toLowerCase().includes("discord")) {
    return false;
  }

  return !(name.length === 0 || name.length > 80);
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

export interface WebhooksUpdateEntity {
  guild_id: string;
  channel_id: string;
}
