/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#list-of-intents}
 */
export enum GatewayIntents {
    Guilds = 1,
    GuildMembers = 2,
    GuildModeration = 4,
    GuildEmojisAndStickers = 8,
    GuildIntegrations = 16,
    GuildWebhooks = 32,
    GuildInvites = 64,
    GuildVoiceStates = 128,
    GuildPresences = 256,
    GuildMessages = 512,
    GuildMessageReactions = 1_024,
    GuildMessageTyping = 2_048,
    DirectMessages = 4_096,
    DirectMessageReactions = 8_192,
    DirectMessageTyping = 16_384,
    MessageContent = 32_768,
    GuildScheduledEvents = 65_536,
    AutoModerationConfiguration = 1_048_576,
    AutoModerationExecution = 2_097_152,
    GuildMessagePolls = 16_777_216,
    DirectMessagePolls = 33_554_432,
}
