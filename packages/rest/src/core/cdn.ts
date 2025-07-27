import type { Snowflake } from "@nyxojs/core";
import { z } from "zod";

/**
 * Complete URL to Discord's primary CDN endpoint.
 * Ensures compile-time safety for Discord CDN URLs.
 *
 * @template T - The specific path string for the CDN resource
 *
 * @public
 */
export type CdnUrl<T extends string = string> =
  `https://cdn.discordapp.com/${T}`;

/**
 * Complete URL to Discord's media proxy endpoint.
 * Optimized for animated content delivery and processing.
 *
 * @template T - The specific path string for the media proxy resource
 *
 * @public
 */
export type MediaProxyUrl<T extends string = string> =
  `https://media.discordapp.net/${T}`;

/**
 * Any valid Discord CDN URL from either endpoint.
 * Accepts resources from both primary CDN and media proxy.
 *
 * @template T - The specific path string for the resource
 *
 * @public
 */
export type AnyCdnUrl<T extends string = string> = CdnUrl<T> | MediaProxyUrl<T>;

/**
 * Extracts the path component from any CDN URL type.
 * Strips domain portion leaving only the path segment.
 *
 * @template T - The CDN URL type to extract the path from
 *
 * @internal
 */
type ExtractPath<T extends AnyCdnUrl> = T extends CdnUrl<infer P>
  ? P
  : T extends MediaProxyUrl<infer P>
    ? P
    : never;

/**
 * Discord emoji URL with format support.
 * Supports static PNG and animated GIF formats.
 *
 * @public
 */
export type EmojiUrl = CdnUrl<`emojis/${Snowflake}.${AnimatedFormat}${string}`>;

/**
 * Guild icon URL with animation support.
 * Detects animated icons by hash prefix.
 *
 * @public
 */
export type GuildIconUrl =
  CdnUrl<`icons/${Snowflake}/${string}.${AnimatedFormat}${string}`>;

/**
 * Guild splash image URL for invite backgrounds.
 * Static images only for invite screens.
 *
 * @public
 */
export type GuildSplashUrl =
  CdnUrl<`splashes/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Guild discovery splash URL for server discovery.
 * Static images for Discord's discovery system.
 *
 * @public
 */
export type GuildDiscoverySplashUrl =
  CdnUrl<`discovery-splashes/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Guild banner URL with animation support.
 * Appears at the top of channel lists.
 *
 * @public
 */
export type GuildBannerUrl =
  CdnUrl<`banners/${Snowflake}/${string}.${AnimatedFormat}${string}`>;

/**
 * User profile banner URL with animation support.
 * Displayed on user profiles.
 *
 * @public
 */
export type UserBannerUrl =
  CdnUrl<`banners/${Snowflake}/${string}.${AnimatedFormat}${string}`>;

/**
 * Default user avatar URL for users without custom avatars.
 * Automatically assigned by Discord.
 *
 * @public
 */
export type DefaultUserAvatarUrl = CdnUrl<`embed/avatars/${number}.png`>;

/**
 * Custom user avatar URL with format support.
 * Supports static and animated formats based on subscription.
 *
 * @public
 */
export type UserAvatarUrl =
  CdnUrl<`avatars/${Snowflake}/${string}.${AnimatedFormat}${string}`>;

/**
 * Guild-specific member avatar URL.
 * Overrides global user avatar within specific servers.
 *
 * @public
 */
export type GuildMemberAvatarUrl =
  CdnUrl<`guilds/${Snowflake}/users/${Snowflake}/avatars/${string}.${AnimatedFormat}${string}`>;

/**
 * Avatar decoration URL for premium profile enhancements.
 * Decorative frames and effects around user avatars.
 *
 * @public
 */
export type AvatarDecorationUrl =
  CdnUrl<`avatar-decoration-presets/${Snowflake}.png`>;

/**
 * Application icon URL for Discord app directory.
 * Represents bots and applications in various interfaces.
 *
 * @public
 */
export type ApplicationIconUrl =
  CdnUrl<`app-icons/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Application cover image URL for app directory banners.
 * Banner visuals in Discord's app directory.
 *
 * @public
 */
export type ApplicationCoverUrl =
  CdnUrl<`app-icons/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Custom application asset URL for rich presence.
 * Custom images for rich presence and integrations.
 *
 * @public
 */
