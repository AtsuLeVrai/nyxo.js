import type { EmojiStructure, Snowflake } from "@nyxjs/core";
import { RestMethods, type RouteStructure } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji-json-params|Modify Application Emoji JSON Params}
 */
export type ModifyApplicationEmojiJsonParams = Pick<EmojiStructure, "name">;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji-json-params|Create Application Emoji JSON Params}
 */
export type CreateApplicationEmojiJsonParams = Partial<
    Pick<EmojiStructure, "name"> & {
        /**
         * The 128x128 emoji image
         */
        image: string;
    }
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji-json-params|Modify Guild Emoji JSON Params}
 */
export type ModifyGuildEmojiJsonParams = Pick<EmojiStructure, "name" | "roles">;

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params|Create Guild Emoji JSON Params}
 */
export interface CreateGuildEmojiJsonParams extends Pick<EmojiStructure, "name" | "roles"> {
    /**
     * The 128x128 emoji image
     */
    image: string;
}

export const EmojiRoutes = {
    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#delete-application-emoji|Delete Application Emoji}
     */
    deleteApplicationEmoji(applicationId: Snowflake, emojiId: Snowflake): RouteStructure<void> {
        return {
            method: RestMethods.Delete,
            path: `/applications/${applicationId}/emojis/${emojiId}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji|Modify Application Emoji}
     */
    modifyApplicationEmoji(
        applicationId: Snowflake,
        emojiId: Snowflake,
        params: ModifyApplicationEmojiJsonParams,
    ): RouteStructure<EmojiStructure> {
        return {
            method: RestMethods.Patch,
            path: `/applications/${applicationId}/emojis/${emojiId}`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji|Create Application Emoji}
     */
    createApplicationEmoji(
        applicationId: Snowflake,
        params: CreateApplicationEmojiJsonParams,
    ): RouteStructure<EmojiStructure> {
        return {
            method: RestMethods.Post,
            path: `/applications/${applicationId}/emojis`,
            body: Buffer.from(JSON.stringify(params)),
        };
    },
    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji|Get Application Emoji}
     */
    getApplicationEmoji(applicationId: Snowflake, emojiId: Snowflake): RouteStructure<EmojiStructure> {
        return {
            method: RestMethods.Get,
            path: `/applications/${applicationId}/emojis/${emojiId}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis|List Application Emojis}
     */
    listApplicationEmojis(applicationId: Snowflake): RouteStructure<{ items: EmojiStructure[] }> {
        return {
            method: RestMethods.Get,
            path: `/applications/${applicationId}/emojis`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji|Delete Guild Emoji}
     */
    deleteGuildEmoji(guildId: Snowflake, emojiId: Snowflake, reason?: string): RouteStructure<void> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Delete,
            path: `/guilds/${guildId}/emojis/${emojiId}`,
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji|Modify Guild Emoji}
     */
    modifyGuildEmoji(
        guildId: Snowflake,
        emojiId: Snowflake,
        params: ModifyGuildEmojiJsonParams,
        reason?: string,
    ): RouteStructure<EmojiStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Patch,
            path: `/guilds/${guildId}/emojis/${emojiId}`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji|Create Guild Emoji}
     */
    createGuildEmoji(
        guildId: Snowflake,
        params: CreateGuildEmojiJsonParams,
        reason?: string,
    ): RouteStructure<EmojiStructure> {
        const headers: Record<string, string> = {};

        if (reason) {
            headers["X-Audit-Log-Reason"] = reason;
        }

        return {
            method: RestMethods.Post,
            path: `/guilds/${guildId}/emojis`,
            body: Buffer.from(JSON.stringify(params)),
            headers,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji|Get Guild Emoji}
     */
    getGuildEmoji(guildId: Snowflake, emojiId: Snowflake): RouteStructure<EmojiStructure> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/emojis/${emojiId}`,
        };
    },

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis|List Guild Emojis}
     */
    listGuildEmojis(guildId: Snowflake): RouteStructure<EmojiStructure[]> {
        return {
            method: RestMethods.Get,
            path: `/guilds/${guildId}/emojis`,
        };
    },
} as const;
