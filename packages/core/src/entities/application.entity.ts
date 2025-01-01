import { z } from "zod";
import { OAuth2Scope } from "../enums/index.js";
import { SnowflakeSchema } from "../managers/index.js";
import { GuildSchema } from "./guild.entity.js";
import { TeamSchema } from "./team.entity.js";
import { UserSchema } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure}
 */
export const InstallParamsSchema = z
  .object({
    scopes: z.array(z.nativeEnum(OAuth2Scope)),
    permissions: z.string(),
  })
  .strict();

export type InstallParamsEntity = z.infer<typeof InstallParamsSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags}
 */
export const ApplicationFlags = {
  applicationAutoModerationRuleCreateBadge: 1 << 6,
  gatewayPresence: 1 << 12,
  gatewayPresenceLimited: 1 << 13,
  gatewayGuildMembers: 1 << 14,
  gatewayGuildMembersLimited: 1 << 15,
  verificationPendingGuildLimit: 1 << 16,
  embedded: 1 << 17,
  gatewayMessageContent: 1 << 18,
  gatewayMessageContentLimited: 1 << 19,
  applicationCommandBadge: 1 << 23,
} as const;

export type ApplicationFlags =
  (typeof ApplicationFlags)[keyof typeof ApplicationFlags];

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-event-webhook-status}
 */
export const ApplicationEventWebhookStatus = {
  disabled: 1,
  enabled: 2,
  disabledByDiscord: 3,
} as const;

export type ApplicationEventWebhookStatus =
  (typeof ApplicationEventWebhookStatus)[keyof typeof ApplicationEventWebhookStatus];

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object}
 */
export const ApplicationIntegrationTypeConfigurationSchema = z
  .object({
    oauth2_install_params: InstallParamsSchema.optional(),
  })
  .strict();

export type ApplicationIntegrationTypeConfigurationEntity = z.infer<
  typeof ApplicationIntegrationTypeConfigurationSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types}
 */
export const ApplicationIntegrationType = {
  guildInstall: 0,
  userInstall: 1,
} as const;

export type ApplicationIntegrationType =
  (typeof ApplicationIntegrationType)[keyof typeof ApplicationIntegrationType];

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-structure}
 */
export const ApplicationSchema = z
  .object({
    id: SnowflakeSchema,
    name: z.string(),
    icon: z.string().nullable(),
    description: z.string(),
    rpc_origins: z.array(z.string()).optional(),
    bot_public: z.boolean(),
    bot_require_code_grant: z.boolean(),
    bot: UserSchema.optional(),
    terms_of_service_url: z.string().url().optional(),
    privacy_policy_url: z.string().url().optional(),
    owner: UserSchema.optional(),
    verify_key: z.string(),
    team: TeamSchema.nullable(),
    guild_id: SnowflakeSchema.optional(),
    guild: GuildSchema.partial().optional(),
    primary_sku_id: SnowflakeSchema.optional(),
    slug: z.string().url().optional(),
    cover_image: z.string().optional(),
    flags: z.nativeEnum(ApplicationFlags),
    approximate_guild_count: z.number().int().optional(),
    approximate_user_install_count: z.number().int().optional(),
    redirect_uris: z.array(z.string().url()).optional(),
    interactions_endpoint_url: z.string().url().nullish(),
    role_connections_verification_url: z.string().url().nullish(),
    event_webhooks_url: z.string().url(),
    event_webhooks_status: z.nativeEnum(ApplicationEventWebhookStatus),
    event_webhooks_types: z.array(z.string()).optional(),
    tags: z.array(z.string()).max(5).optional(),
    install_params: InstallParamsSchema.optional(),
    integration_types_config: z.record(
      z.nativeEnum(ApplicationIntegrationType),
      ApplicationIntegrationTypeConfigurationSchema,
    ),
    custom_install_url: z.string().url().optional(),
  })
  .strict();

export type ApplicationEntity = z.infer<typeof ApplicationSchema>;
