import { ImageFormats, type Integer, type Snowflake } from "@nyxjs/core";

export type CdnImageTypes =
    | ImageFormats.Gif
    | ImageFormats.Jpeg
    | ImageFormats.Lottie
    | ImageFormats.Png
    | ImageFormats.WebP;

export interface CdnImageOptions {
    /**
     * The format of the image.
     */
    format?: CdnImageTypes;
    /**
     * The hostname for the CDN.
     */
    hostname?: string;
    /**
     * The size of the image.
     */
    size?: Integer;
}

export type CdnEndpointTypes =
    | "emoji"
    | "guildIcon"
    | "guildSplash"
    | "guildDiscoverySplash"
    | "guildBanner"
    | "userBanner"
    | "defaultUserAvatar"
    | "userAvatar"
    | "guildMemberAvatar"
    | "avatarDecoration"
    | "applicationIcon"
    | "applicationCover"
    | "applicationAsset"
    | "achievementIcon"
    | "storePageAsset"
    | "stickerPackBanner"
    | "teamIcon"
    | "sticker"
    | "roleIcon"
    | "guildScheduledEventCover"
    | "guildMemberBanner";

interface CdnEndpoint {
    /**
     * The path template for the endpoint
     * Use {paramName} for parameters that will be replaced
     */
    path: string;
    /**
     * The default format for this endpoint if none specified
     */
    defaultFormat?: ImageFormats.Gif | ImageFormats.Jpeg | ImageFormats.Lottie | ImageFormats.Png | ImageFormats.WebP;
    /**
     * Custom hostname for this endpoint
     */
    customHostname?: string;
    /**
     * Whether this endpoint supports and needs GIF validation
     */
    validateGif?: boolean;
}

class CdnError extends Error {
    code: string;

    constructor(message: string, code: string) {
        super(message);
        this.name = "CdnError";
        this.code = code;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const Cdn = {
    defaultFormat: ImageFormats.Png,
    baseUrl: "https://cdn.discordapp.com",
    mediaUrl: "media.discordapp.net",

    sizeConstraints: {
        min: 16,
        max: 4096,
    } satisfies Record<"min" | "max", Integer>,

    endpoints: {
        emoji: {
            path: "emojis/{id}",
        },
        guildIcon: {
            path: "icons/{guildId}/{hash}",
            validateGif: true,
        },
        guildSplash: {
            path: "splashes/{guildId}/{hash}",
        },
        guildDiscoverySplash: {
            path: "discovery-splashes/{guildId}/{hash}",
        },
        guildBanner: {
            path: "banners/{guildId}/{hash}",
            validateGif: true,
        },
        userBanner: {
            path: "banners/{userId}/{hash}",
            validateGif: true,
        },
        defaultUserAvatar: {
            path: "embed/avatars/{hash}",
            defaultFormat: ImageFormats.Png,
        },
        userAvatar: {
            path: "avatars/{userId}/{hash}",
            validateGif: true,
        },
        guildMemberAvatar: {
            path: "guilds/{guildId}/users/{userId}/avatars/{hash}",
            validateGif: true,
        },
        avatarDecoration: {
            path: "avatar-decoration-presets/{hash}",
            defaultFormat: ImageFormats.Png,
        },
        applicationIcon: {
            path: "app-icons/{applicationId}/{hash}",
        },
        applicationCover: {
            path: "app-icons/{applicationId}/{hash}",
        },
        applicationAsset: {
            path: "app-assets/{applicationId}/{assetId}",
        },
        achievementIcon: {
            path: "app-assets/{applicationId}/achievements/{achievementId}/icons/{iconHash}",
        },
        storePageAsset: {
            path: "app-assets/{applicationId}/store/{assetId}",
        },
        stickerPackBanner: {
            path: "app-assets/{applicationId}/store/{bannerAssetId}",
        },
        teamIcon: {
            path: "team-icons/{teamId}/{hash}",
        },
        sticker: {
            path: "stickers/{id}",
            customHostname: "media.discordapp.net",
            defaultFormat: ImageFormats.Png,
        },
        roleIcon: {
            path: "role-icons/{roleId}/{hash}",
        },
        guildScheduledEventCover: {
            path: "guild-events/{guildId}/{eventId}/{hash}",
        },
        guildMemberBanner: {
            path: "guilds/{guildId}/users/{userId}/banners/{hash}",
            validateGif: true,
        },
    } satisfies Record<CdnEndpointTypes, CdnEndpoint>,

    customEmoji(emojiId: Snowflake, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.emoji, { id: emojiId }, options);
    },

    guildIcon(guildId: Snowflake, icon: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.guildIcon, { guildId, hash: icon }, options);
    },

