import { Snowflake, UserEntity } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-buttons}
 */
export const ActivityButtonsEntity = z.object({
  label: z.string(),
  url: z.string().url(),
});

export type ActivityButtonsEntity = z.infer<typeof ActivityButtonsEntity>;

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
export const ActivitySecretsEntity = z.object({
  join: z.string().optional(),
  spectate: z.string().optional(),
  match: z.string().optional(),
});

export type ActivitySecretsEntity = z.infer<typeof ActivitySecretsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-asset-image}
 */
export const ActivityAssetImageEntity = z.object({
  large_text: z.string().optional(),
  large_image: z.string().optional(),
  small_text: z.string().optional(),
  small_image: z.string().optional(),
});

export type ActivityAssetImageEntity = z.infer<typeof ActivityAssetImageEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-party}
 */
export const ActivityPartyEntity = z.object({
  id: z.string().optional(),
  size: z.tuple([z.number(), z.number()]).optional(),
});

export type ActivityPartyEntity = z.infer<typeof ActivityPartyEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-emoji}
 */
export const ActivityEmojiEntity = z.object({
  name: z.string(),
  id: Snowflake.optional(),
  animated: z.boolean().optional(),
});

export type ActivityEmojiEntity = z.infer<typeof ActivityEmojiEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-timestamps}
 */
export const ActivityTimestampsEntity = z.object({
  start: z.number().int().optional(),
  end: z.number().int().optional(),
});

export type ActivityTimestampsEntity = z.infer<typeof ActivityTimestampsEntity>;

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
export const ActivityEntity = z.object({
  name: z.string(),
  type: z.nativeEnum(ActivityType),
  url: z.string().nullish(),
  created_at: z.union([z.number().int(), z.string()]),
  timestamps: ActivityTimestampsEntity.optional(),
  application_id: Snowflake.optional(),
  details: z.string().nullish(),
  state: z.string().nullish(),
  emoji: ActivityEmojiEntity.nullish(),
  party: ActivityPartyEntity.optional(),
  assets: ActivityAssetImageEntity.optional(),
  secrets: ActivitySecretsEntity.optional(),
  instance: z.boolean().optional(),
  flags: z.nativeEnum(ActivityFlags).optional(),
  buttons: z.array(ActivityButtonsEntity).optional(),
});

export type ActivityEntity = z.infer<typeof ActivityEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#client-status-object}
 */
export const ClientStatusEntity = z.object({
  desktop: z.string().optional(),
  mobile: z.string().optional(),
  web: z.string().optional(),
});

export type ClientStatusEntity = z.infer<typeof ClientStatusEntity>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update-presence-update-event-fields}
 */
export const PresenceEntity = z.object({
  user: UserEntity,
  guild_id: Snowflake,
  status: z.string(),
  activities: z.array(ActivityEntity),
  client_status: ClientStatusEntity,
});

export type PresenceEntity = z.infer<typeof PresenceEntity>;
