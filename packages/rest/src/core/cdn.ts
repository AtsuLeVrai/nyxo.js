import type { Snowflake } from "@nyxojs/core";
import { z } from "zod/v4";

/**
 * Type representing a complete URL to the Discord CDN.
 * This base type is extended by all other specific CDN URL types.
 *
 * @remarks
 * Discord uses two primary domains for its content delivery network:
 * - cdn.discordapp.com for most static resources
 * - media.discordapp.net for certain animated content
 *
 * @example
 * ```typescript
 * // Example of a valid Discord CDN URL
 * const avatarUrl: CdnUrl = "https://cdn.discordapp.com/avatars/123456789012345678/abcdef1234567890.png?size=1024";
 * ```
 */
export type CdnUrl =
  | `https://cdn.discordapp.com/${string}`
  | `https://media.discordapp.net/${string}`;

/**
 * Type representing an emoji URL on the Discord CDN.
 *
 * @remarks
 * Emoji URLs follow a specific structure with the emoji ID and format.
 * They can optionally include a size parameter.
 *
 * @example
 * ```typescript
 * // Example of a valid emoji URL
 * const emojiUrl: EmojiUrl = "https://cdn.discordapp.com/emojis/123456789012345678.png?size=128";
 * ```
 */
export type EmojiUrl =
  `https://cdn.discordapp.com/emojis/${Snowflake}.${AnimatedFormat}${string}`;

/**
 * Type representing a guild icon URL on the Discord CDN.
 *
 * @remarks
 * Guild icon URLs include the guild ID and the icon hash, followed by the format.
 * Animated icons will have a hash that starts with "a_" and can be retrieved in GIF format.
 *
 * @example
 * ```typescript
 * // Example of a valid guild icon URL
 * const iconUrl: GuildIconUrl = "https://cdn.discordapp.com/icons/123456789012345678/abcdef1234567890.png?size=256";
 * ```
 */
export type GuildIconUrl =
  `https://cdn.discordapp.com/icons/${Snowflake}/${string}.${AnimatedFormat}${string}`;

/**
 * Type representing a guild splash URL on the Discord CDN.
 *
 * @remarks
 * Splash images appear on the guild invite screen.
 * These are always static images and don't support animation.
 *
 * @example
 * ```typescript
 * // Example of a valid guild splash URL
 * const splashUrl: GuildSplashUrl = "https://cdn.discordapp.com/splashes/123456789012345678/abcdef1234567890.png?size=2048";
 * ```
 */
export type GuildSplashUrl =
  `https://cdn.discordapp.com/splashes/${Snowflake}/${string}.${RasterFormat}${string}`;

/**
 * Type representing a guild discovery splash URL on the Discord CDN.
 *
 * @remarks
 * Discovery splash images appear in the server discovery section.
 * These are always static images and don't support animation.
 *
 * @example
 * ```typescript
 * // Example of a valid guild discovery splash URL
 * const discoverySplashUrl: GuildDiscoverySplashUrl = "https://cdn.discordapp.com/discovery-splashes/123456789012345678/abcdef1234567890.png?size=512";
 * ```
 */
export type GuildDiscoverySplashUrl =
  `https://cdn.discordapp.com/discovery-splashes/${Snowflake}/${string}.${RasterFormat}${string}`;

/**
 * Type representing a guild banner URL on the Discord CDN.
 *
 * @remarks
 * Banner images appear at the top of the guild channel list.
 * These can be animated if the guild has an animated banner.
 *
 * @example
 * ```typescript
 * // Example of a valid guild banner URL
 * const bannerUrl: GuildBannerUrl = "https://cdn.discordapp.com/banners/123456789012345678/abcdef1234567890.png?size=1024";
 * ```
 */
export type GuildBannerUrl =
  `https://cdn.discordapp.com/banners/${Snowflake}/${string}.${AnimatedFormat}${string}`;

/**
 * Type representing a user banner URL on the Discord CDN.
 *
 * @remarks
 * User banner images appear on the user profile.
 * These can be animated if the user has an animated banner.
 *
 * @example
 * ```typescript
 * // Example of a valid user banner URL
 * const userBannerUrl: UserBannerUrl = "https://cdn.discordapp.com/banners/123456789012345678/abcdef1234567890.png?size=600";
 * ```
 */
export type UserBannerUrl =
  `https://cdn.discordapp.com/banners/${Snowflake}/${string}.${AnimatedFormat}${string}`;

