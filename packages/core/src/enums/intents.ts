import { BitfieldManager } from "../managers/index.js";
import type { Integer } from "../markdown/index.js";

/**
 * Enum representing the various gateway intents used by Discord.
 *
 * @see {@link https://discord.com/developers/docs/topics/gateway#list-of-intents|Gateway Intents}
 */
export const GatewayIntents = {
    /**
     * Intent for guilds.
     */
    guilds: 1,

    /**
     * Intent for guild members.
     */
    guildMembers: 2,

    /**
     * Intent for guild moderation.
     */
    guildModeration: 4,

    /**
     * Intent for guild emojis and stickers.
     */
    guildEmojisAndStickers: 8,

    /**
     * Intent for guild integrations.
     */
    guildIntegrations: 16,

    /**
     * Intent for guild webhooks.
     */
    guildWebhooks: 32,

    /**
     * Intent for guild invites.
     */
    guildInvites: 64,

    /**
     * Intent for guild voice states.
     */
    guildVoiceStates: 128,

    /**
     * Intent for guild presences.
     */
    guildPresences: 256,

    /**
     * Intent for guild messages.
     */
    guildMessages: 512,

    /**
     * Intent for guild message reactions.
     */
    guildMessageReactions: 1_024,

    /**
     * Intent for guild message typing.
     */
    guildMessageTyping: 2_048,

    /**
     * Intent for direct messages.
     */
    directMessages: 4_096,

    /**
     * Intent for direct message reactions.
     */
    directMessageReactions: 8_192,

    /**
     * Intent for direct message typing.
     */
    directMessageTyping: 16_384,

    /**
     * Intent for message content.
     */
    messageContent: 32_768,

    /**
     * Intent for guild scheduled events.
     */
    guildScheduledEvents: 65_536,

    /**
     * Intent for auto moderation configuration.
     */
    autoModerationConfiguration: 1_048_576,

    /**
     * Intent for auto moderation execution.
     */
    autoModerationExecution: 2_097_152,

    /**
     * Intent for guild message polls.
     */
    guildMessagePolls: 16_777_216,

    /**
     * Intent for direct message polls.
     */
    directMessagePolls: 33_554_432,

    /**
     * Returns all intents.
     */
    all(): Integer {
        const intents = [
            this.guilds,
            this.guildMembers,
            this.guildModeration,
            this.guildEmojisAndStickers,
            this.guildIntegrations,
            this.guildWebhooks,
            this.guildInvites,
            this.guildVoiceStates,
            this.guildPresences,
            this.guildMessages,
            this.guildMessageReactions,
            this.guildMessageTyping,
            this.directMessages,
            this.directMessageReactions,
            this.directMessageTyping,
            this.messageContent,
            this.guildScheduledEvents,
            this.autoModerationConfiguration,
            this.autoModerationExecution,
            this.guildMessagePolls,
            this.directMessagePolls,
        ];

        return Number(BitfieldManager.from(intents).valueOf());
    },

    privileged(): Integer {
        const intents = [this.guildPresences, this.guildMembers, this.messageContent];

        return Number(BitfieldManager.from(intents).valueOf());
    },
} as const;
