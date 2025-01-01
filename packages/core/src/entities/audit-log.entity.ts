import { z } from "zod";
import { SnowflakeSchema } from "../managers/index.js";
import { ApplicationCommandSchema } from "./application-commands.entity.js";
import { AutoModerationRuleSchema } from "./auto-moderation.entity.js";
import { AnyThreadChannelSchema } from "./channel.entity.js";
import { IntegrationSchema } from "./guild.entity.js";
import { GuildScheduledEventSchema } from "./scheduled-event.entity.js";
import { UserSchema } from "./user.entity.js";
import { WebhookSchema } from "./webhook.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export const AuditLogOverwriteType = {
  role: "0",
  member: "1",
} as const;

export type AuditLogOverwriteType =
  (typeof AuditLogOverwriteType)[keyof typeof AuditLogOverwriteType];

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object}
 */
export const AuditLogChangeSchema = z
  .object({
    key: z.string(),
    new_value: z.unknown().optional(),
    old_value: z.unknown().optional(),
  })
  .strict();

export type AuditLogChangeEntity = z.infer<typeof AuditLogChangeSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export const AuditLogCommandPermissionChangeSchema = z
  .object({
    key: SnowflakeSchema,
    old_value: z.record(z.unknown()),
    new_value: z.record(z.unknown()),
  })
  .strict();

export type AuditLogCommandPermissionChangeEntity = z.infer<
  typeof AuditLogCommandPermissionChangeSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-change-object-audit-log-change-exceptions}
 */
export const AuditLogRoleChangeSchema = z
  .object({
    key: z.union([z.literal("$add"), z.literal("$remove")]),
    new_value: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
  })
  .strict();

export type AuditLogRoleChangeEntity = z.infer<typeof AuditLogRoleChangeSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-optional-audit-entry-info}
 */
export const AuditLogEntryInfoSchema = z
  .object({
    application_id: SnowflakeSchema.optional(),
    auto_moderation_rule_name: z.string().optional(),
    auto_moderation_rule_trigger_type: z.string().optional(),
    channel_id: SnowflakeSchema.optional(),
    count: z.string().optional(),
    delete_member_days: z.string().optional(),
    id: SnowflakeSchema.optional(),
    members_removed: z.string().optional(),
    message_id: SnowflakeSchema.optional(),
    role_name: z.string().optional(),
    type: z.nativeEnum(AuditLogOverwriteType).optional(),
    integration_type: z.string().optional(),
  })
  .strict();

export type AuditLogEntryInfoEntity = z.infer<typeof AuditLogEntryInfoSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object-audit-log-events}
 */
export const AuditLogEvent = {
  guildUpdate: 1,
  channelCreate: 10,
  channelUpdate: 11,
  channelDelete: 12,
  channelOverwriteCreate: 13,
  channelOverwriteUpdate: 14,
  channelOverwriteDelete: 15,
  memberKick: 20,
  memberPrune: 21,
  memberBanAdd: 22,
  memberBanRemove: 23,
  memberUpdate: 24,
  memberRoleUpdate: 25,
  memberMove: 26,
  memberDisconnect: 27,
  botAdd: 28,
  roleCreate: 30,
  roleUpdate: 31,
  roleDelete: 32,
  inviteCreate: 40,
  inviteUpdate: 41,
  inviteDelete: 42,
  webhookCreate: 50,
  webhookUpdate: 51,
  webhookDelete: 52,
  emojiCreate: 60,
  emojiUpdate: 61,
  emojiDelete: 62,
  messageDelete: 72,
  messageBulkDelete: 73,
  messagePin: 74,
  messageUnpin: 75,
  integrationCreate: 80,
  integrationUpdate: 81,
  integrationDelete: 82,
  stageInstanceCreate: 83,
  stageInstanceUpdate: 84,
  stageInstanceDelete: 85,
  stickerCreate: 90,
  stickerUpdate: 91,
  stickerDelete: 92,
  guildScheduledEventCreate: 100,
  guildScheduledEventUpdate: 101,
  guildScheduledEventDelete: 102,
  threadCreate: 110,
  threadUpdate: 111,
  threadDelete: 112,
  applicationCommandPermissionUpdate: 121,
  soundboardSoundCreate: 130,
  soundboardSoundUpdate: 131,
  soundboardSoundDelete: 132,
  autoModerationRuleCreate: 140,
  autoModerationRuleUpdate: 141,
  autoModerationRuleDelete: 142,
  autoModerationBlockMessage: 143,
  autoModerationFlagToChannel: 144,
  autoModerationUserCommunicationDisabled: 145,
  creatorMonetizationRequestCreated: 150,
  creatorMonetizationTermsAccepted: 151,
  onboardingPromptCreate: 163,
  onboardingPromptUpdate: 164,
  onboardingPromptDelete: 165,
  onboardingCreate: 166,
  onboardingUpdate: 167,
  homeSettingsCreate: 190,
  homeSettingsUpdate: 191,
} as const;

export type AuditLogEvent = (typeof AuditLogEvent)[keyof typeof AuditLogEvent];

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-entry-object}
 */
export const AuditLogEntrySchema = z
  .object({
    target_id: z.string().nullable(),
    changes: z
      .union([
        z.array(AuditLogChangeSchema),
        z.array(AuditLogCommandPermissionChangeSchema),
        z.array(AuditLogRoleChangeSchema),
      ])
      .optional(),
    user_id: SnowflakeSchema.nullable(),
    id: SnowflakeSchema,
    action_type: z.nativeEnum(AuditLogEvent),
    options: AuditLogEntryInfoSchema.optional(),
    reason: z.string().optional(),
  })
  .strict();

export type AuditLogEntryEntity = z.infer<typeof AuditLogEntrySchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/audit-log#audit-log-object}
 */
export const AuditLogSchema = z
  .object({
    application_commands: z.array(ApplicationCommandSchema),
    audit_log_entries: z.array(AuditLogEntrySchema),
    auto_moderation_rules: z.array(AutoModerationRuleSchema),
    guild_scheduled_events: z.array(GuildScheduledEventSchema),
    integrations: z.array(IntegrationSchema.partial()),
    threads: z.array(AnyThreadChannelSchema),
    users: z.array(UserSchema),
    webhooks: z.array(WebhookSchema),
  })
  .strict();

export type AuditLogEntity = z.infer<typeof AuditLogSchema>;