    guildSplash(guildId: Snowflake, splash: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.guildSplash, { guildId, hash: splash }, options);
    },

    guildDiscoverySplash(guildId: Snowflake, splash: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.guildDiscoverySplash, { guildId, hash: splash }, options);
    },

    guildBanner(guildId: Snowflake, banner: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.guildBanner, { guildId, hash: banner }, options);
    },

    userBanner(userId: Snowflake, banner: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.userBanner, { userId, hash: banner }, options);
    },

    defaultUserAvatar(userId: Snowflake): string {
        const hash = Cdn.calculateDefaultAvatarHash(userId);
        return Cdn.buildUrl(Cdn.endpoints.defaultUserAvatar, { hash });
    },

    userAvatar(userId: Snowflake, avatar: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.userAvatar, { userId, hash: avatar }, options);
    },

    guildMemberAvatar(guildId: Snowflake, userId: Snowflake, avatar: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.guildMemberAvatar, { guildId, userId, hash: avatar }, options);
    },

    avatarDecoration(avatarDecorationAsset: string): string {
        return Cdn.buildUrl(Cdn.endpoints.avatarDecoration, { hash: avatarDecorationAsset });
    },

    applicationIcon(applicationId: Snowflake, icon: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.applicationIcon, { applicationId, hash: icon }, options);
    },

    applicationCover(applicationId: Snowflake, coverImage: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.applicationCover, { applicationId, hash: coverImage }, options);
    },

    applicationAsset(applicationId: Snowflake, assetId: Snowflake, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.applicationAsset, { applicationId, assetId }, options);
    },

    achievementIcon(
        applicationId: Snowflake,
        achievementId: Snowflake,
        iconHash: string,
        options?: CdnImageOptions,
    ): string {
        return Cdn.buildUrl(Cdn.endpoints.achievementIcon, { applicationId, achievementId, iconHash }, options);
    },

    storePageAsset(applicationId: Snowflake, assetId: Snowflake, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.storePageAsset, { applicationId, assetId }, options);
    },

    stickerPackBanner(applicationId: Snowflake, bannerAssetId: Snowflake, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.stickerPackBanner, { applicationId, bannerAssetId }, options);
    },

    teamIcon(teamId: Snowflake, icon: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.teamIcon, { teamId, hash: icon }, options);
    },

    sticker(stickerId: Snowflake, format: CdnImageTypes = ImageFormats.Png): string {
        return Cdn.buildUrl(Cdn.endpoints.sticker, { id: stickerId }, { format });
    },

    roleIcon(roleId: Snowflake, icon: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.roleIcon, { roleId, hash: icon }, options);
    },

    guildScheduledEventCover(
        guildId: Snowflake,
        eventId: Snowflake,
        coverImage: string,
        options?: CdnImageOptions,
    ): string {
        return Cdn.buildUrl(Cdn.endpoints.guildScheduledEventCover, { guildId, eventId, hash: coverImage }, options);
    },

    guildMemberBanner(guildId: Snowflake, userId: Snowflake, banner: string, options?: CdnImageOptions): string {
        return Cdn.buildUrl(Cdn.endpoints.guildMemberBanner, { guildId, userId, hash: banner }, options);
    },

    buildUrl(endpoint: CdnEndpoint, params: Record<string, string>, options?: CdnImageOptions): string {
        const format = options?.format ?? endpoint.defaultFormat ?? Cdn.defaultFormat;
        const hostname = endpoint.customHostname ?? new URL(Cdn.baseUrl).hostname;

        Cdn.validateSize(options?.size);
        // @ts-expect-error
        if (endpoint.validateGif && params.hash) {
            // @ts-expect-error
            Cdn.validateGifFormat(params.hash, format, options?.size);
        }

        let path = endpoint.path;
        for (const [key, value] of Object.entries(params)) {
            path = path.replace(`{${key}}`, value);
        }

        const url = new URL(Cdn.baseUrl);
        url.hostname = hostname;
        url.pathname = `/${path}.${format}`;

        const size = options?.size;
        if (size && size > 0 && format !== ImageFormats.Gif) {
            url.searchParams.set("size", size.toString());
        }

        return url.toString();
    },

    validateSize(size?: number): void {
        if (size && (size < Cdn.sizeConstraints.min || size > Cdn.sizeConstraints.max)) {
            throw new CdnError(
                `Size must be between ${Cdn.sizeConstraints.min} and ${Cdn.sizeConstraints.max}`,
                "INVALID_SIZE",
            );
        }
    },

    validateGifFormat(hash: string, format: CdnImageTypes, size?: Integer): void {
        if (format === ImageFormats.Gif && !hash.startsWith("a_")) {
            throw new CdnError("The asset is not a gif", "INVALID_GIF");
        }

        if (format === ImageFormats.Gif && size !== undefined) {
            throw new CdnError("GIFs do not support resizing", "INVALID_GIF_RESIZE");
        }
    },

    calculateDefaultAvatarHash(userId: Snowflake): string {
        return userId.length === 17
            ? ((BigInt(userId) >> 22n) % 6n).toString()
            : (Number.parseInt(userId.slice(-4), 10) % 5).toString();
    },
} as const;
