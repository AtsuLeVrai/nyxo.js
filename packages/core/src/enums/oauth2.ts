/**
 * Discord OAuth2 Authentication System
 *
 * Comprehensive module for implementing Discord's OAuth2 authentication flow.
 * Provides endpoints, scopes, and utilities for secure user authentication and authorization.
 *
 * @module Discord OAuth2
 * @version 1.0.0
 * @see {@link https://discord.com/developers/docs/topics/oauth2}
 */

/**
 * Discord OAuth2 Authentication Endpoints
 *
 * Core URLs required for implementing the OAuth2 authentication flow.
 * These endpoints handle authorization, token management, and revocation.
 *
 * @remarks
 * Flow Sequence:
 * 1. Redirect user to Authorize URL
 * 2. Receive authorization code
 * 3. Exchange code for token at Token URL
 * 4. Use token for API requests
 * 5. Revoke token when done at Revoke URL
 *
 * @example
 * ```typescript
 * // Initialize OAuth2 flow
 * const authParams = new URLSearchParams({
 *   client_id: CLIENT_ID,
 *   redirect_uri: REDIRECT_URI,
 *   response_type: 'code',
 *   scope: 'identify email'
 * });
 *
 * const authUrl = `${OAuth2Urls.Authorize}?${authParams}`;
 *
 * // Exchange code for token
 * const tokenResponse = await fetch(OAuth2Urls.Token, {
 *   method: 'POST',
 *   body: new URLSearchParams({
 *     client_id: CLIENT_ID,
 *     client_secret: CLIENT_SECRET,
 *     grant_type: 'authorization_code',
 *     code: AUTH_CODE,
 *     redirect_uri: REDIRECT_URI
 *   })
 * });
 *
 * // Revoke token on logout
 * const revokeToken = async (token: string) => {
 *   await fetch(OAuth2Urls.Revoke, {
 *     method: 'POST',
 *     body: new URLSearchParams({ token })
 *   });
 * };
 * ```
 */
// biome-ignore lint/style/useNamingConvention: <explanation>
export enum OAuth2Urls {
    /**
     * The base authorization endpoint used to initiate the OAuth2 flow.
     * Users will be redirected to this URL to grant permissions to your application.
     *
     * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant}
     */
    Authorize = "https://discord.com/oauth2/authorize",

    /**
     * Endpoint for revoking access tokens.
     * Use this URL when you need to invalidate an existing token, typically during logout.
     *
     * @see {@link https://discord.com/developers/docs/topics/oauth2#token-revocation}
     */
    Revoke = "https://discord.com/api/oauth2/token/revoke",

    /**
     * Endpoint for token operations including:
     * - Exchanging authorization codes for access tokens
     * - Refreshing access tokens
     * - Getting new access tokens
     *
     * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-exchange-example}
     */
    Token = "https://discord.com/api/oauth2/token",
}

/**
 * OAuth2 Permission Scopes
 *
 * Comprehensive list of available OAuth2 permission scopes.
 * Each scope grants specific access rights to your application.
 *
 * @remarks
 * Scope Categories:
 * 1. Identity & Information
 * 2. Bot & Application Management
 * 3. Guild & Channel Access
 * 4. Message & Communication
 * 5. Voice & RPC
 *
 * Best Practices:
 * - Request minimum necessary scopes
 * - Group related scopes logically
 * - Consider privacy implications
 * - Document scope usage clearly
 *
 * @example
 * ```typescript
 * // Basic bot setup
 * const botScopes = [
 *   OAuth2Scopes.Bot,
 *   OAuth2Scopes.ApplicationsCommands,
 *   OAuth2Scopes.Identify,
 *   OAuth2Scopes.GuildsMembersRead
 * ].join(' ');
 *
 * // User profile access
 * const profileScopes = [
 *   OAuth2Scopes.Identify,
 *   OAuth2Scopes.Email,
 *   OAuth2Scopes.Connections
 * ].join(' ');
 * ```
 */
// biome-ignore lint/style/useNamingConvention: <explanation>
export enum OAuth2Scopes {
    /**
     * Grants read access to user's activity data.
     * Includes "Now Playing" and "Recently Played" information.
     */
    ActivitiesRead = "activities.read",

