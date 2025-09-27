import type { ApplicationEntity } from "./application.js";
import type { GuildEntity } from "./guild.js";
import type { UserObject } from "./user.js";
import type { WebhookEntity } from "./webhook.js";

/**
 * OAuth2 scopes that Discord supports for application authorization.
 * Some scopes require Discord approval before use and may cause errors if used without approval.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes} for OAuth2 scopes specification
 */
export enum OAuth2Scopes {
  /** Allows reading user's "Now Playing/Recently Played" activity list (not available for apps) */
  ActivitiesRead = "activities.read",
  /** Allows updating user's activity (not available for apps, not required for GameSDK) */
  ActivitiesWrite = "activities.write",
  /** Allows reading build data for user's applications */
  ApplicationsBuildsRead = "applications.builds.read",
  /** Allows uploading/updating builds for user's applications (requires Discord approval) */
  ApplicationsBuildsUpload = "applications.builds.upload",
  /** Allows adding application commands to guilds (included by default with bot scope) */
  ApplicationsCommands = "applications.commands",
  /** Allows updating application commands using Bearer token (client credentials only) */
  ApplicationsCommandsUpdate = "applications.commands.update",
  /** Allows updating command permissions in guilds where user has permissions */
  ApplicationsCommandsPermissionsUpdate = "applications.commands.permissions.update",
  /** Allows reading entitlements for user's applications */
  ApplicationsEntitlements = "applications.entitlements",
  /** Allows reading and updating store data for user's applications */
  ApplicationsStoreUpdate = "applications.store.update",
  /** Puts bot in user's selected guild by default for OAuth2 bots */
  Bot = "bot",
  /** Allows access to linked third-party accounts via /users/@me/connections */
  Connections = "connections",
  /** Allows seeing information about user's DMs and group DMs (requires Discord approval) */
  DmChannelsRead = "dm_channels.read",
  /** Enables /users/@me to return user's email address */
  Email = "email",
  /** Allows joining users to group DMs */
  GdmJoin = "gdm.join",
  /** Allows /users/@me/guilds to return basic information about user's guilds */
  Guilds = "guilds",
  /** Allows adding users to guilds via /guilds/{guild.id}/members/{user.id} */
  GuildsJoin = "guilds.join",
  /** Allows reading user's member information in specific guilds */
  GuildsMembersRead = "guilds.members.read",
  /** Allows /users/@me without email address */
  Identify = "identify",
  /** Allows reading messages from all client channels for local RPC server API access */
  MessagesRead = "messages.read",
  /** Allows knowing user's friends and implicit relationships (requires Discord approval) */
  RelationshipsRead = "relationships.read",
  /** Allows updating user's connection and metadata for the application */
  RoleConnectionsWrite = "role_connections.write",
  /** Allows controlling user's local Discord client for local RPC server access (requires approval) */
  Rpc = "rpc",
  /** Allows updating user's activity for local RPC server access (requires Discord approval) */
  RpcActivitiesWrite = "rpc.activities.write",
  /** Allows receiving notifications for local RPC server access (requires Discord approval) */
  RpcNotificationsRead = "rpc.notifications.read",
  /** Allows reading voice settings and events for local RPC server access (requires approval) */
  RpcVoiceRead = "rpc.voice.read",
  /** Allows updating voice settings for local RPC server access (requires Discord approval) */
  RpcVoiceWrite = "rpc.voice.write",
  /** Allows connecting to voice on user's behalf (requires Discord approval) */
  Voice = "voice",
  /** Generates webhook returned in OAuth token response for authorization code grants */
  WebhookIncoming = "webhook.incoming",
}

/**
 * OAuth2 grant types supported by Discord for different authorization flows.
 * Each grant type serves specific use cases and has different security characteristics.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2} for OAuth2 flows documentation
 */
export enum OAuth2GrantTypes {
  /** Standard OAuth2 authorization code flow with code exchange */
  AuthorizationCode = "authorization_code",
  /** Simplified flow returning access token directly in URL fragment */
  Implicit = "implicit",
  /** Server-to-server authentication using client credentials */
  ClientCredentials = "client_credentials",
  /** Token refresh flow using refresh token */
  RefreshToken = "refresh_token",
}

/**
 * Response types for OAuth2 authorization requests determining flow behavior.
 * Specifies what kind of response the authorization server should return.
 *
 * @see {@link https://tools.ietf.org/html/rfc6749} for OAuth2 specification
 */
export enum OAuth2ResponseTypes {
  /** Request authorization code for exchange flow */
  Code = "code",
  /** Request access token directly (implicit flow) */
  Token = "token",
}

/**
 * Integration types for OAuth2 authorization specifying installation context.
 * Determines where the application will be installed and available for use.
 *
 * @see {@link https://discord.com/developers/docs/resources/application#installation-context} for installation context specification
 */
export enum OAuth2IntegrationTypes {
  /** Application installed to a guild (server) */
  GuildInstall = 0,
  /** Application installed to a user account */
  UserInstall = 1,
}

/**
 * Prompt behaviors for OAuth2 authorization controlling user interaction flow.
 * Affects whether users see authorization screens for previously granted permissions.
 */
