import type { EmojiStructure, Snowflake } from "@nyxjs/core";
import type { RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

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
export type CreateGuildEmojiJsonParams = Pick<EmojiStructure, "name" | "roles"> & {
    /**
     * The 128x128 emoji image
     */
    image: string;
};

export class EmojiRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#delete-application-emoji|Delete Application Emoji}
     */
    public static deleteApplicationEmoji(applicationId: Snowflake, emojiId: Snowflake): RestRequestOptions<void> {
        return this.delete(`/applications/${applicationId}/emojis/${emojiId}`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#modify-application-emoji|Modify Application Emoji}
     */
    public static modifyApplicationEmoji(
        applicationId: Snowflake,
        emojiId: Snowflake,
        params: ModifyApplicationEmojiJsonParams
    ): RestRequestOptions<EmojiStructure> {
        return this.patch(`/applications/${applicationId}/emojis/${emojiId}`, {
            body: JSON.stringify(params),
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#create-application-emoji|Create Application Emoji}
     */
    public static createApplicationEmoji(
        applicationId: Snowflake,
        params: CreateApplicationEmojiJsonParams
    ): RestRequestOptions<EmojiStructure> {
        return this.post(`/applications/${applicationId}/emojis`, {
            body: JSON.stringify(params),
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#get-application-emoji|Get Application Emoji}
     */
    public static getApplicationEmoji(
        applicationId: Snowflake,
        emojiId: Snowflake
    ): RestRequestOptions<EmojiStructure> {
        return this.get(`/applications/${applicationId}/emojis/${emojiId}`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#list-application-emojis|List Application Emojis}
     */
    public static listApplicationEmojis(applicationId: Snowflake): RestRequestOptions<{ items: EmojiStructure[] }> {
        return this.get(`/applications/${applicationId}/emojis`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#delete-guild-emoji|Delete Guild Emoji}
     */
    public static deleteGuildEmoji(guildId: Snowflake, emojiId: Snowflake, reason?: string): RestRequestOptions<void> {
        return this.delete(`/guilds/${guildId}/emojis/${emojiId}`, {
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#modify-guild-emoji|Modify Guild Emoji}
     */
    public static modifyGuildEmoji(
        guildId: Snowflake,
        emojiId: Snowflake,
        params: ModifyGuildEmojiJsonParams,
        reason?: string
    ): RestRequestOptions<EmojiStructure> {
        return this.patch(`/guilds/${guildId}/emojis/${emojiId}`, {
            body: JSON.stringify(params),
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#create-guild-emoji|Create Guild Emoji}
     */
    public static createGuildEmoji(
        guildId: Snowflake,
        params: CreateGuildEmojiJsonParams,
        reason?: string
    ): RestRequestOptions<EmojiStructure> {
        return this.post(`/guilds/${guildId}/emojis`, {
            body: JSON.stringify(params),
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji|Get Guild Emoji}
     */
    public static getGuildEmoji(guildId: Snowflake, emojiId: Snowflake): RestRequestOptions<EmojiStructure> {
        return this.get(`/guilds/${guildId}/emojis/${emojiId}`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/emoji#list-guild-emojis|List Guild Emojis}
     */
    public static listGuildEmojis(guildId: Snowflake): RestRequestOptions<EmojiStructure[]> {
        return this.get(`/guilds/${guildId}/emojis`);
    }
}
