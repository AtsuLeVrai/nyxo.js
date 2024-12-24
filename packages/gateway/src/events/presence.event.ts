import type { Integer, Snowflake, UserEntity } from "@nyxjs/core";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-buttons}
 */
export interface ActivityButtonsEntity {
  label: string;
  url: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-flags}
 */
export enum ActivityFlags {
  Instance = 1 << 0,
  Join = 1 << 1,
  Spectate = 1 << 2,
  JoinRequest = 1 << 3,
  Sync = 1 << 4,
  Play = 1 << 5,
  PartyPrivacyFriends = 1 << 6,
  PartyPrivacyVoiceChannel = 1 << 7,
  Embedded = 1 << 8,
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-secrets}
 */
export interface ActivitySecretsEntity {
  join?: string;
  spectate?: string;
  match?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-asset-image}
 */
export interface ActivityAssetImageEntity {
  large_text?: string;
  large_image?: string;
  small_text?: string;
  small_image?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-party}
 */
export interface ActivityPartyEntity {
  id?: string;
  size?: [currentSize: Integer, maxSize: Integer];
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-emoji}
 */
export interface ActivityEmojiEntity {
  name: string;
  id?: Snowflake;
  animated?: boolean;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-timestamps}
 */
export interface ActivityTimestampsEntity {
  start?: Integer;
  end?: Integer;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-types}
 */
export enum ActivityType {
  Game = 0,
  Streaming = 1,
  Listening = 2,
  Watching = 3,
  Custom = 4,
  Competing = 5,
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-structure}
 */
export interface ActivityEntity {
  name: string;
  type: ActivityType;
  url?: string | null;
  created_at: Integer;
  timestamps?: ActivityTimestampsEntity;
  application_id?: Snowflake;
  details?: string | null;
  state?: string | null;
  emoji?: ActivityEmojiEntity | null;
  party?: ActivityPartyEntity;
  assets?: ActivityAssetImageEntity;
  secrets?: ActivitySecretsEntity;
  instance?: boolean;
  flags?: ActivityFlags;
  buttons?: ActivityButtonsEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#client-status-object}
 */
export interface ClientStatusEntity {
  desktop?: string;
  mobile?: string;
  web?: string;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update-presence-update-event-fields}
 */
export interface PresenceEntity {
  user: UserEntity;
  guild_id: Snowflake;
  status: string;
  activities: ActivityEntity[];
  client_status: ClientStatusEntity;
}
