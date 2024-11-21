import type { AvailableLocale, OAuth2Scope } from "../enums/index.js";
import type { Integer, Snowflake } from "../formatting/index.js";
import type { BitFieldResolvable } from "../utils/index.js";
import type { GuildEntity } from "./guilds.js";
import type { TeamEntity } from "./teams.js";
import type { UserEntity } from "./users.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-type}
 */
export enum ApplicationRoleConnectionMetadataType {
  IntegerLessThanOrEqual = 1,
  IntegerGreaterThanOrEqual = 2,
  IntegerEqual = 3,
  IntegerNotEqual = 4,
  DatetimeLessThanOrEqual = 5,
  DatetimeGreaterThanOrEqual = 6,
  BooleanEqual = 7,
  BooleanNotEqual = 8,
}

/**
 * @see {@link https://discord.com/developers/docs/resources/application-role-connection-metadata#application-role-connection-metadata-object-application-role-connection-metadata-structure}
 */
export interface ApplicationRoleConnectionMetadataEntity {
  type: ApplicationRoleConnectionMetadataType;
  key: string;
  name: string;
  name_localizations?: AvailableLocale;
  description: string;
  description_localizations?: AvailableLocale;
}

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
  flags?: BitFieldResolvable<ApplicationFlags>;
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