export type ApplicationAssetUrl =
  CdnUrl<`app-assets/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Achievement icon URL for gaming achievements.
 * Visual representation of gaming accomplishments.
 *
 * @public
 */
export type AchievementIconUrl =
  CdnUrl<`app-assets/${Snowflake}/achievements/${Snowflake}/icons/${string}.${RasterFormat}${string}`>;

/**
 * Store page asset URL for application marketplace.
 * Promotional images for Discord's application store.
 *
 * @public
 */
export type StorePageAssetUrl =
  CdnUrl<`app-assets/${Snowflake}/store/${string}.${RasterFormat}${string}`>;

/**
 * Sticker pack banner URL for Discord's sticker marketplace.
 * Visual representation for sticker collections.
 *
 * @public
 */
export type StickerPackBannerUrl =
  CdnUrl<`app-assets/710982414301790216/store/${string}.${RasterFormat}${string}`>;

/**
 * Team icon URL for Discord developer teams.
 * Visual identification for development teams.
 *
 * @public
 */
export type TeamIconUrl =
  CdnUrl<`team-icons/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Discord sticker URL with comprehensive format support.
 * Supports static, animated, and Lottie formats.
 *
 * @public
 */
export type StickerUrl =
  AnyCdnUrl<`stickers/${Snowflake}.${StickerFormat}${string}`>;

/**
 * Role icon URL for Discord server role customization.
 * Visual identification for server roles.
 *
 * @public
 */