    /**
     * Enables updating a user's activity status.
     * Required for setting custom status or game presence.
     */
    ActivitiesWrite = "activities.write",

    /**
     * Enables read access to application build data.
     * Useful for deployment and version tracking.
     */
    ApplicationsBuildsRead = "applications.builds.read",

    /**
     * Allows uploading and updating application builds.
     * Essential for application deployment management.
     */
    ApplicationsBuildsUpload = "applications.builds.upload",

    /**
     * Enables adding slash commands to guilds.
     * Required for creating interactive bot commands.
     */
    ApplicationsCommands = "applications.commands",

    /**
     * Permits updating command permissions in guilds.
     * Requires appropriate guild member permissions.
     */
    ApplicationsCommandsPermissionsUpdate = "applications.commands.permissions.update",

    /**
     * Enables updating application commands via Bearer token.
     * Used for global command management.
     */
    ApplicationsCommandsUpdate = "applications.commands.update",

    /**
     * Provides access to application entitlements.
     * Used for managing user access rights and subscriptions.
     */
    ApplicationsEntitlements = "applications.entitlements",

    /**
     * Enables store data management including SKUs and achievements.
     * Essential for applications with marketplace presence.
     */
    ApplicationsStoreUpdate = "applications.store.update",

    /**
     * Adds the bot to user's selected guild.
     * Standard scope for Discord bot applications.
     */
    Bot = "bot",

    /**
     * Provides access to user's third-party account connections.
     * Returns linked account data via /users/@me/connections.
     */
    Connections = "connections",

    /**
     * Grants read access to user's DMs and group DMs.
     * Handle with care due to privacy implications.
     */
    DmChannelsRead = "dm_channels.read",

    /**
     * Provides access to user's email address.
     * Returns email via /users/@me endpoint.
     */
    Email = "email",

    /**
     * Enables adding users to group DMs.
     * Requires appropriate user permissions.
     */
    GdmJoin = "gdm.join",

    /**
     * Provides basic information about user's guilds.
     * Returns data via /users/@me/guilds endpoint.
     */
    Guilds = "guilds",

    /**
     * Enables adding users to guilds.
     * Uses /guilds/{guild.id}/members/{user.id} endpoint.
     */
    GuildsJoin = "guilds.join",

    /**
     * Provides access to detailed guild member information.
     * Returns data via /users/@me/guilds/{guild.id}/member.
     */
    GuildsMembersRead = "guilds.members.read",

    /**
     * Provides access to user's basic profile information.
     * Core scope for user identification.
     */
    Identify = "identify",

    /**
     * Enables reading messages from client channels.
     * Limited to local RPC server access.
     */
    MessagesRead = "messages.read",

    /**
     * Grants RPC server access to control local Discord client.
     * Use with caution and only when necessary.
     */
    Rpc = "rpc",

    /**
     * Enables activity updates via RPC.
     * Limited to local RPC server access.
     */
    RpcActivitiesWrite = "rpc.activities.write",

    /**
     * Provides access to user notifications via RPC.
     * Limited to local RPC server access.
     */
    RpcNotificationsRead = "rpc.notifications.read",

    /**
     * Enables reading voice settings via RPC.
     * Limited to local RPC server access.
     */
    RpcVoiceRead = "rpc.voice.read",

    /**
     * Enables updating voice settings via RPC.
     * Limited to local RPC server access.
     */
    RpcVoiceWrite = "rpc.voice.write",

    /**
     * Provides access to user's relationships and connections.
     * Includes friends list and implicit relationships.
     */
    RelationshipsRead = "relationships.read",

    /**
     * Enables updating role connections and metadata.
     * Used for application-specific role management.
     */
    RoleConnectionsWrite = "role_connections.write",

    /**
     * Grants voice connection capabilities.
     * Enables voice channel interactions and member visibility.
     */
    Voice = "voice",

    /**
     * Creates an incoming webhook.
     * Webhook URL is provided in OAuth token response.
     */
    WebhookIncoming = "webhook.incoming",
}
