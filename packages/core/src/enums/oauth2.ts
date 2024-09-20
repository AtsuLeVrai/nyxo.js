/**
 * Enum representing the various OAuth2 URLs used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-urls|OAuth2 URLs}
 */
export enum OAuth2Urls {
    /**
     * Base authorization URL
     */
    Authorize = "https://discord.com/oauth2/authorize",
    /**
     * Token Revocation URL
     */
    Revoke = "https://discord.com/api/oauth2/token/revoke",
    /**
     * Token URL
     */
    Token = "https://discord.com/api/oauth2/token",
}

/**
 * Enum representing the various OAuth2 scopes used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes|OAuth2 Scopes}
 */
export enum OAuth2Scopes {
    /**
     * Allows your app to fetch data from a user's "Now Playing/Recently Played" list.
     */
    ActivitiesRead = "activities.read",
    /**
     * Allows your app to update a user's activity.
     */
    ActivitiesWrite = "activities.write",
    /**
     * Allows your app to read build data for a user's applications.
     */
    ApplicationsBuildsRead = "applications.builds.read",
    /**
     * Allows your app to upload/update builds for a user's applications.
     */
    ApplicationsBuildsUpload = "applications.builds.upload",
    /**
     * Allows your app to add commands to a guild.
     */
    ApplicationsCommands = "applications.commands",
    /**
     * Allows your app to update permissions for its commands in a guild a user has permissions to.
     */
    ApplicationsCommandsPermissionsUpdate = "applications.commands.permissions.update",
    /**
     * Allows your app to update its commands using a Bearer token.
     */
    ApplicationsCommandsUpdate = "applications.commands.update",
    /**
     * Allows your app to read entitlements for a user's applications.
     */
    ApplicationsEntitlements = "applications.entitlements",
    /**
     * Allows your app to read and update store data (SKUs, store listings, achievements, etc.) for a user's applications.
     */
    ApplicationsStoreUpdate = "applications.store.update",
    /**
     * For OAuth2 bots, this puts the bot in the user's selected guild by default.
     */
    Bot = "bot",
    /**
     * Allows /users/@me/connections to return linked third-party accounts.
     */
    Connections = "connections",
    /**
     * Allows your app to see information about the user's DMs and group DMs.
     */
    DMChannelsRead = "dm_channels.read",
    /**
     * Enables /users/@me to return an email.
     */
    Email = "email",
    /**
     * Allows your app to join users to a group dm.
     */
    GDMJoin = "gdm.join",
    /**
     * Allows /users/@me/guilds to return basic information about all of a user's guilds.
     */
    Guilds = "guilds",
    /**
     * Allows /guilds/{guild.id}/members/{user.id} to be used for joining users to a guild.
     */
    GuildsJoin = "guilds.join",
    /**
     * Allows /users/@me/guilds/{guild.id}/member to return a user's member information in a guild.
     */
    GuildsMembersRead = "guilds.members.read",
    /**
     * Allows /users/@me without email.
     */
    Identify = "identify",
    /**
     * For local RPC server API access, this allows you to read messages from all client channels.
     */
    MessagesRead = "messages.read",
    /**
     * For local RPC server access, this allows you to control a user's local Discord client.
     */
    RPC = "rpc",
    /**
     * For local RPC server access, this allows you to update a user's activity.
     */
    RPCActivitiesWrite = "rpc.activities.write",
    /**
     * For local RPC server access, this allows you to receive notifications pushed out to the user.
     */
    RPCNotificationsRead = "rpc.notifications.read",
    /**
     * For local RPC server access, this allows you to read a user's voice settings and listen for voice events.
     */
    RPCVoiceRead = "rpc.voice.read",
    /**
     * For local RPC server access, this allows you to update a user's voice settings.
     */
    RPCVoiceWrite = "rpc.voice.write",
    /**
     * Allows your app to know a user's friends and implicit relationships.
     */
    RelationshipsRead = "relationships.read",
    /**
     * Allows your app to update a user's connection and metadata for the app.
     */
    RoleConnectionsWrite = "role_connections.write",
    /**
     * Allows your app to connect to voice on user's behalf and see all the voice members.
     */
    Voice = "voice",
    /**
     * This generates a webhook that is returned in the OAuth token response for authorization code grants.
     */
    WebhookIncoming = "webhook.incoming",
}
