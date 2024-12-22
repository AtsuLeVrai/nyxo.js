import type { OAuth2Scope } from "../enums/index.js";
import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../managers/index.js";
import type { GuildEntity } from "./guild.entity.js";
import type { TeamEntity } from "./team.entity.js";
import type { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/application#install-params-object-install-params-structure}
 */
export interface InstallParamsEntity {
  scopes: OAuth2Scope[];
  permissions: string;
}

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
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-type-configuration-object}
 */
export interface ApplicationIntegrationTypeConfigurationEntity {
  oauth2_install_params?: InstallParamsEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-integration-types}
 */
export enum ApplicationIntegrationType {
  GuildInstall = 0,
  UserInstall = 1,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application#application-object-application-structure}
 */
export interface ApplicationEntity {
  id: Snowflake;
  name: string;
  icon: string | null;
  description: string;
  rpc_origins?: string[];
  bot_public: boolean;
  bot_require_code_grant: boolean;
  bot?: Partial<UserEntity>;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  owner?: Partial<UserEntity>;
  verify_key: string;
  team: TeamEntity | null;
  guild_id?: Snowflake;
  guild?: Partial<GuildEntity>;
  primary_sku_id?: Snowflake;
  slug?: string;
  cover_image?: string;
  flags?: ApplicationFlags;
  approximate_guild_count?: Integer;
  approximate_user_install_count?: Integer;
  redirect_uris?: string[];
  interactions_endpoint_url?: string | null;
  role_connections_verification_url?: string | null;
  event_webhooks_url?: string;
  event_webhooks_status: ApplicationEventWebhookStatus;
  event_webhooks_types?: string[];
  tags?: string[];
  install_params?: InstallParamsEntity;
  integration_types_config: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;
  custom_install_url?: string;
}
