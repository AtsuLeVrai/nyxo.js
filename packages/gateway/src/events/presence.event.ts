import { SnowflakeSchema, UserSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-buttons}
 */
export const ActivityButtonsSchema = z
  .object({
    label: z.string(),
    url: z.string().url(),
  })
  .strict();

export type ActivityButtonsEntity = z.infer<typeof ActivityButtonsSchema>;

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
export const ActivitySecretsSchema = z
  .object({
    join: z.string().optional(),
    spectate: z.string().optional(),
    match: z.string().optional(),
  })
  .strict();

export type ActivitySecretsEntity = z.infer<typeof ActivitySecretsSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-asset-image}
 */
export const ActivityAssetImageSchema = z
  .object({
    large_text: z.string().optional(),
    large_image: z.string().optional(),
    small_text: z.string().optional(),
    small_image: z.string().optional(),
  })
  .strict();

export type ActivityAssetImageEntity = z.infer<typeof ActivityAssetImageSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-party}
 */
export const ActivityPartySchema = z
  .object({
    id: z.string().optional(),
    size: z.tuple([z.number(), z.number()]).optional(),
  })
  .strict();

export type ActivityPartyEntity = z.infer<typeof ActivityPartySchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-emoji}
 */
export const ActivityEmojiSchema = z
  .object({
    name: z.string(),
    id: SnowflakeSchema.optional(),
    animated: z.boolean().optional(),
  })
  .strict();

export type ActivityEmojiEntity = z.infer<typeof ActivityEmojiSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#activity-object-activity-timestamps}
 */
export const ActivityTimestampsSchema = z
  .object({
    start: z.number().int().optional(),
    end: z.number().int().optional(),
  })
  .strict();

export type ActivityTimestampsEntity = z.infer<typeof ActivityTimestampsSchema>;

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
export const ActivitySchema = z
  .object({
    name: z.string(),
    type: z.nativeEnum(ActivityType),
    url: z.string().nullish(),
    created_at: z.number().int(),
    timestamps: ActivityTimestampsSchema.optional(),
    application_id: SnowflakeSchema.optional(),
    details: z.string().nullish(),
    state: z.string().nullish(),
    emoji: ActivityEmojiSchema.nullish(),
    party: ActivityPartySchema.optional(),
    assets: ActivityAssetImageSchema.optional(),
    secrets: ActivitySecretsSchema.optional(),
    instance: z.boolean().optional(),
    flags: z.nativeEnum(ActivityFlags).optional(),
    buttons: z.array(ActivityButtonsSchema).optional(),
  })
  .strict();

export type ActivityEntity = z.infer<typeof ActivitySchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#client-status-object}
 */
export const ClientStatusSchema = z
  .object({
    desktop: z.string().optional(),
    mobile: z.string().optional(),
    web: z.string().optional(),
  })
  .strict();

export type ClientStatusEntity = z.infer<typeof ClientStatusSchema>;

/**
 * @see {@link https://discord.com/developers/docs/events/gateway-events#presence-update-presence-update-event-fields}
 */
export const PresenceSchema = z
  .object({
    user: UserSchema,
    guild_id: SnowflakeSchema,
    status: z.string(),
    activities: z.array(ActivitySchema),
    client_status: ClientStatusSchema,
  })
  .strict();

export type PresenceEntity = z.infer<typeof PresenceSchema>;
