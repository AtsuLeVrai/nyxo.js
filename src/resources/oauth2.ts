import type { ApplicationEntity } from "./application.js";
import type { GuildEntity } from "./guild.js";
import type { UserObject } from "./user.js";
import type { WebhookEntity } from "./webhook.js";

export enum OAuth2Scopes {
  ActivitiesRead = "activities.read",

  ActivitiesWrite = "activities.write",

  ApplicationsBuildsRead = "applications.builds.read",

  ApplicationsBuildsUpload = "applications.builds.upload",

  ApplicationsCommands = "applications.commands",

  ApplicationsCommandsUpdate = "applications.commands.update",

  ApplicationsCommandsPermissionsUpdate = "applications.commands.permissions.update",

  ApplicationsEntitlements = "applications.entitlements",

  ApplicationsStoreUpdate = "applications.store.update",

  Bot = "bot",

  Connections = "connections",

  DmChannelsRead = "dm_channels.read",

  Email = "email",

  GdmJoin = "gdm.join",

  Guilds = "guilds",

  GuildsJoin = "guilds.join",

  GuildsMembersRead = "guilds.members.read",

  Identify = "identify",

  MessagesRead = "messages.read",

  RelationshipsRead = "relationships.read",

  RoleConnectionsWrite = "role_connections.write",

  Rpc = "rpc",

  RpcActivitiesWrite = "rpc.activities.write",

  RpcNotificationsRead = "rpc.notifications.read",

  RpcVoiceRead = "rpc.voice.read",

  RpcVoiceWrite = "rpc.voice.write",

  Voice = "voice",

  WebhookIncoming = "webhook.incoming",
}

export enum OAuth2GrantTypes {
  AuthorizationCode = "authorization_code",

  Implicit = "implicit",

  ClientCredentials = "client_credentials",

  RefreshToken = "refresh_token",
}

export enum OAuth2ResponseTypes {
  Code = "code",

  Token = "token",
}

export enum OAuth2IntegrationTypes {
  GuildInstall = 0,

  UserInstall = 1,
}

export enum OAuth2PromptTypes {
  None = "none",

  Consent = "consent",
}

export interface CurrentAuthorizationInformationObject {
  readonly application: Partial<ApplicationEntity>;

  readonly scopes: OAuth2Scopes[];

  readonly expires: string;

  readonly user?: UserObject;
}

export interface OAuth2AccessTokenResponse {
  readonly access_token: string;

  readonly token_type: string;

  readonly expires_in: number;

  readonly refresh_token?: string;

  readonly scope: string;
}

export interface WebhookTokenResponse extends OAuth2AccessTokenResponse {
  readonly webhook: WebhookEntity;
}

export interface BotAuthorizationTokenResponse extends OAuth2AccessTokenResponse {
  readonly guild: Partial<GuildEntity>;
}

export interface GetCurrentAuthorizationInformationQueryParams {
  readonly with_user?: boolean;
}

export interface AuthorizationCodeExchangeParams {
  readonly grant_type: "authorization_code";

  readonly code: string;

  readonly redirect_uri: string;
}

export interface RefreshTokenParams {
  readonly grant_type: "refresh_token";

  readonly refresh_token: string;
}

export interface ClientCredentialsParams {
  readonly grant_type: "client_credentials";

  readonly scope?: string;
}

export interface TokenRevocationParams {
  readonly token: string;

  readonly token_type_hint?: "access_token" | "refresh_token";
}

export interface AuthorizationURLParams {
  readonly response_type: OAuth2ResponseTypes;

  readonly client_id: string;

  readonly scope: string;

  readonly redirect_uri: string;

  readonly state?: string;

  readonly prompt?: OAuth2PromptTypes;

  readonly integration_type?: OAuth2IntegrationTypes;

  readonly guild_id?: string;

  readonly disable_guild_select?: boolean;

  readonly permissions?: number;
}
