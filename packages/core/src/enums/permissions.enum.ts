/**
 * Represents the permission flags used in Discord's permission system.
 *
 * Discord uses a bitwise permission system where each permission is represented by a bit
 * in a permission integer. These flags can be combined using bitwise operations to create
 * permission sets.
 *
 * To check if a permission set includes a specific permission:
 * ```typescript
 * const hasPermission = (permissionSet & BitwisePermissionFlags.SendMessages) === BitwisePermissionFlags.SendMessages;
 * ```
 *
 * To add a permission to a set:
 * ```typescript
 * const newPermissions = currentPermissions | BitwisePermissionFlags.SendMessages;
 * ```
 *
 * To remove a permission from a set:
 * ```typescript
 * const newPermissions = currentPermissions & ~BitwisePermissionFlags.SendMessages;
 * ```
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions}
 */
export enum BitwisePermissionFlags {
  /**
   * Allows creation of instant invites.
   * Applies to: Text Channels, Voice Channels, Categories
   */
  CreateInstantInvite = 0x0000000000000001,

  /**
   * Allows kicking members from the guild.
   * Applies to: Guild
   */
  KickMembers = 0x0000000000000002,

  /**
   * Allows banning members from the guild.
   * Applies to: Guild
   */
  BanMembers = 0x0000000000000004,

  /**
   * Allows all permissions and bypasses channel permission overwrites.
   * Applies to: Guild
   * Note: This is a powerful permission that grants all other permissions automatically.
   */
  Administrator = 0x0000000000000008,

  /**
   * Allows management and editing of channels.
   * Applies to: Guild, Categories
   */
  ManageChannels = 0x0000000000000010,

  /**
   * Allows management and editing of the guild.
   * Applies to: Guild
   */
  ManageGuild = 0x0000000000000020,

  /**
   * Allows adding reactions to messages.
   * Applies to: Text Channels, Threads
   */
  AddReactions = 0x0000000000000040,

  /**
   * Allows viewing the audit log.
   * Applies to: Guild
   */
  ViewAuditLog = 0x0000000000000080,

  /**
   * Allows using priority speaker in a voice channel.
   * Applies to: Voice Channels
   */
  PrioritySpeaker = 0x0000000000000100,

  /**
   * Allows streaming in a voice channel.
   * Applies to: Voice Channels
   */
  Stream = 0x0000000000000200,

  /**
   * Allows viewing a channel, including reading messages.
   * Applies to: Text Channels, Voice Channels, Categories, Threads
   */
  ViewChannel = 0x0000000000000400,

  /**
   * Allows sending messages in a channel.
   * Applies to: Text Channels
   */
  SendMessages = 0x0000000000000800,

  /**
   * Allows sending of text-to-speech messages.
   * Applies to: Text Channels
   */
  SendTtsMessages = 0x0000000000001000,

  /**
   * Allows deleting and pinning messages.
   * Applies to: Text Channels, Threads
   * Note: Users can always delete their own messages
   */
  ManageMessages = 0x0000000000002000,

  /**
   * Links sent by users with this permission will be auto-embedded.
   * Applies to: Text Channels, Threads
   */
  EmbedLinks = 0x0000000000004000,

  /**
   * Allows uploading files.
   * Applies to: Text Channels, Threads
   */
  AttachFiles = 0x0000000000008000,

  /**
   * Allows reading message history.
   * Applies to: Text Channels, Threads
   */
  ReadMessageHistory = 0x0000000000010000,

  /**
   * Allows using the @everyone and @here mentions.
   * Applies to: Text Channels, Threads
   */
  MentionEveryone = 0x0000000000020000,

  /**
   * Allows using emojis from other servers.
   * Applies to: Text Channels, Threads
   */
  UseExternalEmojis = 0x0000000000040000,

  /**
   * Allows viewing guild insights.
   * Applies to: Guild
   */
  ViewGuildInsights = 0x0000000000080000,

  /**
   * Allows joining voice channels.
   * Applies to: Voice Channels
   */
  Connect = 0x0000000000100000,

