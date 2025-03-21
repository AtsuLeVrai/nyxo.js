import type { Snowflake } from "@nyxjs/core";

/**
 * Base URLs for Discord CDN resources
 */
const CDN_URLS = {
  /** Primary CDN endpoint for Discord assets */
  BASE: "https://cdn.discordapp.com",
  /** Media proxy used for specific assets like GIF stickers */
  MEDIA_PROXY: "https://media.discordapp.net",
} as const;

/**
 * Valid image sizes for Discord CDN (powers of 2)
 */
const VALID_IMAGE_SIZES = [
  16, 32, 64, 128, 256, 512, 1024, 2048, 4096,
] as const;
type ImageSize = (typeof VALID_IMAGE_SIZES)[number];

/**
 * Valid formats for non-animated images
 */
type RasterFormat = "png" | "jpeg" | "webp";

/**
 * Valid formats for potentially animated images
 */
type AnimatedFormat = "png" | "jpeg" | "webp" | "gif";

/**
 * Valid formats for stickers
 */
type StickerFormat = "png" | "gif" | "json";

/**
 * Base options for all image URL generation
 */
interface BaseImageOptions {
  /** Size in pixels (must be a power of 2 between 16 and 4096) */
  size?: ImageSize;
}

/**
 * Options for standard images
 */
interface ImageOptions extends BaseImageOptions {
  /** Image format to request */
  format?: RasterFormat;
}

/**
 * Options for potentially animated images
 */
interface AnimatedImageOptions extends BaseImageOptions {
  /** Image format to request */
  format?: AnimatedFormat;
  /** Force GIF for animated assets even when not needed */
  animated?: boolean;
}

/**
 * Options for sticker images
 */
interface StickerFormatOptions extends BaseImageOptions {
  /** Sticker format to request */
  format?: StickerFormat;
  /** Whether to use the media proxy for GIF stickers */
  useMediaProxy?: boolean;
}

/**
 * Regular expression to detect animated asset hashes
 */
const ANIMATED_HASH = /^a_/;

/**
 * Utility for generating URLs for Discord CDN resources
 */
export const Cdn = {
  /**
   * Validates that a size value is a valid Discord CDN image size
   *
   * @param size - Size value to validate
   * @returns Validated size or undefined if not provided
   * @throws Error if size is invalid
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
   * Validates that a hash is in a valid format
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
   * Determines the appropriate format for an asset based on its hash and options
   *
   * @param hash - Discord asset hash
   * @param options - Image options
   * @returns Appropriate format string
   */
  getFormatFromHash(
    hash: string,
    options: Partial<AnimatedImageOptions> = {},
  ): string {
    if (options.format) {
      return options.format;
    }

    const isAnimated =
      !!options.animated || (!!hash && ANIMATED_HASH.test(hash));
    return isAnimated ? "gif" : "png";
  },

  /**
   * Builds a complete CDN URL from path segments and options
   *
   * @param path - Array of path segments
   * @param options - Image options
   * @param baseUrl - Base URL to use (default: Discord CDN)
   * @returns Complete URL string
   */
  buildUrl(
    path: string[],
    options: BaseImageOptions = {},
    baseUrl: typeof CDN_URLS.BASE | typeof CDN_URLS.MEDIA_PROXY = CDN_URLS.BASE,
  ): string {
    const url = new URL(path.join("/"), baseUrl);
    const validatedSize = this.validateSize(options.size);

    if (validatedSize) {
      url.searchParams.set("size", validatedSize.toString());
    }

    return url.toString();
  },

  /**
   * Generates URL for a custom emoji
   *
   * @param emojiId - Discord emoji ID
   * @param options - Image options
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
   * Generates URL for a guild's icon
   *
   * @param guildId - Discord guild ID
   * @param hash - Icon asset hash
   * @param options - Image options
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
   * Generates URL for a guild's splash image
   *
   * @param guildId - Discord guild ID
   * @param hash - Splash asset hash
   * @param options - Image options
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
   * Generates URL for a guild's discovery splash image
   *
   * @param guildId - Discord guild ID
   * @param hash - Discovery splash asset hash
   * @param options - Image options
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
   * Generates URL for a guild's banner image
   *
   * @param guildId - Discord guild ID
   * @param hash - Banner asset hash
   * @param options - Image options
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
   * Generates URL for a user's banner image
   *
   * @param userId - Discord user ID
   * @param hash - Banner asset hash
   * @param options - Image options
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
   * Generates URL for the default avatar (legacy users with discriminators)
   *
   * @param discriminator - User discriminator
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
   * Generates URL for the default avatar for users on the new username system
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
   * Generates URL for a user's avatar
   *
   * @param userId - Discord user ID
   * @param hash - Avatar asset hash
   * @param options - Image options
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
   * Generates URL for a guild member's avatar
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @param hash - Avatar asset hash
   * @param options - Image options
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
   * Generates URL for an avatar decoration asset
   *
   * @param assetId - Decoration asset ID
   * @returns URL to the avatar decoration image
   */
  avatarDecoration(assetId: Snowflake): string {
    return this.buildUrl(["avatar-decoration-presets", `${assetId}.png`]);
  },

  /**
   * Generates URL for an application icon
   *
   * @param applicationId - Discord application ID
   * @param hash - Icon asset hash
   * @param options - Image options
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
   * Generates URL for an application cover image
   *
   * @param applicationId - Discord application ID
   * @param hash - Cover asset hash
   * @param options - Image options
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
   * Generates URL for an application asset
   *
   * @param applicationId - Discord application ID
   * @param assetId - Asset ID
   * @param options - Image options
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
   * Generates URL for an achievement icon
   *
   * @param applicationId - Discord application ID
   * @param achievementId - Achievement ID
   * @param iconHash - Icon asset hash
   * @param options - Image options
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
   * Generates URL for a store page asset
   *
   * @param applicationId - Discord application ID
   * @param assetId - Asset ID
   * @param options - Image options
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
   * Generates URL for a sticker pack banner
   *
   * @param bannerId - Banner asset ID
   * @param options - Image options
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
   * Generates URL for a team icon
   *
   * @param teamId - Discord team ID
   * @param hash - Icon asset hash
   * @param options - Image options
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
   * Generates URL for a sticker
   *
   * @param stickerId - Discord sticker ID
   * @param options - Sticker format options
   * @returns URL to the sticker
   */
  sticker(
    stickerId: Snowflake,
    options: Partial<StickerFormatOptions> = {},
  ): string {
    const format = options.format || "png";
    const useMediaProxy = options.useMediaProxy ?? true;

    // Special handling for GIF stickers
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
   * Generates URL for a role icon
   *
   * @param roleId - Discord role ID
   * @param hash - Icon asset hash
   * @param options - Image options
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
   * Generates URL for a scheduled event cover image
   *
   * @param eventId - Discord event ID
   * @param hash - Cover asset hash
   * @param options - Image options
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
   * Generates URL for a guild member banner
   *
   * @param guildId - Discord guild ID
   * @param userId - Discord user ID
   * @param hash - Banner asset hash
   * @param options - Image options
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
   * Generates URL for a message attachment
   *
   * @param channelId - Discord channel ID
   * @param attachmentId - Attachment ID
   * @param filename - Original filename
   * @param options - Image options
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
