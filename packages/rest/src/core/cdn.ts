import type { Snowflake } from "@nyxjs/core";

/**
 * Base URLs for Discord CDN resources.
 * Defines the endpoints used to access Discord's content delivery network.
 */
export const CDN_URLS = {
  /**
   * Primary CDN endpoint for Discord assets.
   * Used for most static resources like avatars, emojis, and guild icons.
   */
  BASE: "https://cdn.discordapp.com",

  /**
   * Media proxy used for specific assets like GIF stickers.
   * Provides enhanced processing for animated content.
   */
  MEDIA_PROXY: "https://media.discordapp.net",
} as const;

/**
 * Valid image sizes for Discord CDN (powers of 2).
 * Discord only supports specific sizes to optimize caching and bandwidth.
 */
export const VALID_IMAGE_SIZES = [
  16, 32, 64, 128, 256, 512, 1024, 2048, 4096,
] as const;

/**
 * Valid image size type.
 * Restricted to only the specific power-of-2 values supported by Discord's CDN.
 */
export type ImageSize = (typeof VALID_IMAGE_SIZES)[number];

/**
 * Valid formats for non-animated images.
 * Standard image formats supported for static content.
 */
export type RasterFormat = "png" | "jpeg" | "webp";

/**
 * Valid formats for potentially animated images.
 * Includes all static formats plus GIF for animations.
 */
export type AnimatedFormat = "png" | "jpeg" | "webp" | "gif";

/**
 * Valid formats for stickers.
 * Includes image formats plus Lottie JSON for animated stickers.
 */
export type StickerFormat = "png" | "gif" | "json";

/**
 * Base options for all image URL generation.
 * Common parameters that apply to all CDN requests.
 */
export interface BaseImageOptions {
  /**
   * Size in pixels (must be a power of 2 between 16 and 4096).
   * Controls the dimensions of the returned image.
   */
  size?: ImageSize;
}

/**
 * Options for standard images.
 * Used for static resources like guild icons or splashes.
 */
export interface ImageOptions extends BaseImageOptions {
  /**
   * Image format to request.
   * Determines the file format of the returned image.
   */
  format?: RasterFormat;
}

/**
 * Options for potentially animated images.
 * Used for resources that may be animated like avatars or banners.
 */
export interface AnimatedImageOptions extends BaseImageOptions {
  /**
   * Image format to request.
   * Determines the file format of the returned image.
   */
  format?: AnimatedFormat;

  /**
   * Force GIF for animated assets even when not needed.
   * When true, always returns GIF format for animated resources.
   */
  animated?: boolean;
}

/**
 * Options for sticker images.
 * Used specifically for Discord stickers which have unique format options.
 */
export interface StickerFormatOptions extends BaseImageOptions {
  /**
   * Sticker format to request.
   * Determines the file format of the returned sticker.
   */
  format?: StickerFormat;

  /**
   * Whether to use the media proxy for GIF stickers.
   * Controls which CDN endpoint is used for animated stickers.
   */
  useMediaProxy?: boolean;
}

/**
 * Regular expression to detect animated asset hashes.
 * Discord prefixes animated asset hashes with "a_".
 */
export const ANIMATED_HASH = /^a_/;

/**
 * Utility for generating URLs for Discord CDN resources.
 * Provides methods to construct properly formatted URLs for all Discord asset types.
 */
