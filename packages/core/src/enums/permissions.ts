/**
 * Represents Discord permission flags that can be used in bitwise operations.
 * Each flag represents a specific permission that can be granted to roles or users.
 *
 * @remarks
 * - Permissions marked with (*) require the owner account to use two-factor authentication
 *   when used on a guild that has server-wide 2FA enabled.
 * - Channel Types: T = Text, V = Voice, S = Stage
 *
 * @see {@link https://discord.com/developers/docs/topics/permissions}
 */
export enum BitwisePermissionFlags {
  /**
   * Allows creation of instant invites
   * @remarks Channel Types: T, V, S
   */
  CreateInstantInvite = 0x0000000000000001,

  /**
   * Allows kicking members
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  KickMembers = 0x0000000000000002,

  /**
   * Allows banning members
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  BanMembers = 0x0000000000000004,

  /**
   * Allows all permissions and bypasses channel permission overwrites
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  Administrator = 0x0000000000000008,

  /**
   * Allows management and editing of channels
   * @remarks Channel Types: T, V, S
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ManageChannels = 0x0000000000000010,

  /**
   * Allows management and editing of the guild
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ManageGuild = 0x0000000000000020,

  /**
   * Allows for the addition of reactions to messages
   * @remarks Channel Types: T, V, S
   */
  AddReactions = 0x0000000000000040,

  /**
   * Allows for viewing of audit logs
   */
  ViewAuditLog = 0x0000000000000080,

  /**
   * Allows for using priority speaker in a voice channel
   * @remarks Channel Types: V
   */
  PrioritySpeaker = 0x0000000000000100,

  /**
   * Allows the user to go live
   * @remarks Channel Types: V, S
   */
  Stream = 0x0000000000000200,

  /**
   * Allows guild members to view a channel, which includes reading messages in text channels
   * and joining voice channels
   * @remarks Channel Types: T, V, S
   */
  ViewChannel = 0x0000000000000400,

  /**
   * Allows for sending messages in a channel and creating threads in a forum
   * (does not allow sending messages in threads)
   * @remarks Channel Types: T, V, S
   */
  SendMessages = 0x0000000000000800,

  /**
   * Allows for sending of /tts messages
   * @remarks Channel Types: T, V, S
   */
  SendTtsMessages = 0x0000000000001000,

  /**
   * Allows for deletion of other users messages
   * @remarks Channel Types: T, V, S
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ManageMessages = 0x0000000000002000,

  /**
   * Links sent by users with this permission will be auto-embedded
   * @remarks Channel Types: T, V, S
   */
  EmbedLinks = 0x0000000000004000,

  /**
   * Allows for uploading images and files
   * @remarks Channel Types: T, V, S
   */
  AttachFiles = 0x0000000000008000,

  /**
   * Allows for reading of message history
   * @remarks Channel Types: T, V, S
   */
  ReadMessageHistory = 0x0000000000010000,

  /**
   * Allows for using the @everyone tag to notify all users in a channel,
   * and the @here tag to notify all online users in a channel
   * @remarks Channel Types: T, V, S
   */
  MentionEveryone = 0x0000000000020000,

  /**
   * Allows the usage of custom emojis from other servers
   * @remarks Channel Types: T, V, S
   */
  UseExternalEmojis = 0x0000000000040000,

  /**
   * Allows for viewing guild insights
   */
  ViewGuildInsights = 0x0000000000080000,

  /**
   * Allows for joining of a voice channel
   * @remarks Channel Types: V, S
   */
  Connect = 0x0000000000100000,

  /**
   * Allows for speaking in a voice channel
   * @remarks Channel Types: V
   */
  Speak = 0x0000000000200000,

  /**
   * Allows for muting members in a voice channel
   * @remarks Channel Types: V, S
   */
  MuteMembers = 0x0000000000400000,

  /**
   * Allows for deafening of members in a voice channel
   * @remarks Channel Types: V
   */
  DeafenMembers = 0x0000000000800000,

  /**
   * Allows for moving of members between voice channels
   * @remarks Channel Types: V, S
   */
  MoveMembers = 0x0000000001000000,

