/**
 * @description OAuth2 scopes that Discord supports for application authentication and authorization.
 * @see {@link https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes}
 */
export enum OAuth2Scope {
  /** Read user's "Now Playing/Recently Played" activity data */
  ActivitiesRead = "activities.read",
  /** Update user's activity (not currently available for apps) */
  ActivitiesWrite = "activities.write",
  /** Read build data for user's applications */
  ApplicationsBuildsRead = "applications.builds.read",
  /** Upload/update builds for user's applications (requires Discord approval) */
  ApplicationsBuildsUpload = "applications.builds.upload",
  /** Add commands to a guild (included with bot scope) */
  ApplicationsCommands = "applications.commands",
  /** Update commands using Bearer token (client credentials only) */
  ApplicationsCommandsUpdate = "applications.commands.update",
  /** Update command permissions in guilds user has permissions to */
  ApplicationsCommandsPermissionsUpdate = "applications.commands.permissions.update",
  /** Read entitlements for user's applications */
  ApplicationsEntitlements = "applications.entitlements",
  /** Read and update store data for user's applications */
  ApplicationsStoreUpdate = "applications.store.update",
  /** Add bot to user's selected guild */
  Bot = "bot",
  /** Access user's linked third-party accounts */
  Connections = "connections",
  /** See information about user's DMs and group DMs (requires Discord approval) */
  DmChannelsRead = "dm_channels.read",
  /** Access user's email address */
  Email = "email",
  /** Join users to group DMs */
  GdmJoin = "gdm.join",
  /** Access basic information about user's guilds */
  Guilds = "guilds",
  /** Add users to guilds */
  GuildsJoin = "guilds.join",
  /** Access user's member information in guilds */
  GuildsMembersRead = "guilds.members.read",
  /** Access user's basic account information (without email) */
  Identify = "identify",
  /** Read messages from all client channels (RPC only) */
  MessagesRead = "messages.read",
  /** Access user's friends and implicit relationships (requires Discord approval) */
  RelationshipsRead = "relationships.read",
  /** Update user's connection and metadata for the app */
  RoleConnectionsWrite = "role_connections.write",
  /** Control user's local Discord client (requires Discord approval) */
  Rpc = "rpc",
  /** Update user's activity via RPC (requires Discord approval) */
  RpcActivitiesWrite = "rpc.activities.write",
  /** Receive notifications via RPC (requires Discord approval) */
  RpcNotificationsRead = "rpc.notifications.read",
  /** Read user's voice settings via RPC (requires Discord approval) */
  RpcVoiceRead = "rpc.voice.read",
  /** Update user's voice settings via RPC (requires Discord approval) */
  RpcVoiceWrite = "rpc.voice.write",
  /** Connect to voice and see voice members (requires Discord approval) */
  Voice = "voice",
  /** Generate webhook in OAuth token response */
  WebhookIncoming = "webhook.incoming",
}
