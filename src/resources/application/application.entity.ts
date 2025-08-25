import type { OAuth2Scope } from "../../enum/index.js";
import type { GuildEntity } from "../guild/index.js";
import type { TeamEntity } from "../team/index.js";
import type { UserEntity } from "../user/index.js";

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

export enum ApplicationEventWebhookStatus {
  Disabled = 1,
  Enabled = 2,
  DisabledByDiscord = 3,
}

export enum ApplicationIntegrationType {
  GuildInstall = 0,
  UserInstall = 1,
}

export interface InstallParamsEntity {
  scopes: OAuth2Scope[];
  permissions: string;
}

export interface ApplicationIntegrationTypeConfigurationEntity {
  oauth2_install_params?: InstallParamsEntity;
}

export interface ApplicationEntity {
  id: string;
  name: string;
  icon: string | null;
  icon_hash?: string | null;
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
  guild_id?: string;
  guild?: Partial<GuildEntity>;
  primary_sku_id?: string;
  slug?: string;
  cover_image?: string;
  flags?: ApplicationFlags;
  approximate_guild_count?: number;
  approximate_user_install_count?: number;
  redirect_uris?: string[];
  interactions_endpoint_url?: string | null;
  role_connections_verification_url?: string | null;
  event_webhooks_url?: string | null;
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