export const Cdn = {
  /**
   * Validates that a size value is a valid Discord CDN image size.
   * Discord only supports specific power-of-2 sizes for optimization.
   *
   * @param size - Size value to validate
   * @returns Validated size or undefined if not provided
   * @throws {Error} Error if size is invalid
   */
  validateSize(size?: number): number | undefined {
    if (size === undefined) {
      return undefined;
    }

    if (!VALID_IMAGE_SIZES.includes(size as ImageSize)) {
      throw new Error(
        `Invalid image size: ${size}. Must be one of: ${VALID_IMAGE_SIZES.join(", ")}`,
      );
    }

    return size;
  },

  /**
   * Validates that a hash is in a valid format.
   * Ensures the hash follows Discord's asset hash format requirements.
   *
   * @param hash - Discord asset hash to validate
   * @throws Error if hash is invalid
   */
  validateHash(hash: string): void {
    if (!(hash.match(/^[a-fA-F0-9_]+$/) || hash.match(/^a_[a-fA-F0-9_]+$/))) {
      throw new Error("Invalid Discord asset hash format");
    }
  },

  /**
   * Determines the appropriate format for an asset based on its hash and options.
   * Handles animated vs static resources automatically.
   *
   * @param hash - Discord asset hash
   * @param options - Image options with format preferences
   * @returns Appropriate format string (e.g., "png", "gif")
   */
  getFormatFromHash(
    hash: string,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    // Use explicitly specified format if provided
    if (options.format) {
      return options.format;
    }

    // Check if resource is animated (by hash prefix or forced option)
    const isAnimated =
      !!options.animated || (!!hash && ANIMATED_HASH.test(hash));
    return isAnimated ? "gif" : "png";
  },

  /**
   * Builds a complete CDN URL from path segments and options.
   * Core method used by all other URL generators.
   *
   * @param path - Array of path segments to join
   * @param options - Image options like size
   * @param baseUrl - Base URL to use (default: Discord CDN)
   * @returns Complete URL string for the resource
   */
  buildUrl(
    path: string[],
    options: BaseImageOptions = {},
    baseUrl: typeof CDN_URLS.BASE | typeof CDN_URLS.MEDIA_PROXY = CDN_URLS.BASE,
  ): string {
    const url = new URL(path.join("/"), baseUrl);
    const validatedSize = this.validateSize(options.size);

    // Add size query parameter if provided
    if (validatedSize) {
      url.searchParams.set("size", validatedSize.toString());
    }

    return url.toString();
  },

  /**
   * Generates URL for a custom emoji.
   * Emojis can be either static or animated.
   *
   * @param emojiId - Discord emoji ID
   * @param options - Image options (format, size, etc.)
   * @returns URL to the emoji image
   */
  emoji(
    emojiId: Snowflake,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    const format = options.format || "png";
    return this.buildUrl(["emojis", `${emojiId}.${format}`], options);
  },

  /**
   * Generates URL for a guild's icon.
   * Guild icons can be static or animated (GIF).
   *
   * @param guildId - Discord guild ID
   * @param hash - Icon asset hash
   * @param options - Image options (format, size, animation preference)
   * @returns URL to the guild icon
   */
  guildIcon(
    guildId: Snowflake,
    hash: string,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(["icons", guildId, `${hash}.${format}`], options);
  },

  /**
   * Generates URL for a guild's splash image.
   * Splash images appear on the guild invite screen.
   *
   * @param guildId - Discord guild ID
   * @param hash - Splash asset hash
   * @param options - Image options (format, size)
   * @returns URL to the guild splash image
   */
  guildSplash(
    guildId: Snowflake,
    hash: string,
    options: Partial<ImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = options.format || "png";
    return this.buildUrl(["splashes", guildId, `${hash}.${format}`], options);
  },

  /**
   * Generates URL for a guild's discovery splash image.
   * Discovery splash images appear in the server discovery section.
   *
   * @param guildId - Discord guild ID
   * @param hash - Discovery splash asset hash
   * @param options - Image options (format, size)
   * @returns URL to the guild discovery splash image
   */
  guildDiscoverySplash(
    guildId: Snowflake,
    hash: string,
    options: Partial<ImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = options.format || "png";
    return this.buildUrl(
      ["discovery-splashes", guildId, `${hash}.${format}`],
      options,
    );
  },

  /**
   * Generates URL for a guild's banner image.
   * Banners appear at the top of the guild channel list.
   *
   * @param guildId - Discord guild ID
   * @param hash - Banner asset hash
   * @param options - Image options (format, size, animation preference)
   * @returns URL to the guild banner
   */
  guildBanner(
    guildId: Snowflake,
    hash: string,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(["banners", guildId, `${hash}.${format}`], options);
  },

  /**
   * Generates URL for a user's banner image.
   * User profile banners appear on the user profile.
   *
   * @param userId - Discord user ID
   * @param hash - Banner asset hash
   * @param options - Image options (format, size, animation preference)
   * @returns URL to the user banner
   */
  userBanner(
    userId: Snowflake,
    hash: string,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(["banners", userId, `${hash}.${format}`], options);
  },

  /**
   * Generates URL for the default avatar (legacy users with discriminators).
   * Returns one of five colors based on the discriminator.
   *
   * @param discriminator - User discriminator (four digits after #)
   * @returns URL to the default avatar image
   */
  defaultUserAvatar(discriminator: string | number): string {
    const index =
      typeof discriminator === "string"
        ? Number(discriminator) % 5
        : discriminator % 5;
    return this.buildUrl(["embed/avatars", `${index}.png`]);
  },

  /**
   * Generates URL for the default avatar for users on the new username system.
   * Returns one of six colors based on the user ID.
   *
   * @param userId - Discord user ID
   * @returns URL to the default avatar image
   */
  defaultUserAvatarSystem(userId: Snowflake): string {
    // Convert to BigInt, shift right 22 bits, mod 6
    const index = Number((BigInt(userId) >> 22n) % 6n);
    return this.buildUrl(["embed/avatars", `${index}.png`]);
  },

  /**
   * Generates URL for a user's avatar.
   * User avatars can be static or animated (GIF).
   *
   * @param userId - Discord user ID
   * @param hash - Avatar asset hash
   * @param options - Image options (format, size, animation preference)
   * @returns URL to the user avatar
   */
  userAvatar(
    userId: Snowflake,
    hash: string,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(["avatars", userId, `${hash}.${format}`], options);
  },

  /**
   * Generates URL for a guild member's avatar.
   * Guild-specific avatars override the user's global avatar within that guild.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @param hash - Avatar asset hash
   * @param options - Image options (format, size, animation preference)
   * @returns URL to the guild member avatar
   */
  guildMemberAvatar(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(
      ["guilds", guildId, "users", userId, "avatars", `${hash}.${format}`],
      options,
    );
  },

  /**
   * Generates URL for an avatar decoration asset.
   * Avatar decorations are frames or effects around user avatars.
   *
   * @param assetId - Decoration asset ID
   * @returns URL to the avatar decoration image
   */
  avatarDecoration(assetId: Snowflake): string {
    return this.buildUrl(["avatar-decoration-presets", `${assetId}.png`]);
  },

  /**
   * Generates URL for an application icon.
   * Application icons appear in the Discord app directory.
   *
   * @param applicationId - Discord application ID
   * @param hash - Icon asset hash
   * @param options - Image options (format, size)
   * @returns URL to the application icon
   */
  applicationIcon(
    applicationId: Snowflake,
    hash: string,
    options: Partial<ImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = options.format || "png";
    return this.buildUrl(
      ["app-icons", applicationId, `${hash}.${format}`],
      options,
    );
  },

  /**
   * Generates URL for an application cover image.
   * Cover images appear as a banner in the Discord app directory.
   *
   * @param applicationId - Discord application ID
   * @param hash - Cover asset hash
   * @param options - Image options (format, size)
   * @returns URL to the application cover image
   */
  applicationCover(
    applicationId: Snowflake,
    hash: string,
    options: Partial<ImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = options.format || "png";
    return this.buildUrl(
      ["app-icons", applicationId, `${hash}.${format}`],
      options,
    );
  },

  /**
   * Generates URL for an application asset.
   * Application assets are custom images used by the application.
   *
   * @param applicationId - Discord application ID
   * @param assetId - Asset ID
   * @param options - Image options (format, size)
   * @returns URL to the application asset
   */
  applicationAsset(
    applicationId: Snowflake,
    assetId: string,
    options: Partial<ImageOptions> = {},
  ): string {
    const format = options.format || "png";
    return this.buildUrl(
      ["app-assets", applicationId, `${assetId}.${format}`],
      options,
    );
  },

  /**
   * Generates URL for an achievement icon.
   * Achievement icons appear in the Discord achievements UI.
   *
   * @param applicationId - Discord application ID
   * @param achievementId - Achievement ID
   * @param iconHash - Icon asset hash
   * @param options - Image options (format, size)
   * @returns URL to the achievement icon
   */
  achievementIcon(
    applicationId: Snowflake,
    achievementId: Snowflake,
    iconHash: string,
    options: Partial<ImageOptions> = {},
  ): string {
    this.validateHash(iconHash);
    const format = options.format || "png";
    return this.buildUrl(
      [
        "app-assets",
        applicationId,
        "achievements",
        achievementId,
        "icons",
        `${iconHash}.${format}`,
      ],
      options,
    );
  },

  /**
   * Generates URL for a store page asset.
   * Store page assets are images used in the Discord store listing.
   *
   * @param applicationId - Discord application ID
   * @param assetId - Asset ID
   * @param options - Image options (format, size)
   * @returns URL to the store page asset
   */
  storePageAsset(
    applicationId: Snowflake,
    assetId: string,
    options: Partial<ImageOptions> = {},
  ): string {
    const format = options.format || "png";
    return this.buildUrl(
      ["app-assets", applicationId, "store", `${assetId}.${format}`],
      options,
    );
  },

  /**
   * Generates URL for a sticker pack banner.
   * Sticker pack banners appear in the sticker shop.
   *
   * @param bannerId - Banner asset ID
   * @param options - Image options (format, size)
   * @returns URL to the sticker pack banner
   */
  stickerPackBanner(
    bannerId: string,
    options: Partial<ImageOptions> = {},
  ): string {
    const format = options.format || "png";
    return this.buildUrl(
      [
        "app-assets",
        "710982414301790216", // Discord's sticker application ID
        "store",
        `${bannerId}.${format}`,
      ],
      options,
    );
  },

  /**
   * Generates URL for a team icon.
   * Team icons appear in the Discord developer portal.
   *
   * @param teamId - Discord team ID
   * @param hash - Icon asset hash
   * @param options - Image options (format, size)
   * @returns URL to the team icon
   */
  teamIcon(
    teamId: Snowflake,
    hash: string,
    options: Partial<ImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = options.format || "png";
    return this.buildUrl(["team-icons", teamId, `${hash}.${format}`], options);
  },

  /**
   * Generates URL for a sticker.
   * Stickers can be static (PNG), animated (GIF), or Lottie animations (JSON).
   *
   * @param stickerId - Discord sticker ID
   * @param options - Sticker format options (format, size, media proxy preference)
   * @returns URL to the sticker
   */
  sticker(
    stickerId: Snowflake,
    options: Partial<StickerFormatOptions> = {},
  ): string {
    const format = options.format || "png";
    const useMediaProxy = options.useMediaProxy ?? true;

    // Special handling for GIF stickers - use media proxy for better performance
    if (format === "gif" && useMediaProxy) {
      return this.buildUrl(
        ["stickers", `${stickerId}.gif`],
        options,
        CDN_URLS.MEDIA_PROXY,
      );
    }

    return this.buildUrl(["stickers", `${stickerId}.${format}`], options);
  },

  /**
   * Generates URL for a role icon.
   * Role icons appear next to role names in the member list.
   *
   * @param roleId - Discord role ID
   * @param hash - Icon asset hash
   * @param options - Image options (format, size)
   * @returns URL to the role icon
   */
  roleIcon(
    roleId: Snowflake,
    hash: string,
    options: Partial<ImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = options.format || "png";
    return this.buildUrl(["role-icons", roleId, `${hash}.${format}`], options);
  },

  /**
   * Generates URL for a scheduled event cover image.
   * Event covers appear in the event details and listing.
   *
   * @param eventId - Discord event ID
   * @param hash - Cover asset hash
   * @param options - Image options (format, size)
   * @returns URL to the event cover image
   */
  guildScheduledEventCover(
    eventId: Snowflake,
    hash: string,
    options: Partial<ImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = options.format || "png";
    return this.buildUrl(
      ["guild-events", eventId, `${hash}.${format}`],
      options,
    );
  },

  /**
   * Generates URL for a guild member banner.
   * Guild-specific member banners appear on the user profile within that guild.
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @param hash - Banner asset hash
   * @param options - Image options (format, size, animation preference)
   * @returns URL to the guild member banner
   */
  guildMemberBanner(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(
      ["guilds", guildId, "users", userId, "banners", `${hash}.${format}`],
      options,
    );
  },

  /**
   * Generates URL for a message attachment.
   * Attachments are files uploaded to messages.
   *
   * @param channelId - Discord channel ID where the message was sent
   * @param attachmentId - Attachment ID
   * @param filename - Original filename of the attachment
   * @param options - Image options (size, but format is determined by the original file)
   * @returns URL to the attachment
   */
  attachment(
    channelId: Snowflake,
    attachmentId: Snowflake,
    filename: string,
    options: Partial<BaseImageOptions> = {},
  ): string {
    return this.buildUrl(
      ["attachments", channelId, attachmentId, encodeURIComponent(filename)],
      options,
    );
  },
} as const;
