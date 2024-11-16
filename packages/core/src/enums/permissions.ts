/**
 * Discord Permission System
 *
 * This module defines the bitwise permission flags used in Discord's permission system.
 * Permissions are stored as a bitfield, where each bit represents a specific permission.
 *
 * @module Discord Permissions
 * @version 1.0.0
 * @see {@link https://discord.com/developers/docs/topics/permissions}
 */

/**
 * Discord Bitwise Permission Flags
 *
 * Represents all available permissions in Discord. These permissions are grouped into
 * several categories for better organization:
 * - General Server Management
 * - Member Management
 * - Channel & Messages
 * - Voice & Stage
 * - Events & Activities
 * - Content Management
 * - Advanced Features
 *
 * @remarks
 * Permissions are stored as bits in a bitfield. To check if a user has a permission,
 * perform a bitwise AND operation between the user's permission bitfield and the
 * desired permission flag.
 *
 * @example
 * ```typescript
 * // Checking if a user has administrator permissions
 * const hasAdmin = (userPermissions & BitwisePermissions.Administrator) === BitwisePermissions.Administrator;
 *
 * // Creating a permission bitfield with multiple permissions
 * const moderatorPerms =
 *   BitwisePermissions.KickMembers |
 *   BitwisePermissions.BanMembers |
 *   BitwisePermissions.ManageMessages;
 * ```
 */
export enum BitwisePermissions {
    /**
     * Enables creating instant invites to the server.
     * Basic server growth permission.
     */
    CreateInstantInvite = 0x0000000000000001,

    /**
     * Allows removing members from the server.
     * Members can rejoin with a new invite unless banned.
     */
    KickMembers = 0x0000000000000002,

    /**
     * Enables permanently removing members from the server.
     * Banned members cannot rejoin unless unbanned.
     */
    BanMembers = 0x0000000000000004,

    /**
     * Grants all permissions and bypasses channel permission overwrites.
     * This is a dangerous permission that should be granted carefully.
     *
     * @security Critical permission that provides full control
     */
    Administrator = 0x0000000000000008,

    /**
     * Allows creating, editing, and deleting channels.
     * Includes text, voice, and category channels.
     */
    ManageChannels = 0x0000000000000010,

    /**
     * Allows management and editing of the guild's settings.
     * This includes server name, icon, verification level, etc.
     */
    ManageGuild = 0x0000000000000020,

    /**
     * Enables adding reactions to messages.
     * Basic interaction permission.
     */
    AddReactions = 0x0000000000000040,

    /**
     * Enables viewing the server's audit log.
     * Contains detailed history of all server changes.
     */
    ViewAuditLog = 0x0000000000000080,

    /**
     * Grants priority speaker status in voice channels.
     * Reduces others' audio when speaking.
     */
    PrioritySpeaker = 0x0000000000000100,

    /**
     * Allows streaming video in voice channels.
     * Required for screen sharing and video calls.
     */
    Stream = 0x0000000000000200,

    /**
     * Enables viewing channels and reading messages.
     * Basic permission required for channel access.
     */
    ViewChannel = 0x0000000000000400,

    /**
     * Permits sending messages in text channels.
     * Also allows creating threads in forum channels.
     */
    SendMessages = 0x0000000000000800,

    /**
     * Allows sending Text-to-Speech messages.
     * Can be restricted to prevent disruption.
     */
    SendTtsMessages = 0x0000000000001000,

    /**
     * Enables deletion and pinning of messages.
     * Applies to all messages, not just own messages.
     */
    ManageMessages = 0x0000000000002000,

    /**
     * Permits automatic embedding of links.
     * Affects message appearance and previews.
     */
    EmbedLinks = 0x0000000000004000,

    /**
     * Enables file and image uploads.
     * Can be restricted for content control.
     */
    AttachFiles = 0x0000000000008000,

    /**
     * Allows reading message history in text channels.
     * Required for viewing messages sent before joining.
     */
    ReadMessageHistory = 0x0000000000010000,

    /**
     * Enables mentioning @everyone and @here.
     * Can be restricted to prevent mass pings.
     */
    MentionEveryone = 0x0000000000020000,

    /**
     * Allows using emojis from other servers.
     * Requires Discord Nitro subscription.
     */
    UseExternalEmojis = 0x0000000000040000,

