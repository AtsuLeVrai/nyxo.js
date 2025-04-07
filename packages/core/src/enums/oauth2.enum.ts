/**
 * Represents the available OAuth2 permission scopes for Discord applications.
 *
 * OAuth2 scopes define the specific permissions requested when authenticating users
 * through Discord's OAuth2 flow. Each scope grants access to specific areas of a user's
 * account or enables certain features for your application.
 *
 * When implementing OAuth2 authentication, you should only request the minimum scopes
 * necessary for your application's functionality.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes}
 */
export enum OAuth2Scope {
  /**
   * Allows your app to read a user's activity status (presence).
   *
   * This scope grants read access to a user's current activities, including
   * what games or applications they are using.
   */
  ActivitiesRead = "activities.read",

  /**
   * Allows your app to update a user's activity status (presence).
   *
   * This scope grants permission to set the user's current activity
   * and status through the API.
   */
  ActivitiesWrite = "activities.write",

  /**
   * Allows your app to read build data for a user's applications.
   *
   * This scope grants access to read build information for applications
   * owned by the user.
   */
  ApplicationsBuildsRead = "applications.builds.read",

  /**
   * Allows your app to upload builds to a user's applications.
   *
   * This scope grants permission to upload new builds for applications
   * owned by the user.
   */
  ApplicationsBuildsUpload = "applications.builds.upload",

  /**
   * Allows your app to use slash commands in a guild.
   *
   * This scope grants access to create and use slash commands in guilds
   * where your application is installed.
   */
  ApplicationsCommands = "applications.commands",

  /**
   * Allows your app to update slash commands via an API bearer token.
   *
   * This scope grants permission to update application commands using
   * a bearer token instead of a bot token.
   */
  ApplicationsCommandsUpdate = "applications.commands.update",

  /**
   * Allows your app to update command permissions.
   *
   * This scope grants permission to update the command permissions for
   * your application's commands in guilds.
   */
  ApplicationsCommandsPermissionsUpdate = "applications.commands.permissions.update",

  /**
   * Allows your app to read entitlements for a user's applications.
   *
   * This scope grants access to read entitlement information for
   * applications owned by the user.
   */
  ApplicationsEntitlements = "applications.entitlements",

  /**
   * Allows your app to read and update store data (SKUs, store listings, achievements, etc.).
   *
   * This scope grants permission to manage store-related information for
   * applications owned by the user.
   */
  ApplicationsStoreUpdate = "applications.store.update",

  /**
   * Allows your app to join a guild as a bot user.
   *
   * This scope is required if your application needs to function as a bot
   * within Discord guilds. It causes the OAuth2 flow to prompt the user
   * with a guild selection screen.
   */
  Bot = "bot",

  /**
   * Allows your app to read a user's 3rd-party connections.
   *
   * This scope grants access to view which other services the user has
   * connected to their Discord account (Twitch, YouTube, etc.).
   */
  Connections = "connections",

  /**
   * Allows your app to read a user's direct messages.
   *
   * This scope grants access to read the direct message channels and
   * history for the authenticated user.
   */
  DmChannelsRead = "dm_channels.read",

  /**
   * Allows your app to read a user's email address.
   *
   * This scope grants access to the email address associated with
   * the user's Discord account.
   */
  Email = "email",

  /**
   * Allows your app to join group DMs on behalf of a user.
   *
   * This scope grants permission to join group direct message
   * conversations as the authenticated user.
   */
  GdmJoin = "gdm.join",

  /**
   * Allows your app to read information about guilds the user is in.
   *
   * This scope grants access to read basic information about all
   * guilds the authenticated user is a member of.
   */
  Guilds = "guilds",

  /**
   * Allows your app to join guilds on behalf of a user.
   *
   * This scope grants permission to add the authenticated user
   * to guilds. Requires the `guilds` scope.
   */
  GuildsJoin = "guilds.join",

  /**
   * Allows your app to read a guild's members list.
   *
   * This scope grants access to read the members of guilds the
   * authenticated user is in.
   */
  GuildsMembersRead = "guilds.members.read",

  /**
   * Allows your app to read a user's identity information.
   *
   * This scope grants access to the user's Discord username, discriminator,
   * avatar, and ID. This is a basic scope that most applications need.
   */
  Identify = "identify",

  /**
   * Allows your app to read a user's message history.
   *
   * This scope grants access to read message content and history
   * in channels the authenticated user has access to.
   */
  MessagesRead = "messages.read",

  /**
   * Allows your app to read a user's relationships (friends, blocked users, etc.).
   *
   * This scope grants access to view the authenticated user's relationships
   * with other Discord users.
   */
  RelationshipsRead = "relationships.read",

  /**
   * Allows your app to write to a user's role connections.
   *
   * This scope grants permission to manage the connections between
   * external services and Discord roles for the authenticated user.
   */
  RoleConnectionsWrite = "role_connections.write",

  /**
   * Allows your app to access RPC for verified clients.
   *
   * This scope grants access to use Discord's Rich Presence Protocol
   * for verified applications.
   */
  Rpc = "rpc",

  /**
   * Allows your app to update a user's activity via RPC.
   *
   * This scope grants permission to set the user's activity
   * through the Rich Presence Protocol.
   */
  RpcActivitiesWrite = "rpc.activities.write",

  /**
   * Allows your app to read notifications via RPC.
   *
   * This scope grants access to read notifications through
   * the Rich Presence Protocol.
   */
  RpcNotificationsRead = "rpc.notifications.read",

  /**
   * Allows your app to read voice settings and information via RPC.
   *
   * This scope grants access to read voice-related settings through
   * the Rich Presence Protocol.
   */
  RpcVoiceRead = "rpc.voice.read",

  /**
   * Allows your app to update voice settings via RPC.
   *
   * This scope grants permission to modify voice-related settings
   * through the Rich Presence Protocol.
   */
  RpcVoiceWrite = "rpc.voice.write",

  /**
   * Allows your app to connect to voice in a guild.
   *
   * This scope grants permission for your application to connect
   * to voice channels and transmit audio.
   */
  Voice = "voice",

  /**
   * Allows your app to create webhooks.
   *
   * This scope grants permission to create incoming webhooks
   * in channels the authenticated user has access to.
   */
  WebhookIncoming = "webhook.incoming",
}