  /**
   * Allows speaking in voice channels.
   * Applies to: Voice Channels
   */
  Speak = 0x0000000000200000,

  /**
   * Allows muting members in voice channels.
   * Applies to: Voice Channels
   */
  MuteMembers = 0x0000000000400000,

  /**
   * Allows deafening members in voice channels.
   * Applies to: Voice Channels
   */
  DeafenMembers = 0x0000000000800000,

  /**
   * Allows moving members between voice channels.
   * Applies to: Voice Channels
   */
  MoveMembers = 0x0000000001000000,

  /**
   * Allows using voice activity detection.
   * Applies to: Voice Channels
   */
  UseVad = 0x0000000002000000,

  /**
   * Allows changing own nickname.
   * Applies to: Guild
   */
  ChangeNickname = 0x0000000004000000,

  /**
   * Allows managing other members' nicknames.
   * Applies to: Guild
   */
  ManageNicknames = 0x0000000008000000,

  /**
   * Allows managing roles.
   * Applies to: Guild, Categories, Text Channels, Voice Channels
   */
  ManageRoles = 0x0000000010000000,

  /**
   * Allows managing webhooks.
   * Applies to: Text Channels
   */
  ManageWebhooks = 0x0000000020000000,

  /**
   * Allows managing guild expressions (emojis and stickers).
   * Applies to: Guild
   */
  ManageGuildExpressions = 0x0000000040000000,

  /**
   * Allows members to use application commands (slash commands, context menu commands).
   * Applies to: Text Channels, Threads
   */
  UseApplicationCommands = 0x0000000080000000,

  /**
   * Allows requesting to speak in stage channels.
   * Applies to: Stage Channels
   */
  RequestToSpeak = 0x0000000100000000,

  /**
   * Allows managing scheduled events.
   * Applies to: Guild
   */
  ManageEvents = 0x0000000200000000,

  /**
   * Allows managing threads.
   * Applies to: Text Channels
   */
  ManageThreads = 0x0000000400000000,

  /**
   * Allows creating public threads.
   * Applies to: Text Channels
   */
  CreatePublicThreads = 0x0000000800000000,

  /**
   * Allows creating private threads.
   * Applies to: Text Channels
   */
  CreatePrivateThreads = 0x0000001000000000,

  /**
   * Allows using external stickers from other servers.
   * Applies to: Text Channels, Threads
   */
  UseExternalStickers = 0x0000002000000000,

  /**
   * Allows sending messages in threads.
   * Applies to: Threads
   */
  SendMessagesInThreads = 0x0000004000000000,

  /**
   * Allows using Activities (applications with the EMBEDDED flag) in voice channels.
   * Applies to: Voice Channels
   */
  UseEmbeddedActivities = 0x0000008000000000,

  /**
   * Allows timing out users to prevent them from sending/reacting to messages.
   * Applies to: Guild
   */
  ModerateMembers = 0x0000010000000000,

  /**
   * Allows viewing role and membership subscription insights.
   * Applies to: Guild
   */
  ViewCreatorMonetizationAnalytics = 0x0000020000000000,

  /**
   * Allows using the soundboard in voice channels.
   * Applies to: Voice Channels
   */
  UseSoundboard = 0x0000040000000000,

  /**
   * Allows creating emojis, stickers, and soundboard sounds.
   * Applies to: Guild
   */
  CreateGuildExpressions = 0x0000080000000000,

  /**
   * Allows creating scheduled events.
   * Applies to: Guild
   */
  CreateEvents = 0x0000100000000000,

  /**
   * Allows using external sounds from other servers.
   * Applies to: Voice Channels
   */
  UseExternalSounds = 0x0000200000000000,

  /**
   * Allows sending voice messages.
   * Applies to: Text Channels, Threads
   */
  SendVoiceMessages = 0x0000400000000000,

  /**
   * Allows creating and sending polls.
   * Applies to: Text Channels, Threads
   */
  SendPolls = 0x0002000000000000,

  /**
   * Allows using external applications/bots.
   * Applies to: Text Channels, Voice Channels
   */
  UseExternalApps = 0x0004000000000000,
}
