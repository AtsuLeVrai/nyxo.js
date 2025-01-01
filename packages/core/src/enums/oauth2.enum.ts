/**
 * @see {@link https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes}
 */
// biome-ignore lint/style/useNamingConvention: OAuth2 is a standard name that requires consecutive uppercase letters
export const OAuth2Scope = {
  activitiesRead: "activities.read",
  activitiesWrite: "activities.write",
  applicationsBuildsRead: "applications.builds.read",
  applicationsBuildsUpload: "applications.builds.upload",
  applicationsCommands: "applications.commands",
  applicationsCommandsUpdate: "applications.commands.update",
  applicationsCommandsPermissionsUpdate:
    "applications.commands.permissions.update",
  applicationsEntitlements: "applications.entitlements",
  applicationsStoreUpdate: "applications.store.update",
  bot: "bot",
  connections: "connections",
  dmChannelsRead: "dm_channels.read",
  email: "email",
  gdmJoin: "gdm.join",
  guilds: "guilds",
  guildsJoin: "guilds.join",
  guildsMembersRead: "guilds.members.read",
  identify: "identify",
  messagesRead: "messages.read",
  relationshipsRead: "relationships.read",
  roleConnectionsWrite: "role_connections.write",
  rpc: "rpc",
  rpcActivitiesWrite: "rpc.activities.write",
  rpcNotificationsRead: "rpc.notifications.read",
  rpcVoiceRead: "rpc.voice.read",
  rpcVoiceWrite: "rpc.voice.write",
  voice: "voice",
  webhookIncoming: "webhook.incoming",
} as const;

// biome-ignore lint/style/useNamingConvention: OAuth2 is a standard name that requires consecutive uppercase letters
export type OAuth2Scope = (typeof OAuth2Scope)[keyof typeof OAuth2Scope];