/**
 * Type representing a default user avatar URL on the Discord CDN.
 *
 * @remarks
 * Default avatars are assigned to users who haven't uploaded a custom avatar.
 * The avatar is chosen based on the user's discriminator or ID.
 *
 * @example
 * ```typescript
 * // Example of a valid default user avatar URL
 * const defaultAvatarUrl: DefaultUserAvatarUrl = "https://cdn.discordapp.com/embed/avatars/3.png";
 * ```
 */
export type DefaultUserAvatarUrl =
  `https://cdn.discordapp.com/embed/avatars/${number}.png`;

/**
 * Type representing a user avatar URL on the Discord CDN.
 *
 * @remarks
 * User avatar URLs include the user ID and the avatar hash, followed by the format.
 * Animated avatars will have a hash that starts with "a_" and can be retrieved in GIF format.
 *
 * @example
 * ```typescript
 * // Example of a valid user avatar URL
 * const avatarUrl: UserAvatarUrl = "https://cdn.discordapp.com/avatars/123456789012345678/abcdef1234567890.png?size=1024";
 * ```
 */
export type UserAvatarUrl =
  `https://cdn.discordapp.com/avatars/${Snowflake}/${string}.${AnimatedFormat}${string}`;

/**
 * Type representing a guild member avatar URL on the Discord CDN.
 *
 * @remarks
 * Guild member avatars are server-specific avatars that override the user's global avatar.
 * These can be animated if the member has an animated avatar for that guild.
 *
 * @example
 * ```typescript
 * // Example of a valid guild member avatar URL
 * const memberAvatarUrl: GuildMemberAvatarUrl = "https://cdn.discordapp.com/guilds/123456789012345678/users/876543210987654321/avatars/abcdef1234567890.png?size=128";
 * ```
 */
export type GuildMemberAvatarUrl =
  `https://cdn.discordapp.com/guilds/${Snowflake}/users/${Snowflake}/avatars/${string}.${AnimatedFormat}${string}`;

/**
 * Type representing an avatar decoration URL on the Discord CDN.
 *
 * @remarks
 * Avatar decorations are frames or effects around user avatars.
 * These are provided as PNG images that can be overlaid on avatars.
 *
 * @example
 * ```typescript
 * // Example of a valid avatar decoration URL
 * const decorationUrl: AvatarDecorationUrl = "https://cdn.discordapp.com/avatar-decoration-presets/123456789012345678.png";
 * ```
 */
export type AvatarDecorationUrl =
  `https://cdn.discordapp.com/avatar-decoration-presets/${Snowflake}.png`;

/**
 * Type representing an application icon URL on the Discord CDN.
 *
 * @remarks
 * Application icons appear in the Discord app directory.
 * These are always static images and don't support animation.
 *
 * @example
 * ```typescript
 * // Example of a valid application icon URL
 * const appIconUrl: ApplicationIconUrl = "https://cdn.discordapp.com/app-icons/123456789012345678/abcdef1234567890.png?size=256";
 * ```
 */
export type ApplicationIconUrl =
  `https://cdn.discordapp.com/app-icons/${Snowflake}/${string}.${RasterFormat}${string}`;

/**
 * Type representing an application cover URL on the Discord CDN.
 *
 * @remarks
 * Cover images appear as a banner in the Discord app directory.
 * These are always static images and don't support animation.
 *
 * @example
 * ```typescript
 * // Example of a valid application cover URL
 * const appCoverUrl: ApplicationCoverUrl = "https://cdn.discordapp.com/app-icons/123456789012345678/abcdef1234567890.png?size=1024";
 * ```
 */
export type ApplicationCoverUrl =
  `https://cdn.discordapp.com/app-icons/${Snowflake}/${string}.${RasterFormat}${string}`;

/**
 * Type representing an application asset URL on the Discord CDN.
 *
 * @remarks
 * Application assets are custom images used by the application.
 * These can be referenced in rich presence, application commands, etc.
 *
 * @example
 * ```typescript
 * // Example of a valid application asset URL
 * const assetUrl: ApplicationAssetUrl = "https://cdn.discordapp.com/app-assets/123456789012345678/abcdef1234567890.png?size=512";
 * ```
 */
export type ApplicationAssetUrl =
  `https://cdn.discordapp.com/app-assets/${Snowflake}/${string}.${RasterFormat}${string}`;

