import type { Snowflake, StickerPackStructure, StickerStructure } from "@nyxjs/core";
import { FileUploadManager } from "../core/FileUploadManager";
import type { FileInput, RestRequestOptions } from "../types";
import { BaseRoutes } from "./base";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params|Modify Guild Sticker JSON Params}
 */
export type ModifyGuildStickerJsonParams = Partial<Pick<StickerStructure, "description" | "name" | "tags">>;

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params|Create Guild Sticker Form Params}
 */
export type CreateGuildStickerFormParams = Pick<StickerStructure, "description" | "name" | "tags"> & {
    /**
     * The sticker file to upload, must be a PNG, APNG, GIF, or Lottie JSON file, max 512 KiB
     */
    file: FileInput;
};

export class StickerRoutes extends BaseRoutes {
    /**
     * @see {@link https://discord.com/developers/docs/resources/sticker#delete-guild-sticker|Delete Guild Sticker}
     */
    public static deleteGuildSticker(
        guildId: Snowflake,
        stickerId: Snowflake,
        reason?: string
    ): RestRequestOptions<void> {
        return this.delete(`/guilds/${guildId}/stickers/${stickerId}`, {
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker|Modify Guild Sticker}
     */
    public static modifyGuildSticker(
        guildId: Snowflake,
        stickerId: Snowflake,
        params: ModifyGuildStickerJsonParams,
        reason?: string
    ): RestRequestOptions<StickerStructure> {
        return this.patch(`/guilds/${guildId}/stickers/${stickerId}`, {
            body: JSON.stringify(params),
            headers: reason ? { "X-Audit-Log-Reason": reason } : undefined,
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker|Create Guild Sticker}
     */
    public static createGuildSticker(
        guildId: Snowflake,
        params: CreateGuildStickerFormParams,
        reason?: string
    ): RestRequestOptions<StickerStructure> {
        const { file, ...restParams } = params;
        const formData = new FileUploadManager();

        formData.addFile("file", file);
        formData.addFields(restParams);

        return this.post(`/guilds/${guildId}/stickers`, {
            body: formData.getFormData(),
            headers: {
                ...formData.getHeaders(),
                ...(reason && { "X-Audit-Log-Reason": reason }),
            },
        });
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/sticker#get-guild-sticker|Get Guild Sticker}
     */
    public static getGuildSticker(guildId: Snowflake, stickerId: Snowflake): RestRequestOptions<StickerStructure> {
        return this.get(`/guilds/${guildId}/stickers/${stickerId}`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/sticker#list-guild-stickers|List Guild Stickers}
     */
    public static listGuildStickers(guildId: Snowflake): RestRequestOptions<StickerStructure[]> {
        return this.get(`/guilds/${guildId}/stickers`);
    }

    /**
     * @see {@link https://discord.com/developers/docs/resources/sticker#get-sticker-pack|Get Sticker Pack}
     */
    public static getStickerPack(stickerPackId: Snowflake): RestRequestOptions<StickerPackStructure[]> {
        return this.get(`/sticker-packs/${stickerPackId}`);
    }
}
