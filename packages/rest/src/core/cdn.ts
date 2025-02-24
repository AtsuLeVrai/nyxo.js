import type { Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

/**
 * Base URLs for Discord CDN resources
 */
const CDN_URLS = {
  /** Primary CDN endpoint for Discord assets */
  BASE: "https://cdn.discordapp.com",

  /** Media proxy used for specific assets like GIF stickers */
  MEDIA_PROXY: "https://media.discordapp.net",
} as const;

/** Regular expression to detect animated asset hashes */
const ANIMATED_HASH = /^a_/;

/**
 * Valid image sizes for Discord CDN (powers of 2)
 */
export const ImageSize = z.union([
  z.literal(16),
  z.literal(32),
  z.literal(64),
  z.literal(128),
  z.literal(256),
  z.literal(512),
  z.literal(1024),
  z.literal(2048),
  z.literal(4096),
]);

export type ImageSize = z.infer<typeof ImageSize>;

/**
 * Base options for all image URL generation
 */
export const BaseImageOptions = z.object({
  /** Size in pixels (must be a power of 2 between 16 and 4096) */
  size: ImageSize.optional(),
});

export type BaseImageOptions = z.infer<typeof BaseImageOptions>;

/**
 * Valid formats for non-animated images
 */
export const RasterFormat = z.enum(["png", "jpeg", "webp"]);
export type RasterFormat = z.infer<typeof RasterFormat>;

/**
 * Valid formats for potentially animated images
 */
export const AnimatedFormat = z.enum(["png", "jpeg", "webp", "gif"]);
export type AnimatedFormat = z.infer<typeof AnimatedFormat>;

/**
 * Valid formats for stickers
 */
export const StickerFormat = z.enum(["png", "gif", "json"]);
export type StickerFormat = z.infer<typeof StickerFormat>;

/**
 * Options for standard images
 */
export const ImageOptions = BaseImageOptions.extend({
  /** Image format to request */
  format: RasterFormat.default("png"),
});

export type ImageOptions = z.infer<typeof ImageOptions>;

/**
 * Options for potentially animated images
 */
export const AnimatedImageOptions = BaseImageOptions.extend({
  /** Image format to request */
  format: AnimatedFormat.default("png"),

  /** Force GIF for animated assets even when not needed */
  animated: z.boolean().default(false),
});

export type AnimatedImageOptions = z.infer<typeof AnimatedImageOptions>;

/**
 * Options for sticker images
 */
export const StickerFormatOptions = BaseImageOptions.extend({
  /** Sticker format to request */
  format: StickerFormat.default("png"),

  /** Whether to use the media proxy for GIF stickers */
  useMediaProxy: z.boolean().default(true),
});

export type StickerFormatOptions = z.infer<typeof StickerFormatOptions>;

/**
 * Validates Discord asset hash format
 */
const Hash = z.string().regex(/^[a-fA-F0-9_]+$/, {
  message: "Invalid Discord asset hash format",
});

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
  validateSize(size: number | undefined): number | undefined {
    if (size === undefined) {
      return undefined;
    }

    const result = ImageSize.safeParse(size);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }
    return result.data;
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    if (options?.format) {
      return options.format;
    }

    return ANIMATED_HASH.test(hash) || options?.animated ? "gif" : "png";
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
    options?: z.input<typeof BaseImageOptions>,
    baseUrl: typeof CDN_URLS.BASE | typeof CDN_URLS.MEDIA_PROXY = CDN_URLS.BASE,
  ): string {
    const url = new URL(path.join("/"), baseUrl);
    const validatedSize = this.validateSize(options?.size);
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["emojis", `${emojiId}.${result.data.format}`],
      result.data,
    );
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(["icons", guildId, `${hash}.${format}`], result.data);
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["splashes", guildId, `${hash}.${result.data.format}`],
      result.data,
    );
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["discovery-splashes", guildId, `${hash}.${result.data.format}`],
      result.data,
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(
      ["banners", guildId, `${hash}.${format}`],
      result.data,
    );
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(["banners", userId, `${hash}.${format}`], result.data);
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(["avatars", userId, `${hash}.${format}`], result.data);
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(
      ["guilds", guildId, "users", userId, "avatars", `${hash}.${format}`],
      result.data,
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["app-icons", applicationId, `${hash}.${result.data.format}`],
      result.data,
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["app-icons", applicationId, `${hash}.${result.data.format}`],
      result.data,
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["app-assets", applicationId, `${assetId}.${result.data.format}`],
      result.data,
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(iconHash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      [
        "app-assets",
        applicationId,
        "achievements",
        achievementId,
        "icons",
        `${iconHash}.${result.data.format}`,
      ],
      result.data,
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      [
        "app-assets",
        applicationId,
        "store",
        `${assetId}.${result.data.format}`,
      ],
      result.data,
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      [
        "app-assets",
        "710982414301790216", // Discord's sticker application ID
        "store",
        `${bannerId}.${result.data.format}`,
      ],
      result.data,
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["team-icons", teamId, `${hash}.${result.data.format}`],
      result.data,
    );
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
    options: z.input<typeof StickerFormatOptions> = {},
  ): string {
    const result = StickerFormatOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    // Special handling for GIF stickers
    if (result.data.format === "gif" && result.data.useMediaProxy) {
      return this.buildUrl(
        ["stickers", `${stickerId}.gif`],
        result.data,
        CDN_URLS.MEDIA_PROXY,
      );
    }

    return this.buildUrl(
      ["stickers", `${stickerId}.${result.data.format}`],
      result.data,
    );
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["role-icons", roleId, `${hash}.${result.data.format}`],
      result.data,
    );
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
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["guild-events", eventId, `${hash}.${result.data.format}`],
      result.data,
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(
      ["guilds", guildId, "users", userId, "banners", `${hash}.${format}`],
      result.data,
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
    options: z.input<typeof BaseImageOptions> = {},
  ): string {
    const result = BaseImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["attachments", channelId, attachmentId, encodeURIComponent(filename)],
      result.data,
    );
  },
} as const;