export type RoleIconUrl =
  CdnUrl<`role-icons/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Guild scheduled event cover URL for event promotion.
 * Visual representation for Discord server events.
 *
 * @public
 */
export type GuildScheduledEventCoverUrl =
  CdnUrl<`guild-events/${Snowflake}/${string}.${RasterFormat}${string}`>;

/**
 * Guild-specific member banner URL for enhanced profiles.
 * Server-specific profile customization.
 *
 * @public
 */
export type GuildMemberBannerUrl =
  CdnUrl<`guilds/${Snowflake}/users/${Snowflake}/banners/${string}.${AnimatedFormat}${string}`>;

/**
 * Message attachment URL for file sharing.
 * Access to files uploaded to Discord messages.
 *
 * @public
 */
export type AttachmentUrl =
  CdnUrl<`attachments/${Snowflake}/${Snowflake}/${string}`>;

/**
 * Pattern for detecting animated Discord asset hashes.
 * Discord uses "a_" prefix to indicate animation capability.
 *
 * @public
 */
export const ANIMATED_HASH = /^a_/;

/**
 * Validates Discord CDN image size parameters.
 * Ensures only Discord's supported power-of-2 sizes are accepted.
 *
 * @public
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
 * Valid Discord CDN image sizes.
 * Union of all supported image dimensions.
 *
 * @public
 */
export type ImageSize = z.infer<typeof ImageSize>;

/**
 * Validates Discord asset hash formats.
 * Ensures hashes conform to Discord's expected patterns.
 *
 * @public
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
 * All supported Discord asset formats.
 * Complete set of file formats supported by Discord's CDN.
 *
 * @public
 */
export const AssetFormat = z.enum(["png", "jpeg", "webp", "gif", "json"]);
export type AssetFormat = z.infer<typeof AssetFormat>;

/**
 * Non-animated image formats.
 * Static image formats excluding animation-capable formats.
 *
 * @public
 */
export const RasterFormat = AssetFormat.exclude(["gif", "json"]);
export type RasterFormat = z.infer<typeof RasterFormat>;

/**
 * Potentially animated image formats.
 * Image formats supporting visual content excluding vector formats.
 *
 * @public
 */
export const AnimatedFormat = AssetFormat.exclude(["json"]);
export type AnimatedFormat = z.infer<typeof AnimatedFormat>;

/**
 * Discord sticker-specific formats.
 * Specialized format options for Discord stickers.
 *
 * @public
 */
export const StickerFormat = AssetFormat.exclude(["jpeg", "webp"]);
export type StickerFormat = z.infer<typeof StickerFormat>;

/**
 * Common CDN image request options.
 * Foundation for all CDN image option types.
 *
 * @public
 */
export const BaseImageOptions = z.object({
  /**
   * Image size in pixels for automatic resizing.
   * Discord CDN resizes while maintaining aspect ratio.
   */
  size: ImageSize.optional(),
});

/**
 * Base CDN image request options.
 * Common parameters for all asset types.
 *
 * @public
 */
export type BaseImageOptions = z.infer<typeof BaseImageOptions>;

/**
 * Static image request options with format specification.
 * Configuration for static image assets.
 *
 * @public
 */
export const ImageOptions = BaseImageOptions.extend({
  /**
   * Static image format specification.
   * Determines output format with PNG default.
   *
   * @default "png"
   */
  format: RasterFormat.default("png"),
});

/**
 * Static image request options.
 * Used for non-animated visual content.
 *
 * @public
 */
export type ImageOptions = z.infer<typeof ImageOptions>;

/**
 * Potentially animated image request options.
 * Configuration for assets that may support animation.
 *
 * @public
 */
export const AnimatedImageOptions = BaseImageOptions.extend({
  /**
   * Format specification for animated assets.
   * Automatically determined when omitted.
   */
  format: AnimatedFormat.optional(),

  /**
   * Explicit animation preference override.
   * Forces animated rendering when true.
   */
  animated: z.boolean().optional(),
});

/**
 * Potentially animated image request options.
 * Used for assets with animation support.
 *
 * @public
 */
export type AnimatedImageOptions = z.infer<typeof AnimatedImageOptions>;

/**
 * Discord sticker-specific request options.
 * Specialized configuration for sticker assets.
 *
 * @public
 */
export const StickerFormatOptions = BaseImageOptions.extend({
  /**
   * Sticker format specification.
   * PNG default for universal compatibility.
   *
   * @default "png"
   */
  format: StickerFormat.default("png"),

  /**
   * Media proxy optimization for GIF stickers.
   * Enhanced performance for animated content.
   *
   * @default true
   */
  useMediaProxy: z.boolean().default(true),
});

/**
 * Sticker-specific request options.
 * Used for Discord sticker assets.
 *
 * @public
 */
export type StickerFormatOptions = z.infer<typeof StickerFormatOptions>;

/**
 * Validates input with enhanced error reporting.
 * Converts Zod validation errors into user-friendly messages.
 *
 * @template T - The Zod schema type being validated
 * @param schema - The Zod schema to validate against
 * @param input - The input data to validate
 * @returns The validated and parsed input
 *
 * @throws {Error} User-friendly error message if validation fails
 *
 * @internal
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
 * Generates Discord CDN resource URLs.
 * Complete toolkit for constructing properly formatted URLs.
 *
 * @example
 * ```typescript
 * const avatarUrl = Cdn.userAvatar("123456789", "hash", { size: 256 });
 * const guildIcon = Cdn.guildIcon("987654321", "a_animated", { animated: true });
 * ```
 *
 * @public
 */
export const Cdn = {
  /**
   * Primary Discord CDN endpoint.
   * Main content delivery network for static assets.
   *
   * @public
   */
  BASE_URL: "https://cdn.discordapp.com/" as const,

  /**
   * Media proxy endpoint for enhanced processing.
   * Specialized processing for animated content.
   *
   * @public
   */
  MEDIA_PROXY_URL: "https://media.discordapp.net/" as const,

  /**
   * Determines optimal format based on asset hash and preferences.
   * Analyzes characteristics to select appropriate format.
   *
   * @param hash - Discord asset hash
   * @param options - Image options including format preferences
   * @returns The optimal format string
   *
   * @example
   * ```typescript
   * const format = Cdn.getFormatFromHash("a_1234", {});
   * console.log(format); // "gif"
   * ```
   *
   * @public
   */
  getFormatFromHash(
    hash: string,
    options: AnimatedImageOptions,
  ): AnimatedFormat {
    if (options.format) {
      return options.format;
    }

    const isAnimated = options.animated || ANIMATED_HASH.test(hash);
    return isAnimated ? "gif" : "png";
  },

  /**
   * Builds complete CDN URLs from components.
   * Assembles URL components into properly formatted Discord CDN URLs.
   *
   * @template T - The specific CDN URL type being constructed
   * @param path - The resource path within the CDN structure
   * @param size - Optional size parameter for image resizing
   * @param useMediaProxy - Whether to use media proxy endpoint
   * @returns Complete, properly formatted CDN URL
   *
   * @example
   * ```typescript
   * const url = Cdn.buildUrl("avatars/123/hash.png", 256);
   * ```
   *
   * @public
   */
  buildUrl<T extends AnyCdnUrl>(
    path: ExtractPath<T>,
    size?: ImageSize,
    useMediaProxy = false,
  ): T {
    const url = new URL(
      path,
      useMediaProxy ? this.MEDIA_PROXY_URL : this.BASE_URL,
    );

    if (size) {
      url.searchParams.set("size", size.toString());
    }

    return url.toString() as T;
  },

  /**
   * Generates URLs for Discord custom emoji assets.
   * Creates optimized URLs for emoji resources.
   *
   * @param emojiId - Discord emoji snowflake ID
   * @param options - Image formatting options
   * @returns Complete URL to the emoji asset
   *
   * @throws {Error} Invalid emoji ID or unsupported options
   *
   * @example
   * ```typescript
   * const emoji = Cdn.emoji("123456789012345678", { size: 128 });
   * ```
   *
   * @public
   */
  emoji(
    emojiId: Snowflake,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): EmojiUrl {
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);
    const format = validatedOptions.format ?? "png";
    return this.buildUrl(`emojis/${emojiId}.${format}`, validatedOptions.size);
  },

  /**
   * Generates URLs for Discord guild icon assets.
   * Creates properly formatted URLs with animation support.
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Guild icon asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the guild icon asset
   *
   * @throws {Error} Invalid guild ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const icon = Cdn.guildIcon("123456789", "a_animated", { size: 256 });
   * ```
   *
   * @public
   */
  guildIcon(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildIconUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);
    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `icons/${guildId}/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord guild splash images.
   * Creates properly formatted URLs for invite backgrounds.
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Guild splash asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the guild splash asset
   *
   * @throws {Error} Invalid guild ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const splash = Cdn.guildSplash("123456789", "splash_hash", { size: 1024 });
   * ```
   *
   * @public
   */
  guildSplash(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): GuildSplashUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `splashes/${guildId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord guild discovery splash images.
   * Creates properly formatted URLs for server discovery.
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Guild discovery splash asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the guild discovery splash asset
   *
   * @throws {Error} Invalid guild ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const splash = Cdn.guildDiscoverySplash("123456789", "hash", { size: 512 });
   * ```
   *
   * @public
   */
  guildDiscoverySplash(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): GuildDiscoverySplashUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `discovery-splashes/${guildId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord guild banner images.
   * Creates properly formatted URLs with animation support.
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Guild banner asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the guild banner asset
   *
   * @throws {Error} Invalid guild ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const banner = Cdn.guildBanner("123456789", "a_animated", { size: 1024 });
   * ```
   *
   * @public
   */
  guildBanner(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildBannerUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);
    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `banners/${guildId}/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord user profile banner images.
   * Creates properly formatted URLs with animation support.
   *
   * @param userId - Discord user snowflake ID
   * @param hash - User banner asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the user banner asset
   *
   * @throws {Error} Invalid user ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const banner = Cdn.userBanner("123456789", "banner_hash", { size: 600 });
   * ```
   *
   * @public
   */
  userBanner(
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserBannerUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);
    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `banners/${userId}/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for default Discord user avatars.
   * Creates properly formatted URLs based on discriminator values.
   *
   * @param discriminator - User discriminator string or number
   * @returns Complete URL to the appropriate default avatar
   *
   * @example
   * ```typescript
   * const avatar = Cdn.defaultUserAvatar("0001");
   * ```
   *
   * @public
   */
  defaultUserAvatar(discriminator: string | number): DefaultUserAvatarUrl {
    const index =
      typeof discriminator === "string"
        ? Number(discriminator) % 5
        : discriminator % 5;
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  /**
   * Generates URLs for default user avatars in new username system.
   * Creates properly formatted URLs based on user ID calculation.
   *
   * @param userId - Discord user snowflake ID
   * @returns Complete URL to the appropriate default avatar
   *
   * @example
   * ```typescript
   * const avatar = Cdn.defaultUserAvatarSystem("123456789012345678");
   * ```
   *
   * @public
   */
  defaultUserAvatarSystem(userId: Snowflake): DefaultUserAvatarUrl {
    const index = Number((BigInt(userId) >> 22n) % 6n);
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  /**
   * Generates URLs for Discord user avatar images.
   * Creates properly formatted URLs with animation support.
   *
   * @param userId - Discord user snowflake ID
   * @param hash - User avatar asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the user avatar asset
   *
   * @throws {Error} Invalid user ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const avatar = Cdn.userAvatar("123456789", "a_animated", { size: 256 });
   * ```
   *
   * @public
   */
  userAvatar(
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): UserAvatarUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);
    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `avatars/${userId}/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for guild-specific member avatar images.
   * Creates properly formatted URLs for server-specific avatars.
   *
   * @param guildId - Discord guild snowflake ID
   * @param userId - Discord user snowflake ID
   * @param hash - Guild member avatar asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the guild member avatar asset
   *
   * @throws {Error} Invalid IDs, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const avatar = Cdn.guildMemberAvatar("123", "456", "hash", { size: 256 });
   * ```
   *
   * @public
   */
  guildMemberAvatar(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildMemberAvatarUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);
    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `guilds/${guildId}/users/${userId}/avatars/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for avatar decoration assets.
   * Creates properly formatted URLs for premium profile enhancements.
   *
   * @param assetId - Avatar decoration asset snowflake ID
   * @returns Complete URL to the avatar decoration asset
   *
   * @example
   * ```typescript
   * const decoration = Cdn.avatarDecoration("123456789012345678");
   * ```
   *
   * @public
   */
  avatarDecoration(assetId: Snowflake): AvatarDecorationUrl {
    return this.buildUrl(`avatar-decoration-presets/${assetId}.png`);
  },

  /**
   * Generates URLs for Discord application icon assets.
   * Creates properly formatted URLs for app directory listings.
   *
   * @param applicationId - Discord application snowflake ID
   * @param hash - Application icon asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the application icon asset
   *
   * @throws {Error} Invalid application ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const icon = Cdn.applicationIcon("123456789", "hash", { size: 256 });
   * ```
   *
   * @public
   */
  applicationIcon(
    applicationId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationIconUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-icons/${applicationId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord application cover images.
   * Creates properly formatted URLs for app directory banners.
   *
   * @param applicationId - Discord application snowflake ID
   * @param hash - Application cover asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the application cover asset
   *
   * @throws {Error} Invalid application ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const cover = Cdn.applicationCover("123456789", "hash", { size: 1024 });
   * ```
   *
   * @public
   */
  applicationCover(
    applicationId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationCoverUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-icons/${applicationId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for custom application asset images.
   * Creates properly formatted URLs for rich presence and integrations.
   *
   * @param applicationId - Discord application snowflake ID
   * @param assetId - Application asset identifier string
   * @param options - Image formatting options
   * @returns Complete URL to the application asset
   *
   * @throws {Error} Invalid application ID or unsupported options
   *
   * @example
   * ```typescript
   * const asset = Cdn.applicationAsset("123456789", "game_logo", { size: 512 });
   * ```
   *
   * @public
   */
  applicationAsset(
    applicationId: Snowflake,
    assetId: string,
    options: z.input<typeof ImageOptions> = {},
  ): ApplicationAssetUrl {
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-assets/${applicationId}/${assetId}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for achievement icon assets.
   * Creates properly formatted URLs for gaming achievements.
   *
   * @param applicationId - Discord application snowflake ID
   * @param achievementId - Achievement snowflake ID
   * @param iconHash - Achievement icon asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the achievement icon asset
   *
   * @throws {Error} Invalid IDs, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const icon = Cdn.achievementIcon("123", "456", "hash", { size: 128 });
   * ```
   *
   * @public
   */
  achievementIcon(
    applicationId: Snowflake,
    achievementId: Snowflake,
    iconHash: string,
    options: z.input<typeof ImageOptions> = {},
  ): AchievementIconUrl {
    validateWithZod(AssetHash, iconHash);
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-assets/${applicationId}/achievements/${achievementId}/icons/${iconHash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for store page asset images.
   * Creates properly formatted URLs for application marketplace.
   *
   * @param applicationId - Discord application snowflake ID
   * @param assetId - Store page asset identifier string
   * @param options - Image formatting options
   * @returns Complete URL to the store page asset
   *
   * @throws {Error} Invalid application ID or unsupported options
   *
   * @example
   * ```typescript
   * const asset = Cdn.storePageAsset("123456789", "screenshot", { size: 1024 });
   * ```
   *
   * @public
   */
  storePageAsset(
    applicationId: Snowflake,
    assetId: string,
    options: z.input<typeof ImageOptions> = {},
  ): StorePageAssetUrl {
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-assets/${applicationId}/store/${assetId}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for sticker pack banner images.
   * Creates properly formatted URLs for Discord's sticker marketplace.
   *
   * @param bannerId - Sticker pack banner asset identifier string
   * @param options - Image formatting options
   * @returns Complete URL to the sticker pack banner asset
   *
   * @throws {Error} Invalid banner ID or unsupported options
   *
   * @example
   * ```typescript
   * const banner = Cdn.stickerPackBanner("winter_2023", { size: 512 });
   * ```
   *
   * @public
   */
  stickerPackBanner(
    bannerId: string,
    options: z.input<typeof ImageOptions> = {},
  ): StickerPackBannerUrl {
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `app-assets/710982414301790216/store/${bannerId}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord development team icon assets.
   * Creates properly formatted URLs for developer portal identification.
   *
   * @param teamId - Discord team snowflake ID
   * @param hash - Team icon asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the team icon asset
   *
   * @throws {Error} Invalid team ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const icon = Cdn.teamIcon("123456789", "team_hash", { size: 256 });
   * ```
   *
   * @public
   */
  teamIcon(
    teamId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): TeamIconUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `team-icons/${teamId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord sticker assets.
   * Creates properly formatted URLs with comprehensive format support.
   *
   * @param stickerId - Discord sticker snowflake ID
   * @param options - Sticker-specific formatting options
   * @returns Complete URL to the sticker asset
   *
   * @throws {Error} Invalid sticker ID or unsupported options
   *
   * @example
   * ```typescript
   * const sticker = Cdn.sticker("123456789", { format: "gif", size: 320 });
   * ```
   *
   * @public
   */
  sticker(
    stickerId: Snowflake,
    options: z.input<typeof StickerFormatOptions> = {},
  ): StickerUrl {
    const validatedOptions = validateWithZod(StickerFormatOptions, options);

    if (validatedOptions.format === "gif") {
      return this.buildUrl(
        `stickers/${stickerId}.gif`,
        validatedOptions.size,
        validatedOptions.useMediaProxy,
      );
    }

    return this.buildUrl(
      `stickers/${stickerId}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord server role icon assets.
   * Creates properly formatted URLs for role customization.
   *
   * @param roleId - Discord role snowflake ID
   * @param hash - Role icon asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the role icon asset
   *
   * @throws {Error} Invalid role ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const icon = Cdn.roleIcon("123456789", "role_hash", { size: 64 });
   * ```
   *
   * @public
   */
  roleIcon(
    roleId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): RoleIconUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `role-icons/${roleId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for guild scheduled event cover images.
   * Creates properly formatted URLs for event promotion.
   *
   * @param eventId - Discord scheduled event snowflake ID
   * @param hash - Event cover asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the scheduled event cover asset
   *
   * @throws {Error} Invalid event ID, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const cover = Cdn.guildScheduledEventCover("123456789", "hash", { size: 512 });
   * ```
   *
   * @public
   */
  guildScheduledEventCover(
    eventId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): GuildScheduledEventCoverUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(ImageOptions, options);
    return this.buildUrl(
      `guild-events/${eventId}/${hash}.${validatedOptions.format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for guild-specific member banner images.
   * Creates properly formatted URLs for enhanced server profiles.
   *
   * @param guildId - Discord guild snowflake ID
   * @param userId - Discord user snowflake ID
   * @param hash - Guild member banner asset hash
   * @param options - Image formatting options
   * @returns Complete URL to the guild member banner asset
   *
   * @throws {Error} Invalid IDs, malformed hash, or unsupported options
   *
   * @example
   * ```typescript
   * const banner = Cdn.guildMemberBanner("123", "456", "hash", { size: 512 });
   * ```
   *
   * @public
   */
  guildMemberBanner(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): GuildMemberBannerUrl {
    validateWithZod(AssetHash, hash);
    const validatedOptions = validateWithZod(AnimatedImageOptions, options);
    const format = this.getFormatFromHash(hash, validatedOptions);
    return this.buildUrl(
      `guilds/${guildId}/users/${userId}/banners/${hash}.${format}`,
      validatedOptions.size,
    );
  },

  /**
   * Generates URLs for Discord message attachment assets.
   * Creates properly formatted URLs for file sharing and media.
   *
   * @param channelId - Discord channel snowflake ID
   * @param attachmentId - Message attachment snowflake ID
   * @param filename - Original filename of the uploaded attachment
   * @param options - Base image options
   * @returns Complete URL to the message attachment asset
   *
   * @throws {Error} Invalid IDs or unsupported options
   *
   * @example
   * ```typescript
   * const attachment = Cdn.attachment("123", "456", "image.jpg", { size: 1024 });
   * ```
   *
   * @public
   */
  attachment(
    channelId: Snowflake,
    attachmentId: Snowflake,
    filename: string,
    options: z.input<typeof BaseImageOptions> = {},
  ): AttachmentUrl {
    const validatedOptions = validateWithZod(BaseImageOptions, options);
    return this.buildUrl(
      `attachments/${channelId}/${attachmentId}/${encodeURIComponent(filename)}`,
      validatedOptions.size,
    );
  },
} as const;
