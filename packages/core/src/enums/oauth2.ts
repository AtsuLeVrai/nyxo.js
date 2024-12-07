/**
 * Represents the available OAuth2 scopes for Discord applications.
 * @see {@link https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes}
 */
// biome-ignore lint/style/useNamingConvention: OAuth2 is a standard name that requires consecutive uppercase letters
export enum OAuth2Scope {
  /**
   * Allows your app to fetch data from a user's "Now Playing/Recently Played" list.
   * @remarks Not currently available for apps
   */
  ActivitiesRead = "activities.read",

  /**
   * Allows your app to update a user's activity.
   * @remarks Not currently available for apps (NOT REQUIRED FOR GAMESDK ACTIVITY MANAGER)
   */
  ActivitiesWrite = "activities.write",

  /**
   * Allows your app to read build data for a user's applications.
   */
  ApplicationsBuildsRead = "applications.builds.read",

  /**
   * Allows your app to upload/update builds for a user's applications.
   * @remarks Requires Discord approval
   */
  ApplicationsBuildsUpload = "applications.builds.upload",

  /**
   * Allows your app to add commands to a guild.
   * @remarks Included by default with the bot scope
   */
  ApplicationsCommands = "applications.commands",

  /**
   * Allows your app to update its commands using a Bearer token.
   * @remarks Client credentials grant only
   */
  ApplicationsCommandsUpdate = "applications.commands.update",

  /**
   * Allows your app to update permissions for its commands in a guild.
   */
  ApplicationsCommandsPermissionsUpdate = "applications.commands.permissions.update",

  /**
   * Allows your app to read entitlements for a user's applications.
   */
  ApplicationsEntitlements = "applications.entitlements",

  /**
   * Allows your app to read and update store data for applications.
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
   * @remarks Requires Discord approval
   */
  DmChannelsRead = "dm_channels.read",

  /**
   * Enables /users/@me to return an email.
   */
  Email = "email",

  /**
   * Allows your app to join users to a group DM.
   */
  GdmJoin = "gdm.join",

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
   * For local RPC server API access, allows reading messages from all client channels.
   */
  MessagesRead = "messages.read",

  /**
   * Allows your app to know a user's friends and implicit relationships.
   * @remarks Requires Discord approval
   */
  RelationshipsRead = "relationships.read",

  /**
   * Allows your app to update a user's connection and metadata for the app.
   * @remarks Cannot be used with the Implicit grant type
   */
  RoleConnectionsWrite = "role_connections.write",

  /**
   * For local RPC server access, allows you to control a user's Discord client.
   * @remarks Requires Discord approval
   */
  Rpc = "rpc",

  /**
   * For local RPC server access, allows you to update a user's activity.
   * @remarks Requires Discord approval
   */
  RpcActivitiesWrite = "rpc.activities.write",

  /**
   * For local RPC server access, allows you to receive notifications pushed out to the user.
   * @remarks Requires Discord approval
   */
  RpcNotificationsRead = "rpc.notifications.read",

  /**
   * For local RPC server access, allows you to read a user's voice settings and listen for voice events.
   * @remarks Requires Discord approval
   */
  RpcVoiceRead = "rpc.voice.read",

  /**
   * For local RPC server access, allows you to update a user's voice settings.
   * @remarks Requires Discord approval
   */
  RpcVoiceWrite = "rpc.voice.write",

  /**
   * Allows your app to connect to voice on user's behalf and see all voice members.
   * @remarks Requires Discord approval
   */
  Voice = "voice",

  /**
   * Creates a webhook that is returned in the OAuth2 token response for authorization code grants.
   */
  WebhookIncoming = "webhook.incoming",
}