export enum OAuth2PromptTypes {
  /** Skip authorization screen if user previously granted permissions */
  None = "none",
  /** Always show authorization screen requesting user consent */
  Consent = "consent",
}

/**
 * Current OAuth2 authorization information for authenticated requests.
 * Provides details about the authorized application, granted scopes, and user context.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information} for authorization info endpoint
 */
export interface CurrentAuthorizationInformationObject {
  /** Partial application object for the authorized application */
  readonly application: Partial<ApplicationEntity>;
  /** Array of OAuth2 scopes the user has authorized */
  readonly scopes: OAuth2Scopes[];
  /** ISO8601 timestamp when the access token expires */
  readonly expires: string;
  /** User who authorized the application (if identify scope granted) */
  readonly user?: UserObject;
}

/**
 * Standard OAuth2 access token response containing authentication credentials.
 * Returned after successful authorization code exchange or client credentials flow.
 *
 * @see {@link https://tools.ietf.org/html/rfc6749#section-5.1} for access token response specification
 */
export interface OAuth2AccessTokenResponse {
  /** OAuth2 access token for API authentication */
  readonly access_token: string;
  /** Token type (always "Bearer" for Discord) */
  readonly token_type: string;
  /** Token expiration time in seconds */
  readonly expires_in: number;
  /** Refresh token for obtaining new access tokens */
  readonly refresh_token?: string;
  /** Space-separated list of granted scopes */
  readonly scope: string;
}

/**
 * Extended access token response for webhook authorization flow.
 * Includes webhook information in addition to standard OAuth2 token data.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#webhooks} for webhook authorization flow
 */
export interface WebhookTokenResponse extends OAuth2AccessTokenResponse {
  /** Created webhook object for the authorized channel */
  readonly webhook: WebhookEntity;
}

/**
 * Extended access token response for advanced bot authorization flow.
 * Includes guild information when bot is added with additional scopes.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#advanced-bot-authorization} for advanced bot authorization
 */
export interface BotAuthorizationTokenResponse extends OAuth2AccessTokenResponse {
  /** Guild where the bot was installed */
  readonly guild: Partial<GuildEntity>;
}

/**
 * Query parameters for retrieving current OAuth2 authorization information.
 * Used with Bearer token authentication to get authorization details.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#get-current-authorization-information} for authorization info endpoint
 */
export interface GetCurrentAuthorizationInformationQueryParams {
  /** Whether to include user information in response (requires identify scope) */
  readonly with_user?: boolean;
}

/**
 * Request parameters for OAuth2 authorization code exchange.
 * Used to exchange authorization code for access token in standard OAuth2 flow.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant} for authorization code grant
 */
export interface AuthorizationCodeExchangeParams {
  /** OAuth2 grant type (must be "authorization_code") */
  readonly grant_type: "authorization_code";
  /** Authorization code received from redirect */
  readonly code: string;
  /** Redirect URI used in authorization request */
  readonly redirect_uri: string;
}

/**
 * Request parameters for OAuth2 token refresh flow.
 * Used to obtain new access tokens using refresh tokens.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant} for token refresh
 */
export interface RefreshTokenParams {
  /** OAuth2 grant type (must be "refresh_token") */
  readonly grant_type: "refresh_token";
  /** Valid refresh token from previous authorization */
  readonly refresh_token: string;
}

/**
 * Request parameters for OAuth2 client credentials flow.
 * Used for server-to-server authentication without user interaction.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#client-credentials-grant} for client credentials grant
 */
export interface ClientCredentialsParams {
  /** OAuth2 grant type (must be "client_credentials") */
  readonly grant_type: "client_credentials";
  /** Space-separated list of requested scopes */
  readonly scope?: string;
}

/**
 * Request parameters for OAuth2 token revocation.
 * Used to invalidate access tokens and refresh tokens.
 *
 * @see {@link https://tools.ietf.org/html/rfc7009} for token revocation specification
 */
export interface TokenRevocationParams {
  /** Access token or refresh token to revoke */
  readonly token: string;
  /** Hint about token type (access_token or refresh_token) */
  readonly token_type_hint?: "access_token" | "refresh_token";
}

/**
 * Parameters for constructing OAuth2 authorization URLs.
 * Used to build authorization requests with all necessary configuration.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant} for authorization URL construction
 */
export interface AuthorizationURLParams {
  /** OAuth2 response type (code for authorization flow, token for implicit) */
  readonly response_type: OAuth2ResponseTypes;
  /** Application's client ID */
  readonly client_id: string;
  /** Space-separated list of requested OAuth2 scopes */
  readonly scope: string;
  /** Redirect URI for authorization response */
  readonly redirect_uri: string;
  /** State parameter for CSRF protection */
  readonly state?: string;
  /** Prompt behavior for authorization flow */
  readonly prompt?: OAuth2PromptTypes;
  /** Integration type for application installation */
  readonly integration_type?: OAuth2IntegrationTypes;
  /** Guild ID to pre-select for bot authorization */
  readonly guild_id?: string;
  /** Whether to disable guild selection dropdown */
  readonly disable_guild_select?: boolean;
  /** Permission integer for bot authorization */
  readonly permissions?: number;
}