/**
 * Type representing an achievement icon URL on the Discord CDN.
 *
 * @remarks
 * Achievement icons appear in the Discord achievements UI.
 * These are static images representing game achievements.
 *
 * @example
 * ```typescript
 * // Example of a valid achievement icon URL
 * const achievementUrl: AchievementIconUrl = "https://cdn.discordapp.com/app-assets/123456789012345678/achievements/876543210987654321/icons/abcdef1234567890.png?size=128";
 * ```
 */
export type AchievementIconUrl =
  `https://cdn.discordapp.com/app-assets/${Snowflake}/achievements/${Snowflake}/icons/${string}.${RasterFormat}${string}`;

/**
 * Type representing a store page asset URL on the Discord CDN.
 *
 * @remarks
 * Store page assets are images used in the Discord store listing.
 * These include various promotional images for apps and games.
 *
 * @example
 * ```typescript
 * // Example of a valid store page asset URL
 * const storeAssetUrl: StorePageAssetUrl = "https://cdn.discordapp.com/app-assets/123456789012345678/store/abcdef1234567890.png?size=1024";
 * ```
 */
export type StorePageAssetUrl =
  `https://cdn.discordapp.com/app-assets/${Snowflake}/store/${string}.${RasterFormat}${string}`;

/**
 * Type representing a sticker pack banner URL on the Discord CDN.
 *
 * @remarks
 * Sticker pack banners appear in the sticker shop.
 * These are static images representing a collection of stickers.
 * All sticker packs use Discord's official sticker application ID (710982414301790216).
 *
 * @example
 * ```typescript
 * // Example of a valid sticker pack banner URL
 * const stickerPackUrl: StickerPackBannerUrl = "https://cdn.discordapp.com/app-assets/710982414301790216/store/abcdef1234567890.png?size=512";
 * ```
 */
export type StickerPackBannerUrl =
  `https://cdn.discordapp.com/app-assets/710982414301790216/store/${string}.${RasterFormat}${string}`;

/**
 * Type representing a team icon URL on the Discord CDN.
 *
 * @remarks
 * Team icons appear in the Discord developer portal.
 * These are static images representing a development team.
 *
 * @example
 * ```typescript
 * // Example of a valid team icon URL
 * const teamIconUrl: TeamIconUrl = "https://cdn.discordapp.com/team-icons/123456789012345678/abcdef1234567890.png?size=256";
 * ```
 */
export type TeamIconUrl =
  `https://cdn.discordapp.com/team-icons/${Snowflake}/${string}.${RasterFormat}${string}`;

/**
 * Type representing a sticker URL on the Discord CDN.
 *
 * @remarks
 * Stickers can be static (PNG), animated (GIF), or Lottie animations (JSON).
 * Animated GIF stickers may use the media proxy domain for better performance.
 *
 * @example
 * ```typescript
 * // Example of a valid sticker URL (static)
 * const staticStickerUrl: StickerUrl = "https://cdn.discordapp.com/stickers/123456789012345678.png?size=320";
 *
 * // Example of a valid sticker URL (animated, using media proxy)
 * const animatedStickerUrl: StickerUrl = "https://media.discordapp.net/stickers/123456789012345678.gif?size=320";
 * ```
 */
export type StickerUrl =
  | `https://cdn.discordapp.com/stickers/${Snowflake}.${StickerFormat}${string}`
  | `https://media.discordapp.net/stickers/${Snowflake}.gif${string}`;

/**
 * Type representing a role icon URL on the Discord CDN.
 *
 * @remarks
 * Role icons appear next to role names in the member list.
 * These are static images assigned to server roles.
 *
 * @example
 * ```typescript
 * // Example of a valid role icon URL
 * const roleIconUrl: RoleIconUrl = "https://cdn.discordapp.com/role-icons/123456789012345678/abcdef1234567890.png?size=64";
 * ```
 */
export type RoleIconUrl =
  `https://cdn.discordapp.com/role-icons/${Snowflake}/${string}.${RasterFormat}${string}`;

/**
 * Type representing a guild scheduled event cover URL on the Discord CDN.
 *
 * @remarks
 * Event covers appear in the event details and listing.
 * These are static images representing scheduled server events.
 *
 * @example
 * ```typescript
 * // Example of a valid event cover URL
 * const eventCoverUrl: GuildScheduledEventCoverUrl = "https://cdn.discordapp.com/guild-events/123456789012345678/abcdef1234567890.png?size=512";
 * ```
 */
export type GuildScheduledEventCoverUrl =
  `https://cdn.discordapp.com/guild-events/${Snowflake}/${string}.${RasterFormat}${string}`;

