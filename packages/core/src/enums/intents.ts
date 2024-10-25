import { BitfieldManager } from "../managers/index.js";
import type { Integer } from "../markdown/index.js";

/**
 * Enum representing the various gateway intents used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#list-of-intents|Gateway Intents}
 */
export class GatewayIntents {
    /**
     * Intent for guilds.
     */
    static Guilds = 1;

    /**
     * Intent for guild members.
     */
    static GuildMembers = 2;

    /**
     * Intent for guild moderation.
     */
    static GuildModeration = 4;

    /**
     * Intent for guild emojis and stickers.
     */
    static GuildEmojisAndStickers = 8;

    /**
     * Intent for guild integrations.
     */
    static GuildIntegrations = 16;

    /**
     * Intent for guild webhooks.
     */
    static GuildWebhooks = 32;

    /**
     * Intent for guild invites.
     */
    static GuildInvites = 64;

    /**
     * Intent for guild voice states.
     */
    static GuildVoiceStates = 128;

    /**
     * Intent for guild presences.
     */
    static GuildPresences = 256;

    /**
     * Intent for guild messages.
     */
    static GuildMessages = 512;

    /**
     * Intent for guild message reactions.
     */
    static GuildMessageReactions = 1_024;

    /**
     * Intent for guild message typing.
     */
    static GuildMessageTyping = 2_048;

    /**
     * Intent for direct messages.
     */
    static DirectMessages = 4_096;

    /**
     * Intent for direct message reactions.
     */
    static DirectMessageReactions = 8_192;

    /**
     * Intent for direct message typing.
     */
    static DirectMessageTyping = 16_384;

    /**
     * Intent for message content.
     */
    static MessageContent = 32_768;

    /**
     * Intent for guild scheduled events.
     */
    static GuildScheduledEvents = 65_536;

    /**
     * Intent for auto moderation configuration.
     */
    static AutoModerationConfiguration = 1_048_576;

    /**
     * Intent for auto moderation execution.
     */
    static AutoModerationExecution = 2_097_152;

    /**
     * Intent for guild message polls.
     */
    static GuildMessagePolls = 16_777_216;

    /**
     * Intent for direct message polls.
     */
    static DirectMessagePolls = 33_554_432;

    /**
     * Returns all intents.
     */
    static All(): Integer {
        const intents = [
            this.Guilds,
            this.GuildMembers,
            this.GuildModeration,
            this.GuildEmojisAndStickers,
            this.GuildIntegrations,
            this.GuildWebhooks,
            this.GuildInvites,
            this.GuildVoiceStates,
            this.GuildPresences,
            this.GuildMessages,
            this.GuildMessageReactions,
            this.GuildMessageTyping,
            this.DirectMessages,
            this.DirectMessageReactions,
            this.DirectMessageTyping,
            this.MessageContent,
            this.GuildScheduledEvents,
            this.AutoModerationConfiguration,
            this.AutoModerationExecution,
            this.GuildMessagePolls,
            this.DirectMessagePolls,
        ];

        return Number(BitfieldManager.from(intents).valueOf());
    }

    static Privileged(): Integer {
        const intents = [this.GuildPresences, this.GuildMembers, this.MessageContent];

        return Number(BitfieldManager.from(intents).valueOf());
    }
}
