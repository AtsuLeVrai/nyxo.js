/**
 * @see {@link https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags}
 */
export enum BitwisePermissions {
    /**
     * Allows creation of instant invites
     */
    CreateInstantInvite = 1,
    /**
     * Allows kicking members
     */
    KickMembers = 2,
    /**
     * Allows banning members
     */
    BanMembers = 4,
    /**
     * Allows all permissions and bypasses channel permission overwrites
     */
    Administrator = 8,
    /**
     * Allows management and editing of channels
     */
    ManageChannels = 16,
    /**
     * Allows management and editing of the guild
     */
    ManageGuild = 32,
    /**
     * Allows for the addition of reactions to messages
     */
    AddReactions = 64,
    /**
     * Allows for viewing of audit logs
     */
    ViewAuditLog = 128,
    /**
     * Allows for using priority speaker in a voice channel
     */
    PrioritySpeaker = 256,
    /**
     * Allows the user to go live
     */
    Stream = 512,
    /**
     * Allows guild members to view a channel, which includes reading messages in text channels and joining voice channels
     */
    ViewChannel = 1_024,
    /**
     * Allows for sending messages in a channel and creating threads in a forum (does not allow sending messages in threads)
     */
    SendMessages = 2_048,
    /**
     * Allows for sending of /tts messages
     */
    SendTtsMessages = 4_096,
    /**
     * Allows for deletion of other users messages
     */
    ManageMessages = 8_192,
    /**
     * Links sent by users with this permission will be auto-embedded
     */
    EmbedLinks = 16_384,
    /**
     * Allows for uploading images and files
     */
    AttachFiles = 32_768,
    /**
     * Allows for reading of message history
     */
    ReadMessageHistory = 65_536,
    /**
     * Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel
     */
    MentionEveryone = 131_072,
    /**
     * Allows the usage of custom emojis from other servers
     */
    UseExternalEmojis = 262_144,
    /**
     * Allows for viewing guild insights
     */
    ViewGuildInsights = 524_288,
    /**
     * Allows for joining of a voice channel
     */
    Connect = 1_048_576,
    /**
     * Allows for speaking in a voice channel
     */
    Speak = 2_097_152,
    /**
     * Allows for muting members in a voice channel
     */
    MuteMembers = 4_194_304,
    /**
     * Allows for deafening of members in a voice channel
     */
    DeafenMembers = 8_388_608,
    /**
     * Allows for moving of members between voice channels
     */
    MoveMembers = 16_777_216,
    /**
     * Allows for using voice-activity-detection in a voice channel
     */
    UseVad = 33_554_432,
    /**
     * Allows for modification of own nickname
     */
    ChangeNickname = 67_108_864,
    /**
     * Allows for modification of other users nicknames
     */
    ManageNicknames = 134_217_728,
    /**
     * Allows management and editing of roles
     */
    ManageRoles = 268_435_456,
    /**
     * Allows management and editing of webhooks
     */
    ManageWebhooks = 536_870_912,
    /**
     * Allows for editing and deleting emojis, stickers, and soundboard sounds created by all users
     */
    ManageGuildExpressions = 1_073_741_824,
    /**
     * Allows members to use application commands, including slash commands and context menu commands.
     */
    UseApplicationCommands = 2_147_483_648,
    /**
     * Allows for requesting to speak in stage channels. (This permission is under active development and may be changed or removed.)
     */
    RequestToSpeak = 4_294_967_296,
    /**
     * Allows for editing and deleting scheduled events created by all users
     */
    ManageEvents = 8_589_934_592,
    /**
     * Allows for deleting and archiving threads, and viewing all private threads
     */
    ManageThreads = 17_179_869_184,
    /**
     * Allows for creating public and announcement threads
     */
    CreatePublicThreads = 34_359_738_368,
    /**
     * Allows for creating private threads
     */
    CreatePrivateThreads = 68_719_476_736,
    /**
     * Allows the usage of custom stickers from other servers
     */
    UseExternalStickers = 137_438_953_472,
    /**
     * Allows for sending messages in threads
     */
    SendMessagesInThreads = 274_877_906_944,
    /**
     * Allows for using Activities (applications with the EMBEDDED flag) in a voice channel
     */
    UseEmbeddedActivities = 549_755_813_888,
    /**
     * Allows for timing out users to prevent them from sending or reacting to messages in chat and threads, and from speaking in voice and stage channels
     */
    ModerateMembers = 1_099_511_627_776,
    /**
     * Allows for viewing role subscription insights
     */
    ViewCreatorMonetizationAnalytics = 2_199_023_255_552,
    /**
     * Allows for using soundboard in a voice channel
     */
    UseSoundboard = 4_398_046_511_104,
    /**
     * Allows for creating emojis, stickers, and soundboard sounds, and editing and deleting those created by the current user. Not yet available to developers, see changelog.
     */
    CreateGuildExpressions = 8_796_093_022_208,
    /**
     * Allows for creating scheduled events, and editing and deleting those created by the current user. Not yet available to developers, see changelog.
     */
    CreateEvents = 17_592_186_044_416,
    /**
     * Allows the usage of custom soundboard sounds from other servers
     */
    UseExternalSounds = 35_184_372_088_832,
    /**
     * Allows sending voice messages
     */
    SendVoiceMessages = 70_368_744_177_664,
    /**
     * Allows sending polls
     */
    SendPolls = 140_737_488_355_328,
    /**
     * Allows user-installed apps to send public responses. When disabled, users will still be allowed to use their apps but the responses will be ephemeral. This only applies to apps not also installed to the server.
     */
    UseExternalApps = 281_474_976_710_656,
}
