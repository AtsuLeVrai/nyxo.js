import { ImageFormats, type Integer, type Snowflake } from "@nyxjs/core";
import type { CdnImageOptions, ImageType } from "../types";

export class Cdn {
    static baseUrl = new URL("https://cdn.discordapp.com");

    static customEmoji(emojiId: Snowflake, options?: CdnImageOptions): string {
        return this.#createUrl(`emojis/${emojiId}`, options?.format, options?.size);
    }

    static guildIcon(guildId: Snowflake, icon: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/icons/${guildId}/${icon}`, options?.format, options?.size);
    }

    static guildSplash(guildId: Snowflake, splash: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/splashes/${guildId}/${splash}`, options?.format, options?.size);
    }

    static guildDiscoverySplash(guildId: Snowflake, splash: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/discovery-splashes/${guildId}/${splash}`, options?.format, options?.size);
    }

    static guildBanner(guildId: Snowflake, banner: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/banners/${guildId}/${banner}`, options?.format, options?.size);
    }

    static userBanner(userId: Snowflake, banner: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/banners/${userId}/${banner}`, options?.format, options?.size);
    }

    static defaultUserAvatar(userId: Snowflake): string {
        const hash = this.#calculateDefaultAvatarHash(userId);
        return this.#createUrl(`/embed/avatars/${hash}`, ImageFormats.PNG);
    }

    static userAvatar(userId: Snowflake, avatar: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/avatars/${userId}/${avatar}`, options?.format, options?.size);
    }

    static guildMemberAvatar(guildId: Snowflake, userId: Snowflake, avatar: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/guilds/${guildId}/users/${userId}/avatars/${avatar}`, options?.format, options?.size);
    }

    static avatarDecoration(avatarDecorationDataAsset: string): string {
        return this.#createUrl(`/avatar-decoration-presets/${avatarDecorationDataAsset}`, ImageFormats.PNG);
    }

    static applicationIcon(applicationId: Snowflake, icon: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/app-icons/${applicationId}/${icon}`, options?.format, options?.size);
    }

    static applicationCover(applicationId: Snowflake, coverImage: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/app-icons/${applicationId}/${coverImage}`, options?.format, options?.size);
    }

    static applicationAsset(applicationId: Snowflake, assetId: Snowflake, options?: CdnImageOptions): string {
        return this.#createUrl(`/app-assets/${applicationId}/${assetId}`, options?.format, options?.size);
    }

    static achievementIcon(
        applicationId: Snowflake,
        achievementId: Snowflake,
        iconHash: string,
        options?: CdnImageOptions
    ): string {
        return this.#createUrl(
            `/app-assets/${applicationId}/achievements/${achievementId}/icons/${iconHash}`,
            options?.format,
            options?.size
        );
    }

    static storePageAsset(applicationId: Snowflake, assetId: Snowflake, options?: CdnImageOptions): string {
        return this.#createUrl(`/app-assets/${applicationId}/store/${assetId}`, options?.format, options?.size);
    }

    static stickerPackBanner(
        applicationId: Snowflake,
        stickerPackBannerAssetId: Snowflake,
        options?: CdnImageOptions
    ): string {
        return this.#createUrl(
            `/app-assets/${applicationId}/store/${stickerPackBannerAssetId}`,
            options?.format,
            options?.size
        );
    }

    static teamIcon(teamId: Snowflake, teamIcon: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/team-icons/${teamId}/${teamIcon}`, options?.format, options?.size);
    }

    static sticker(stickerId: Snowflake, format: ImageType = ImageFormats.PNG): string {
        return this.#createUrl(`/stickers/${stickerId}`, format, undefined, "media.discordapp.net");
    }

    static roleIcon(roleId: Snowflake, roleIcon: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/role-icons/${roleId}/${roleIcon}`, options?.format, options?.size);
    }

    static guildScheduledEventCover(
        guildId: Snowflake,
        scheduledEventId: Snowflake,
        scheduledEventCoverImage: string,
        options?: CdnImageOptions
    ): string {
        return this.#createUrl(
            `/guild-events/${guildId}/${scheduledEventId}/${scheduledEventCoverImage}`,
            options?.format,
            options?.size
        );
    }

    static guildMemberBanner(guildId: Snowflake, userId: Snowflake, banner: string, options?: CdnImageOptions): string {
        return this.#createUrl(`/guilds/${guildId}/users/${userId}/banners/${banner}`, options?.format, options?.size);
    }

    static #createUrl(
        path: string,
        format: ImageType = ImageFormats.PNG,
        size?: Integer,
        hostname: string = this.baseUrl.hostname
    ): string {
        this.#validateSize(size);
        this.#validateGifFormat(path, format, size);

        const url = new URL(this.baseUrl);
        url.hostname = hostname;
        url.pathname += `${path}.${format}`;

        if (size && format !== ImageFormats.GIF) {
            url.searchParams.set("size", size.toString());
        }

        return url.toString();
    }

    static #validateSize(size?: number): void {
        if (size && (size < 16 || size > 4_096)) {
            throw new Error("Size must be between 16 and 4096.");
        }
    }

    static #validateGifFormat(path: string, format: ImageType, size?: Integer): void {
        if (format === ImageFormats.GIF && !this.#isHashGif(path.split("/").pop() ?? "")) {
            throw new Error("The asset is not a gif.");
        }

        if (format === ImageFormats.GIF && size !== undefined) {
            throw new Error("GIFs do not support resizing.");
        }
    }

    static #isHashGif(hash: string): boolean {
        return hash.startsWith("a_");
    }

    static #calculateDefaultAvatarHash(userId: Snowflake): string {
        if (userId.length === 17) {
            return ((BigInt(userId) >> 22n) % 6n).toString();
        } else {
            return (Number.parseInt(userId.slice(-4), 10) % 5).toString();
        }
    }
}