    /**
     * Permits viewing server insights and analytics.
     * Available for servers that meet certain requirements.
     */
    ViewGuildInsights = 0x0000000000080000,

    /**
     * Permits joining voice channels.
     * Basic voice permission required for voice features.
     */
    Connect = 0x0000000000100000,

    /**
     * Enables speaking in voice channels.
     * Can be revoked while still allowing listening.
     */
    Speak = 0x0000000000200000,

    /**
     * Enables muting members in voice channels.
     * Affects server-wide voice status.
     */
    MuteMembers = 0x0000000000400000,

    /**
     * Allows deafening members in voice channels.
     * Prevents members from hearing any audio.
     */
    DeafenMembers = 0x0000000000800000,

    /**
     * Permits moving members between voice channels.
     * Required for moderation and organization.
     */
    MoveMembers = 0x0000000001000000,

    /**
     * Allows using voice-activity-detection.
     * Alternative to push-to-talk in voice channels.
     */
    UseVad = 0x0000000002000000,

    /**
     * Allows modification of own nickname.
     * Does not grant permission to change others' nicknames.
     */
    ChangeNickname = 0x0000000004000000,

    /**
     * Permits changing nicknames of other members.
     * Useful for maintaining naming standards.
     */
    ManageNicknames = 0x0000000008000000,

    /**
     * Enables management of server roles.
     * Includes creating, editing, and deleting roles.
     */
    ManageRoles = 0x0000000010000000,

    /**
     * Allows management of webhooks.
     * Includes creating, editing, and deleting webhooks.
     */
    ManageWebhooks = 0x0000000020000000,

    /**
     * Enables management of all server expressions.
     * Includes emojis, stickers, and soundboard sounds.
     */
    ManageGuildExpressions = 0x0000000040000000,

    /**
     * Enables use of application commands.
     * Includes slash commands and context menus.
     */
    UseApplicationCommands = 0x0000000080000000,

    /**
     * Allows requesting to speak in stage channels.
     * Used for organized audio events.
     */
    RequestToSpeak = 0x0000000100000000,

    /**
     * Enables creation and management of scheduled events.
     * Includes editing and deleting all events.
     */
    ManageEvents = 0x0000000200000000,

    /**
     * Permits managing all thread operations.
     * Includes archiving, deleting, and viewing private threads.
     */
    ManageThreads = 0x0000000400000000,

    /**
     * Allows creating public and announcement threads.
     * Available in text and news channels.
     */
    CreatePublicThreads = 0x0000000800000000,

    /**
     * Enables creation of private threads.
     * Only visible to selected members.
     */
    CreatePrivateThreads = 0x0000001000000000,

    /**
     * Enables using stickers from other servers.
     * Requires Discord Nitro subscription.
     */
    UseExternalStickers = 0x0000002000000000,

    /**
     * Allows sending messages within threads.
     * Separate from general message sending permission.
     */
    SendMessagesInThreads = 0x0000004000000000,

    /**
     * Allows using embedded activities in voice channels.
     * Includes games and other interactive features.
     */
    UseEmbeddedActivities = 0x0000008000000000,

    /**
     * Enables temporary restriction of member permissions.
     * Timed out members cannot send messages or join voice channels.
     */
    ModerateMembers = 0x0000010000000000,

    /**
     * Enables viewing role subscription insights.
     * Available for servers with monetization features.
     */
    ViewCreatorMonetizationAnalytics = 0x0000020000000000,

    /**
     * Permits using soundboard features.
     * Enables playing sound effects in voice channels.
     */
    UseSoundboard = 0x0000040000000000,

    /**
     * Permits creating personal server expressions.
     * Limited to managing own created content.
     */
    CreateGuildExpressions = 0x0000080000000000,

    /**
     * Permits creating personal scheduled events.
     * Limited to managing own created events.
     */
    CreateEvents = 0x0000100000000000,

    /**
     * Allows using sounds from other servers.
     * Related to soundboard functionality.
     */
    UseExternalSounds = 0x0000200000000000,

    /**
     * Enables sending voice messages.
     * Available in text channels.
     */
    SendVoiceMessages = 0x0000400000000000,

    /**
     * Allows creating and sending polls.
     * Interactive voting feature.
     */
    SendPolls = 0x0002000000000000,

    /**
     * Permits using external app features publicly.
     * When disabled, responses are ephemeral.
     */
    UseExternalApps = 0x0004000000000000,
}