/**
 * Type representing a guild member banner URL on the Discord CDN.
 *
 * @remarks
 * Guild-specific member banners appear on the user profile within that guild.
 * These can be animated if the member has an animated banner for that guild.
 *
 * @example
 * ```typescript
 * // Example of a valid guild member banner URL
 * const memberBannerUrl: GuildMemberBannerUrl = "https://cdn.discordapp.com/guilds/123456789012345678/users/876543210987654321/banners/abcdef1234567890.png?size=512";
 * ```
 */
export type GuildMemberBannerUrl =
  `https://cdn.discordapp.com/guilds/${Snowflake}/users/${Snowflake}/banners/${string}.${AnimatedFormat}${string}`;

/**
 * Type representing an attachment URL on the Discord CDN.
 *
 * @remarks
 * Attachments are files uploaded to messages.
 * The URL structure includes the channel ID, attachment ID, and the original filename.
 *
 * @example
 * ```typescript
 * // Example of a valid attachment URL
 * const attachmentUrl: AttachmentUrl = "https://cdn.discordapp.com/attachments/123456789012345678/876543210987654321/example.png?size=1024";
 * ```
 */
export type AttachmentUrl =
  `https://cdn.discordapp.com/attachments/${Snowflake}/${Snowflake}/${string}`;

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
 * Schema for validating image sizes against Discord's supported values.
 * Ensures only the specific power-of-2 values are accepted.
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

/**
 * Valid image size type.
 * Restricted to only the specific power-of-2 values supported by Discord's CDN.
 */
export type ImageSize = z.infer<typeof ImageSize>;

/**
 * Schema for validating asset hashes in Discord's format.
 * Discord asset hashes follow specific patterns for static and animated assets.
 */
export const AssetHash = z
  .string()
  .refine(
    (hash) => /^[a-fA-F0-9_]+$/.test(hash) || /^a_[a-fA-F0-9_]+$/.test(hash),
    {
      message: "Invalid Discord asset hash format",
    },
  );

/**
 * Schema for non-animated image formats.
 * Validates standard image formats supported for static content.
 */
export const RasterFormat = z.enum(["png", "jpeg", "webp"]);
export type RasterFormat = z.infer<typeof RasterFormat>;

/**
 * Schema for potentially animated image formats.
 * Validates formats for images that may be animated.
 */
export const AnimatedFormat = z.enum(["png", "jpeg", "webp", "gif"]);
export type AnimatedFormat = z.infer<typeof AnimatedFormat>;

/**
 * Schema for sticker formats.
 * Validates formats specific to Discord stickers.
 */
export const StickerFormat = z.enum(["png", "gif", "json"]);
export type StickerFormat = z.infer<typeof StickerFormat>;

/**
 * Base schema for all image URL generation options.
 * Validates common parameters that apply to all CDN requests.
 */
export const BaseImageOptions = z.object({
  /**
   * Size in pixels (must be a power of 2 between 16 and 4096).
   * Controls the dimensions of the returned image.
   */
  size: ImageSize.optional(),
});

/**
 * Base options for all image URL generation.
 * Common parameters that apply to all CDN requests.
 */
export type BaseImageOptions = z.infer<typeof BaseImageOptions>;

/**
 * Schema for standard image options.
 * Validates options for static resources like guild icons or splashes.
 */
export const ImageOptions = BaseImageOptions.extend({
  /**
   * Image format to request.
   * Determines the file format of the returned image.
   */
  format: RasterFormat.default("png"),
});

/**
 * Options for standard images.
 * Used for static resources like guild icons or splashes.
 */
export type ImageOptions = z.infer<typeof ImageOptions>;

/**
 * Schema for potentially animated image options.
 * Validates options for resources that may be animated.
 */
export const AnimatedImageOptions = BaseImageOptions.extend({
  /**
   * Image format to request.
   * Determines the file format of the returned image.
   */
  format: AnimatedFormat.optional(),

  /**
   * Force GIF for animated assets even when not needed.
   * When true, always returns GIF format for animated resources.
   */
  animated: z.boolean().optional(),
});

/**
 * Options for potentially animated images.
 * Used for resources that may be animated like avatars or banners.
 */
export type AnimatedImageOptions = z.infer<typeof AnimatedImageOptions>;

/**
 * Schema for sticker format options.
 * Validates options specific to Discord stickers.
 */
