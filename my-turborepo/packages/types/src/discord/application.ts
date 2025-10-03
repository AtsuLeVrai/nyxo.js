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

export type ActivityLocationType = "gc" | "pc";

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

export interface ActivityLocationEntity {
  id: string;
  kind: ActivityLocationType;
  channel_id: string;
  guild_id?: string | null;
}

export interface ActivityInstanceEntity {
  application_id: string;
  instance_id: string;
  launch_id: string;
  location: ActivityLocationEntity;
  users: string[];
}

export interface ApplicationUpdateOptions {
  custom_install_url?: string;
  description?: string;
  role_connections_verification_url?: string;
  install_params?: InstallParamsEntity;
  integration_types_config?: Record<
    ApplicationIntegrationType,
    ApplicationIntegrationTypeConfigurationEntity
  >;
  flags?: ApplicationFlags;
  icon?: FileInput;
  cover_image?: FileInput;
  interactions_endpoint_url?: string;
  tags?: string[];
  event_webhooks_url?: string;
  event_webhooks_status?:
    | ApplicationEventWebhookStatus.Disabled
    | ApplicationEventWebhookStatus.Enabled;
  event_webhooks_types?: string[];
}