  /**
   * Allows for using voice-activity-detection in a voice channel
   * @remarks Channel Types: V
   */
  UseVad = 0x0000000002000000,

  /**
   * Allows for modification of own nickname
   */
  ChangeNickname = 0x0000000004000000,

  /**
   * Allows for modification of other users nicknames
   */
  ManageNicknames = 0x0000000008000000,

  /**
   * Allows management and editing of roles
   * @remarks Channel Types: T, V, S
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ManageRoles = 0x0000000010000000,

  /**
   * Allows management and editing of webhooks
   * @remarks Channel Types: T, V, S
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ManageWebhooks = 0x0000000020000000,

  /**
   * Allows for editing and deleting emojis, stickers, and soundboard sounds created by all users
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ManageGuildExpressions = 0x0000000040000000,

  /**
   * Allows members to use application commands, including slash commands and context menu commands
   * @remarks Channel Types: T, V, S
   */
  UseApplicationCommands = 0x0000000080000000,

  /**
   * Allows for requesting to speak in stage channels
   * @remarks This permission is under active development and may be changed or removed
   * @remarks Channel Types: S
   */
  RequestToSpeak = 0x0000000100000000,

  /**
   * Allows for editing and deleting scheduled events created by all users
   * @remarks Channel Types: V, S
   */
  ManageEvents = 0x0000000200000000,

  /**
   * Allows for deleting and archiving threads, and viewing all private threads
   * @remarks Channel Types: T
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ManageThreads = 0x0000000400000000,

  /**
   * Allows for creating public and announcement threads
   * @remarks Channel Types: T
   */
  CreatePublicThreads = 0x0000000800000000,

  /**
   * Allows for creating private threads
   * @remarks Channel Types: T
   */
  CreatePrivateThreads = 0x0000001000000000,

  /**
   * Allows the usage of custom stickers from other servers
   * @remarks Channel Types: T, V, S
   */
  UseExternalStickers = 0x0000002000000000,

  /**
   * Allows for sending messages in threads
   * @remarks Channel Types: T
   */
  SendMessagesInThreads = 0x0000004000000000,

  /**
   * Allows for using Activities (applications with the EMBEDDED flag) in a voice channel
   * @remarks Channel Types: V
   */
  UseEmbeddedActivities = 0x0000008000000000,

  /**
   * Allows for timing out users to prevent them from sending or reacting to messages in chat and threads,
   * and from speaking in voice and stage channels
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ModerateMembers = 0x0000010000000000,

  /**
   * Allows for viewing role subscription insights
   * @remarks Requires two-factor authentication when enabled on the server (*)
   */
  ViewCreatorMonetizationAnalytics = 0x0000020000000000,

  /**
   * Allows for using soundboard in a voice channel
   * @remarks Channel Types: V
   */
  UseSoundboard = 0x0000040000000000,

  /**
   * Allows for creating emojis, stickers, and soundboard sounds, and editing and deleting those created by the current user
   * @remarks Not yet available to developers
   * @see {@link https://discord.com/developers/docs/change-log#clarification-on-permission-splits-for-expressions-and-events}
   */
  CreateGuildExpressions = 0x0000080000000000,

  /**
   * Allows for creating scheduled events, and editing and deleting those created by the current user
   * @remarks Channel Types: V, S
   * @remarks Not yet available to developers
   * @see {@link https://discord.com/developers/docs/change-log#clarification-on-permission-splits-for-expressions-and-events}
   */
  CreateEvents = 0x0000100000000000,

  /**
   * Allows the usage of custom soundboard sounds from other servers
   * @remarks Channel Types: V
   */
  UseExternalSounds = 0x0000200000000000,

  /**
   * Allows sending voice messages
   * @remarks Channel Types: T, V, S
   */
  SendVoiceMessages = 0x0000400000000000,

  /**
   * Allows sending polls
   * @remarks Channel Types: T, V, S
   */
  SendPolls = 0x0002000000000000,

  /**
   * Allows user-installed apps to send public responses. When disabled, users will still be allowed
   * to use their apps but the responses will be ephemeral. This only applies to apps not also installed to the server
   * @remarks Channel Types: T, V, S
   */
  UseExternalApps = 0x0004000000000000,
}
