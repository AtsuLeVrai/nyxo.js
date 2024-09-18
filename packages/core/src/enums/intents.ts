/**
 * Enum representing the various gateway intents used by Discord.
 * @see {@link https://discord.com/developers/docs/topics/gateway#list-of-intents|Gateway Intents}
 */
export enum GatewayIntents {
    /**
     * Intent for guilds.
     */
    Guilds = 0,
    /**
     * Intent for guild members.
     */
    GuildMembers = 2,
    /**
     * Intent for guild moderation.
     */
    GuildModeration = 4,
    /**
     * Intent for guild emojis and stickers.
     */
    GuildEmojisAndStickers = 8,
    /**
     * Intent for guild integrations.
     */
    GuildIntegrations = 16,
    /**
     * Intent for guild webhooks.
     */
    GuildWebhooks = 32,
    /**
     * Intent for guild invites.
     */
    GuildInvites = 64,
    /**
     * Intent for guild voice states.
     */
    GuildVoiceStates = 128,
    /**
     * Intent for guild presences.
     */
    GuildPresences = 256,
    /**
     * Intent for guild messages.
     */
    GuildMessages = 512,
    /**
     * Intent for guild message reactions.
     */
    GuildMessageReactions = 1024,
    /**
     * Intent for guild message typing.
     */
    GuildMessageTyping = 2048,
    /**
     * Intent for direct messages.
     */
    DirectMessages = 4096,
    /**
     * Intent for direct message reactions.
     */
    DirectMessageReactions = 8192,
    /**
     * Intent for direct message typing.
     */
    DirectMessageTyping = 16384,
    /**
     * Intent for message content.
     */
    MessageContent = 32768,
    /**
     * Intent for guild scheduled events.
     */
    GuildScheduledEvents = 65536,
    /**
     * Intent for auto moderation configuration.
     */
    AutoModerationConfiguration = 1048576,
    /**
     * Intent for auto moderation execution.
     */
    AutoModerationExecution = 2097152,
    /**
     * Intent for guild message polls.
     */
    GuildMessagePolls = 16777216,
    /**
     * Intent for direct message polls.
     */
    DirectMessagePolls = 33554432,
}