export const StickerFormatOptions = BaseImageOptions.extend({
  /**
   * Sticker format to request.
   * Determines the file format of the returned sticker.
   */
  format: StickerFormat.default("png"),

  /**
   * Whether to use the media proxy for GIF stickers.
   * Controls which CDN endpoint is used for animated stickers.
   */
  useMediaProxy: z.boolean().default(true),
});

/**
 * Options for sticker images.
 * Used specifically for Discord stickers which have unique format options.
 */
export type StickerFormatOptions = z.infer<typeof StickerFormatOptions>;

/**
 * Regular expression to detect animated asset hashes.
 * Discord prefixes animated asset hashes with "a_".
 */
export const ANIMATED_HASH = /^a_/;

/**
 * Validates options using the provided Zod schema.
 * Provides consistent error handling for all CDN option validations.
 *
 * @template T - The Zod schema type
 * @param schema - The Zod schema to validate against
 * @param input - The input to validate
 * @returns The validated and parsed input
 * @throws {Error} Error with user-friendly message if validation fails
 * @private
 */
function validateWithZod<T extends z.ZodType>(
  schema: T,
  input: unknown,
): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(z.prettifyError(result.error));
  }

  return result.data;
}

/**
 * Utility for generating URLs for Discord CDN resources.
 * Provides methods to construct properly formatted URLs for all Discord asset types.
 */
