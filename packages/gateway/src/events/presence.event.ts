import type { Snowflake, UserEntity } from "@nyxjs/core";

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
export const ActivityFlags = {
  instance: 1 << 0,
  join: 1 << 1,
  spectate: 1 << 2,
  joinRequest: 1 << 3,
  sync: 1 << 4,
  play: 1 << 5,
  partyPrivacyFriends: 1 << 6,
  partyPrivacyVoiceChannel: 1 << 7,
  embedded: 1 << 8,
} as const;

export type ActivityFlags = (typeof ActivityFlags)[keyof typeof ActivityFlags];

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
  size?: [currentSize: number, maxSize: number];
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
  start?: number;
  end?: number;
}

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-types}
 */
export const ActivityType = {
  game: 0,
  streaming: 1,
  listening: 2,
  watching: 3,
  custom: 4,
  competing: 5,
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-structure}
 */
export interface ActivityEntity {
  name: string;
  type: ActivityType;
  url?: string | null;
  created_at: number;
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
