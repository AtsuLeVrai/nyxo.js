import { z } from "zod";
import { OAuth2Scope } from "../enums/index.js";
import { Snowflake } from "../managers/index.js";
import { GuildEntity } from "./guild.entity.js";
import { TeamEntity } from "./team.entity.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-flags}
 */
export enum ApplicationFlags {
  ApplicationAutoModerationRuleCreateBadge = 1 << 6,
  GatewayPresence = 1 << 12,
  GatewayPresenceLimited = 1 << 13,
  GatewayGuildMembers = 1 << 14,
  GatewayGuildMembersLimited = 1 << 15,
  VerificationPendingGuildLimit = 1 << 16,
  Embedded = 1 << 17,
  GatewayMessageContent = 1 << 18,
  GatewayMessageContentLimited = 1 << 19,
  ApplicationCommandBadge = 1 << 23,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-event-webhook-status}
 */
export enum ApplicationEventWebhookStatus {
  Disabled = 1,
  Enabled = 2,
  DisabledByDiscord = 3,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types}
 */
export enum ApplicationIntegrationType {
  GuildInstall = 0,
  UserInstall = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure}
 */
export const InstallParamsEntity = z.object({
  scopes: z.array(z.nativeEnum(OAuth2Scope)),
  permissions: z.string(),
});

export type InstallParamsEntity = z.infer<typeof InstallParamsEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object}
 */
export const ApplicationIntegrationTypeConfigurationEntity = z.object({
  oauth2_install_params: InstallParamsEntity.optional(),
});

export type ApplicationIntegrationTypeConfigurationEntity = z.infer<
  typeof ApplicationIntegrationTypeConfigurationEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-structure}
 */
export const ApplicationEntity = z.object({
  id: Snowflake,
  name: z.string(),
  icon: z.string().nullable(),
  description: z.string(),
  rpc_origins: z.array(z.string()).optional(),
  bot_public: z.boolean(),
  bot_require_code_grant: z.boolean(),
  bot: UserEntity.optional(),
  terms_of_service_url: z.string().url().optional(),
  privacy_policy_url: z.string().url().optional(),
  owner: UserEntity.optional(),
  verify_key: z.string(),
  team: TeamEntity.nullable(),
  guild_id: Snowflake.optional(),
  guild: GuildEntity.partial().optional(),
  primary_sku_id: Snowflake.optional(),
  slug: z.string().url().optional(),
  cover_image: z.string().optional(),
  flags: z.union([z.nativeEnum(ApplicationFlags), z.number().int()]),
  approximate_guild_count: z.number().int().optional(),
  approximate_user_install_count: z.number().int().optional(),
  redirect_uris: z.array(z.string().url()).optional(),
  interactions_endpoint_url: z.string().url().nullish(),
  role_connections_verification_url: z.string().url().nullish(),
  event_webhooks_url: z.string().url(),
  event_webhooks_status: z.nativeEnum(ApplicationEventWebhookStatus),
  event_webhooks_types: z.array(z.string()).optional(),
  tags: z.array(z.string()).max(5).optional(),
  install_params: InstallParamsEntity.optional(),
  integration_types_config: z.record(
    z.nativeEnum(ApplicationIntegrationType),
    ApplicationIntegrationTypeConfigurationEntity,
  ),
  custom_install_url: z.string().url().optional(),
});

export type ApplicationEntity = z.infer<typeof ApplicationEntity>;