export const Cdn = {
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
    options: AnimatedImageOptions,
  ): AnimatedFormat {
    // Use explicitly specified format if provided
    if (options.format) {
      return options.format;
    }

    // Check if resource is animated (by hash prefix or forced option)
    const isAnimated = options.animated || ANIMATED_HASH.test(hash);
    return isAnimated ? "gif" : "png";
  },

  /**
   * Builds a complete CDN URL from path segments and options.
   * Core method used by all other URL generators.
   *
   * @param path - Array of path segments to join
   * @param size - Optional size parameter for the image
   * @param baseUrl - Base URL to use (default: Discord CDN)
   * @returns Complete URL string for the resource
   */
  buildUrl<T extends string = string>(
    path: string[],
    size?: ImageSize,
    baseUrl: typeof CDN_URLS.BASE | typeof CDN_URLS.MEDIA_PROXY = CDN_URLS.BASE,
  ): T {
    const url = new URL(path.join("/"), baseUrl);

    // Add size query parameter if provided
    if (size) {
      url.searchParams.set("size", size.toString());
    }

    return url.toString() as T;
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): EmojiUrl {
    // Validate the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = validatedOptions.format ?? "png"; // Emoji does not have hash
    return this.buildUrl<EmojiUrl>(
      ["emojis", `${emojiId}.${format}`],
      validatedOptions.size,
    );
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildIconUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl<GuildIconUrl>(
      ["icons", guildId, `${hash}.${format}`],
      validatedOptions.size,
    );
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
    options: z.input<typeof ImageOptions> = {},
  ): GuildSplashUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<GuildSplashUrl>(
      ["splashes", guildId, `${hash}.${validatedOptions.format}`],
      validatedOptions.size,
    );
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
    options: z.input<typeof ImageOptions> = {},
  ): GuildDiscoverySplashUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<GuildDiscoverySplashUrl>(
      ["discovery-splashes", guildId, `${hash}.${validatedOptions.format}`],
      validatedOptions.size,
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildBannerUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl<GuildBannerUrl>(
      ["banners", guildId, `${hash}.${format}`],
      validatedOptions.size,
    );
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserBannerUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl<UserBannerUrl>(
      ["banners", userId, `${hash}.${format}`],
      validatedOptions.size,
    );
  },

  /**
   * Generates URL for the default avatar (legacy users with discriminators).
   * Returns one of five colors based on the discriminator.
   *
   * @param discriminator - User discriminator (four digits after #)
   * @returns URL to the default avatar image
   */
  defaultUserAvatar(discriminator: string | number): DefaultUserAvatarUrl {
    const index =
      typeof discriminator === "string"
        ? Number(discriminator) % 5
        : discriminator % 5;
    return this.buildUrl<DefaultUserAvatarUrl>([
      "embed/avatars",
      `${index}.png`,
    ]);
  },

  /**
   * Generates URL for the default avatar for users on the new username system.
   * Returns one of six colors based on the user ID.
   *
   * @param userId - Discord user ID
   * @returns URL to the default avatar image
   */
  defaultUserAvatarSystem(userId: Snowflake): DefaultUserAvatarUrl {
    // Convert to BigInt, shift right 22 bits, mod 6
    const index = Number((BigInt(userId) >> 22n) % 6n);
    return this.buildUrl<DefaultUserAvatarUrl>([
      "embed/avatars",
      `${index}.png`,
    ]);
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserAvatarUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl<UserAvatarUrl>(
      ["avatars", userId, `${hash}.${format}`],
      validatedOptions.size,
    );
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildMemberAvatarUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl<GuildMemberAvatarUrl>(
      ["guilds", guildId, "users", userId, "avatars", `${hash}.${format}`],
      validatedOptions.size,
    );
  },

  /**
   * Generates URL for an avatar decoration asset.
   * Avatar decorations are frames or effects around user avatars.
   *
   * @param assetId - Decoration asset ID
   * @returns URL to the avatar decoration image
   */
  avatarDecoration(assetId: Snowflake): AvatarDecorationUrl {
    return this.buildUrl<AvatarDecorationUrl>([
      "avatar-decoration-presets",
      `${assetId}.png`,
    ]);
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
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationIconUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<ApplicationIconUrl>(
      ["app-icons", applicationId, `${hash}.${validatedOptions.format}`],
      validatedOptions.size,
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
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationCoverUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<ApplicationCoverUrl>(
      ["app-icons", applicationId, `${hash}.${validatedOptions.format}`],
      validatedOptions.size,
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
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationAssetUrl {
    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<ApplicationAssetUrl>(
      ["app-assets", applicationId, `${assetId}.${validatedOptions.format}`],
      validatedOptions.size,
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
    options: z.input<typeof ImageOptions> = {},
  ): AchievementIconUrl {
    // Validate the hash
    validateWithZod(AssetHash, iconHash);

    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<AchievementIconUrl>(
      [
        "app-assets",
        applicationId,
        "achievements",
        achievementId,
        "icons",
        `${iconHash}.${validatedOptions.format}`,
      ],
      validatedOptions.size,
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
    options: z.input<typeof ImageOptions> = {},
  ): StorePageAssetUrl {
    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<StorePageAssetUrl>(
      [
        "app-assets",
        applicationId,
        "store",
        `${assetId}.${validatedOptions.format}`,
      ],
      validatedOptions.size,
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
    options: z.input<typeof ImageOptions> = {},
  ): StickerPackBannerUrl {
    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<StickerPackBannerUrl>(
      [
        "app-assets",
        "710982414301790216", // Discord's sticker application ID
        "store",
        `${bannerId}.${validatedOptions.format}`,
      ],
      validatedOptions.size,
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
    options: z.input<typeof ImageOptions> = {},
  ): TeamIconUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<TeamIconUrl>(
      ["team-icons", teamId, `${hash}.${validatedOptions.format}`],
      validatedOptions.size,
    );
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
    options: z.input<typeof StickerFormatOptions> = {},
  ): StickerUrl {
    // Validate the options
    const validatedOptions = validateWithZod(StickerFormatOptions, options);

    // Special handling for GIF stickers - use media proxy for better performance
    if (validatedOptions.format === "gif" && validatedOptions.useMediaProxy) {
      return this.buildUrl<StickerUrl>(
        ["stickers", `${stickerId}.gif`],
        validatedOptions.size,
        CDN_URLS.MEDIA_PROXY,
      );
    }

    return this.buildUrl<StickerUrl>(
      ["stickers", `${stickerId}.${validatedOptions.format}`],
      validatedOptions.size,
    );
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
    options: z.input<typeof ImageOptions> = {},
  ): RoleIconUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<RoleIconUrl>(
      ["role-icons", roleId, `${hash}.${validatedOptions.format}`],
      validatedOptions.size,
    );
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
    options: z.input<typeof ImageOptions> = {},
  ): GuildScheduledEventCoverUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl<GuildScheduledEventCoverUrl>(
      ["guild-events", eventId, `${hash}.${validatedOptions.format}`],
      validatedOptions.size,
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildMemberBannerUrl {
    // Validate the hash
    validateWithZod(AssetHash, hash);

    // Validate the options
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);

    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl<GuildMemberBannerUrl>(
      ["guilds", guildId, "users", userId, "banners", `${hash}.${format}`],
      validatedOptions.size,
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
    options: z.input<typeof BaseImageOptions> = {},
  ): AttachmentUrl {
    // Validate the options
    const validatedOptions = validateWithZod(BaseImageOptions, options);

    return this.buildUrl<AttachmentUrl>(
      ["attachments", channelId, attachmentId, encodeURIComponent(filename)],
      validatedOptions.size,
    );
  },
} as const;
