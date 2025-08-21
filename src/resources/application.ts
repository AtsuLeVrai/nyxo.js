import type { Snowflake } from "../common/index.js";
import type { GuildObject } from "./guild.js";
import type { TeamObject } from "./teams.js";
import type { UserObject } from "./user.js";

export enum ApplicationIntegrationType {
  GuildInstall = 0,
  UserInstall = 1,
}

export enum ApplicationEventWebhookStatus {
  Disabled = 1,
  Enabled = 2,
  DisabledByDiscord = 3,
}

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

export enum ActivityLocationKind {
  GC = "gc",
  PC = "pc",
}

export interface InstallParamsObject {
  scopes: string[];
  permissions: string;
}

export interface ApplicationIntegrationTypeConfigurationObject {
  oauth2_install_params?: InstallParamsObject;
}

export interface ActivityLocationObject {
  id: string;
  kind: ActivityLocationKind;
  channel_id: Snowflake;
  guild_id?: Snowflake | null;
}

export interface ActivityInstanceObject {
  application_id: Snowflake;
  instance_id: string;
  launch_id: Snowflake;
  location: ActivityLocationObject;
  users: Snowflake[];
}

export interface ApplicationObject {
  id: Snowflake;
  name: string;
  icon: string | null;
  description: string;
  rpc_origins?: string[];
  bot_public: boolean;
  bot_require_code_grant: boolean;
  bot?: Partial<UserObject>;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  owner?: Partial<UserObject>;
  verify_key: string;
  team: TeamObject | null;
  guild_id?: Snowflake;
  guild?: Partial<GuildObject>;
  primary_sku_id?: Snowflake;
  slug?: string;
  cover_image?: string;
  flags?: number | ApplicationFlags;
  approximate_guild_count?: number;
  approximate_user_install_count?: number;
  approximate_user_authorization_count?: number;
  redirect_uris?: string[];
  interactions_endpoint_url?: string | null;
  role_connections_verification_url?: string | null;
  event_webhooks_url?: string | null;
  event_webhooks_status: ApplicationEventWebhookStatus;
  event_webhooks_types?: string[];
  tags?: string[];
  install_params?: InstallParamsObject;
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationObject
  >;
  custom_install_url?: string;
}
