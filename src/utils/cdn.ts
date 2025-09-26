/**
 * Discord CDN URL with typed path for static asset hosting.
 * Uses Discord's primary CDN domain for standard asset delivery.
 *
 * @typeParam T - URL path segment type constraint
 * @see {@link https://discord.com/developers/docs/reference#image-formatting} for CDN documentation
 */
export type CdnUrl<T extends string = string> = `https://cdn.discordapp.com/${T}`;

/**
 * Discord Media Proxy URL with typed path for optimized content delivery.
 * Uses Discord's media proxy for enhanced performance and caching.
 *
 * @typeParam T - URL path segment type constraint
 * @see {@link https://discord.com/developers/docs/reference#image-formatting} for media proxy details
 */
export type MediaProxyUrl<T extends string = string> = `https://media.discordapp.net/${T}`;

/**
 * Union type for any valid Discord CDN or Media Proxy URL.
 * Supports both standard CDN and media proxy endpoints.
 *
 * @typeParam T - URL path segment type constraint
 */
export type AnyCdnUrl<T extends string = string> = CdnUrl<T> | MediaProxyUrl<T>;

/**
 * Utility type to extract path segment from Discord CDN URLs.
 * Enables type-safe path manipulation and URL construction.
 *
 * @typeParam T - CDN URL type to extract path from
 */
type ExtractPath<T extends AnyCdnUrl> = T extends CdnUrl<infer P>
  ? P
  : T extends MediaProxyUrl<infer P>
    ? P
    : never;

/**
 * Valid image sizes for Discord CDN assets.
 * All sizes are powers of 2 between 16 and 4096 pixels for optimal performance.
 */
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

/**
 * All supported asset formats for Discord CDN endpoints.
 * Includes static images, animated content, and JSON-based assets.
 */
export type AssetFormat = "png" | "jpeg" | "webp" | "gif" | "avif" | "json";

/**
 * Static image formats that don't support animation.
 * Used for assets that never change or animate.
 */
export type StaticImageFormat = Exclude<AssetFormat, "gif" | "json">;

/**
 * Dynamic image formats supporting both static and animated content.
 * Used for assets that may have animated variants.
 */
export type DynamicImageFormat = Exclude<AssetFormat, "json">;

/**
 * Sticker-specific formats supporting Discord's sticker system.
 * Includes PNG for static, GIF for animated, and JSON for Lottie stickers.
 */
export type StickerFormat = Exclude<AssetFormat, "jpeg" | "webp">;

/**
 * Custom emoji URL with dynamic format support.
 * Supports both static and animated emoji with automatic format detection.
 */
export type EmojiUrl = CdnUrl<`emojis/${string}.${DynamicImageFormat}${string}`>;

/**
 * Guild icon URL with animated support based on hash pattern.
 * Hash prefixed with "a_" indicates animated content availability.
 */
export type GuildIconUrl = CdnUrl<`icons/${string}/${string}.${DynamicImageFormat}${string}`>;

/**
 * Guild splash image URL for server discovery and invites.
 * Static format only, typically used for server branding.
 */
export type GuildSplashUrl = CdnUrl<`splashes/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Guild discovery splash URL for enhanced server presentation.
 * Displayed in Discord's server discovery feature.
 */
export type GuildDiscoverySplashUrl =
  CdnUrl<`discovery-splashes/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Guild banner URL supporting animated banners.
 * Displays at the top of guild channels for boosted servers.
 */
export type GuildBannerUrl = CdnUrl<`banners/${string}/${string}.${DynamicImageFormat}${string}`>;

/**
 * User banner URL for profile customization.
 * Available to Nitro users with animated format support.
 */
export type UserBannerUrl = CdnUrl<`banners/${string}/${string}.${DynamicImageFormat}${string}`>;

/**
 * Default user avatar URL for users without custom avatars.
 * Index determined by user discriminator or user ID depending on username system.
 */
export type DefaultUserAvatarUrl = CdnUrl<`embed/avatars/${number}.png`>;

/**
 * Custom user avatar URL with animation support.
 * Hash determines availability of animated variant.
 */
export type UserAvatarUrl = CdnUrl<`avatars/${string}/${string}.${DynamicImageFormat}${string}`>;

/**
 * Guild-specific member avatar URL overriding global user avatar.
 * Allows different avatars per server with animated support.
 */
export type GuildMemberAvatarUrl =
  CdnUrl<`guilds/${string}/users/${string}/avatars/${string}.${DynamicImageFormat}${string}`>;

/**
 * Avatar decoration URL for premium cosmetic overlays.
 * PNG format only for consistent transparency support.
 */
export type AvatarDecorationUrl = CdnUrl<`avatar-decoration-presets/${string}.png`>;

/**
 * Application icon URL for Discord applications and bots.
 * Static formats only for consistent branding.
 */
export type ApplicationIconUrl =
  CdnUrl<`app-icons/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Application cover image URL for store and directory listings.
 * Static format for consistent presentation across platforms.
 */
export type ApplicationCoverUrl =
  CdnUrl<`app-icons/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Application asset URL for rich presence and game assets.
 * Static format for optimal performance and compatibility.
 */
export type ApplicationAssetUrl =
  CdnUrl<`app-assets/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Achievement icon URL for Discord's legacy achievement system.
 * Static format with nested path structure for organization.
 */
export type AchievementIconUrl =
  CdnUrl<`app-assets/${string}/achievements/${string}/icons/${string}.${StaticImageFormat}${string}`>;

/**
 * Store page asset URL for application store listings.
 * Static format for consistent shopping experience.
 */
export type StorePageAssetUrl =
  CdnUrl<`app-assets/${string}/store/${string}.${StaticImageFormat}${string}`>;

/**
 * Sticker pack banner URL with hardcoded Nitro application ID.
 * Static format for consistent sticker pack presentation.
 */
export type StickerPackBannerUrl =
  CdnUrl<`app-assets/710982414301790216/store/${string}.${StaticImageFormat}${string}`>;

/**
 * Team icon URL for Discord developer teams.
 * Static format for professional team branding.
 */
export type TeamIconUrl = CdnUrl<`team-icons/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Sticker URL supporting multiple formats and media proxy.
 * Uses both CDN and media proxy for optimal delivery performance.
 */
export type StickerUrl = AnyCdnUrl<`stickers/${string}.${StickerFormat}${string}`>;

/**
 * Role icon URL for custom server role icons.
 * Static format only for consistent UI performance.
 */
export type RoleIconUrl = CdnUrl<`role-icons/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Guild scheduled event cover image URL.
 * Static format for event promotion and discovery.
 */
export type GuildScheduledEventCoverUrl =
  CdnUrl<`guild-events/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Guild member banner URL for per-server member customization.
 * Supports animated banners with hash-based detection.
 */
export type GuildMemberBannerUrl =
  CdnUrl<`guilds/${string}/users/${string}/banners/${string}.${DynamicImageFormat}${string}`>;

/**
 * Guild tag badge URL for server verification and categories.
 * Static PNG format for consistent badge display.
 */
export type GuildTagBadgeUrl =
  CdnUrl<`guild-tag-badges/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * Message attachment URL for user-uploaded files.
 * Includes signed URL parameters for security and access control.
 */
export type AttachmentUrl = CdnUrl<`attachments/${string}/${string}/${string}`>;

/**
 * Configuration options for Discord CDN URL generation and formatting.
 * Provides control over image quality, animation, and delivery method.
 *
 * @typeParam T - Allowed format types for this specific asset
 */
export interface CdnOptions<
  T extends StaticImageFormat | DynamicImageFormat | StickerFormat = AssetFormat,
> {
  /**
   * Desired image size in pixels (power of 2 between 16-4096).
   * Automatically scales image while maintaining aspect ratio.
   */
  readonly size?: ImageSize;

  /**
   * Preferred image format for the asset.
   * Overrides automatic format detection based on content type.
   */
  readonly format?: T;

  /**
   * Force animated format for dynamic assets.
   * Ignored for assets without animated variants.
   */
  readonly animated?: boolean;

  /**
   * Use media proxy for enhanced performance and caching.
   * Recommended for frequently accessed or large assets.
   */
  readonly useMediaProxy?: boolean;
}

/**
 * Discord CDN utility providing URL generation and format optimization.
 * Handles automatic format detection, size optimization, and proxy routing.
 * All methods are pure functions for predictable behavior.
 */
export const Cdn = {
  /**
   * RegExp pattern for detecting animated asset hashes.
   * Discord prefixes animated asset hashes with "a_" for identification.
   */
  ANIMATED_HASH_PATTERN: /^a_/,

  /**
   * Primary Discord CDN base URL for standard asset delivery.
   * Used for most static assets and non-optimized content.
   */
  CDN_URL: "https://cdn.discordapp.com/" as const satisfies CdnUrl,

  /**
   * Discord Media Proxy URL for enhanced content delivery.
   * Provides better caching and optimization for media assets.
   */
  MEDIA_PROXY_URL: "https://media.discordapp.net/" as const satisfies MediaProxyUrl,

  /**
   * Default avatar counts for different Discord username systems.
   * Legacy system uses discriminators, new system uses user IDs.
   */
  DEFAULT_AVATARS: { legacy: 5, new: 6 } as const,

  /**
   * Determines optimal image format based on asset hash and options.
   * Automatically detects animated content and selects appropriate format.
   *
   * @param hash - Asset hash to analyze for animation indicators
   * @param options - Format preferences and animation override
   * @returns Optimal image format for the asset
   */
  getOptimalFormat(hash: string, options?: CdnOptions<DynamicImageFormat>): DynamicImageFormat {
    if (options?.format) {
      return options.format;
    }

    // Discord animated assets have hashes starting with "a_"
    const isAnimated = options?.animated || this.ANIMATED_HASH_PATTERN.test(hash);
    return isAnimated ? "gif" : "png";
  },

  /**
   * Constructs complete CDN URL with optional size parameter and proxy routing.
   * Handles URL encoding and parameter serialization automatically.
   *
   * @typeParam T - Expected return URL type for type safety
   * @param path - Asset path relative to CDN base URL
   * @param size - Optional image size for scaling
   * @param useMediaProxy - Use media proxy for enhanced delivery
   * @returns Complete CDN URL with proper formatting and parameters
   */
  buildUrl<T extends AnyCdnUrl>(path: ExtractPath<T>, size?: ImageSize, useMediaProxy = false): T {
    const baseUrl = useMediaProxy ? this.MEDIA_PROXY_URL : this.CDN_URL;
    const url = new URL(path, baseUrl);

    if (size) {
      url.searchParams.set("size", size.toString());
    }

    return url.toString() as T;
  },

  /**
   * Generates custom emoji URL with format optimization.
   * Defaults to PNG format for maximum compatibility.
   *
   * @param emojiId - Unique identifier for the custom emoji
   * @param options - Size and format preferences
   * @returns Typed emoji URL with specified parameters
   */
  emojiUrl(emojiId: string, options?: CdnOptions<DynamicImageFormat>): EmojiUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`emojis/${emojiId}.${format}`, options?.size);
  },

  /**
   * Generates guild icon URL with automatic animated format detection.
   * Uses hash pattern to determine if animated variant exists.
   *
   * @param guildId - Guild snowflake identifier
   * @param hash - Icon hash from guild object
   * @param options - Size, format, and animation preferences
   * @returns Typed guild icon URL with optimal format
   */
  guildIconUrl(
    guildId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): GuildIconUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`icons/${guildId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates guild splash image URL for server invites and discovery.
   * Static format only as splashes don't support animation.
   *
   * @param guildId - Guild snowflake identifier
   * @param hash - Splash hash from guild object
   * @param options - Size and format preferences
   * @returns Typed guild splash URL
   */
  guildSplash(
    guildId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): GuildSplashUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`splashes/${guildId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates guild discovery splash URL for enhanced server presentation.
   * Used in Discord's server discovery and directory features.
   *
   * @param guildId - Guild snowflake identifier
   * @param hash - Discovery splash hash from guild object
   * @param options - Size and format preferences
   * @returns Typed guild discovery splash URL
   */
  guildDiscoverySplash(
    guildId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): GuildDiscoverySplashUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`discovery-splashes/${guildId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates guild banner URL with animated support for boosted servers.
   * Automatically detects animated banners using hash patterns.
   *
   * @param guildId - Guild snowflake identifier
   * @param hash - Banner hash from guild object
   * @param options - Size, format, and animation preferences
   * @returns Typed guild banner URL with optimal format
   */
  guildBanner(
    guildId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): GuildBannerUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`banners/${guildId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates user banner URL for profile customization.
   * Supports animated banners for Nitro subscribers.
   *
   * @param userId - User snowflake identifier
   * @param hash - Banner hash from user object
   * @param options - Size, format, and animation preferences
   * @returns Typed user banner URL with optimal format
   */
  userBanner(
    userId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): UserBannerUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`banners/${userId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates default avatar URL for users without custom avatars.
   * Uses legacy discriminator-based indexing for backwards compatibility.
   *
   * @deprecated Use getDefaultAvatarByUserId for new username system
   * @param discriminator - User discriminator (string or number)
   * @returns Typed default avatar URL
   * @see {@link getDefaultAvatarByUserId} for new username system
   */
  defaultAvatarByDiscriminator(discriminator: string | number): DefaultUserAvatarUrl {
    const numericDiscriminator =
      typeof discriminator === "string" ? Number(discriminator) : discriminator;
    const index = numericDiscriminator % this.DEFAULT_AVATARS.legacy;
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  /**
   * Generates default avatar URL using user ID for new username system.
   * Uses snowflake timestamp bits for deterministic avatar selection.
   *
   * @param userId - User snowflake identifier
   * @returns Typed default avatar URL
   */
  defaultAvatarByUserId(userId: string): DefaultUserAvatarUrl {
    // Use snowflake timestamp bits for deterministic avatar selection
    const index = Number((BigInt(userId) >> 22n) % BigInt(this.DEFAULT_AVATARS.new));
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  /**
   * Generates custom user avatar URL with animation support.
   * Automatically detects animated avatars using hash patterns.
   *
   * @param userId - User snowflake identifier
   * @param hash - Avatar hash from user object
   * @param options - Size, format, and animation preferences
   * @returns Typed user avatar URL with optimal format
   */
  userAvatarUrl(
    userId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): UserAvatarUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`avatars/${userId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates guild member avatar URL overriding global user avatar.
   * Allows different avatars per server with animation support.
   *
   * @param guildId - Guild snowflake identifier
   * @param userId - User snowflake identifier
   * @param hash - Member avatar hash from guild member object
   * @param options - Size, format, and animation preferences
   * @returns Typed guild member avatar URL with optimal format
   */
  guildMemberAvatar(
    guildId: string,
    userId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): GuildMemberAvatarUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(
      `guilds/${guildId}/users/${userId}/avatars/${hash}.${format}`,
      options?.size,
    );
  },

  /**
   * Generates avatar decoration URL for premium cosmetic overlays.
   * PNG format ensures proper transparency for overlay effects.
   *
   * @param assetId - Avatar decoration asset identifier
   * @returns Typed avatar decoration URL
   */
  avatarDecoration(assetId: string): AvatarDecorationUrl {
    return this.buildUrl(`avatar-decoration-presets/${assetId}.png`);
  },

  /**
   * Generates application icon URL for Discord bots and applications.
   * Static format only for consistent branding across platforms.
   *
   * @param applicationId - Application snowflake identifier
   * @param hash - Icon hash from application object
   * @param options - Size and format preferences
   * @returns Typed application icon URL
   */
  applicationIcon(
    applicationId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): ApplicationIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`app-icons/${applicationId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates application cover image URL for store listings.
   * Static format for consistent presentation in app directories.
   *
   * @param applicationId - Application snowflake identifier
   * @param hash - Cover image hash from application object
   * @param options - Size and format preferences
   * @returns Typed application cover URL
   */
  applicationCover(
    applicationId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): ApplicationCoverUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`app-icons/${applicationId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates application asset URL for rich presence and activities.
   * Static format for optimal performance in game overlays.
   *
   * @param applicationId - Application snowflake identifier
   * @param assetId - Asset identifier from application assets
   * @param options - Size and format preferences
   * @returns Typed application asset URL
   */
  applicationAsset(
    applicationId: string,
    assetId: string,
    options?: CdnOptions<StaticImageFormat>,
  ): ApplicationAssetUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`app-assets/${applicationId}/${assetId}.${format}`, options?.size);
  },

  /**
   * Generates achievement icon URL for Discord's legacy achievement system.
   * Static format with nested path structure for organization.
   *
   * @param applicationId - Application snowflake identifier
   * @param achievementId - Achievement identifier
   * @param iconHash - Achievement icon hash
   * @param options - Size and format preferences
   * @returns Typed achievement icon URL
   */
  achievementIcon(
    applicationId: string,
    achievementId: string,
    iconHash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): AchievementIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(
      `app-assets/${applicationId}/achievements/${achievementId}/icons/${iconHash}.${format}`,
      options?.size,
    );
  },

  /**
   * Generates store page asset URL for application marketing materials.
   * Static format for consistent shopping experience presentation.
   *
   * @param applicationId - Application snowflake identifier
   * @param assetId - Store asset identifier
   * @param options - Size and format preferences
   * @returns Typed store page asset URL
   */
  storePageAsset(
    applicationId: string,
    assetId: string,
    options?: CdnOptions<StaticImageFormat>,
  ): StorePageAssetUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`app-assets/${applicationId}/store/${assetId}.${format}`, options?.size);
  },

  /**
   * Generates sticker pack banner URL with hardcoded Nitro application ID.
   * Uses Discord's official Nitro application for sticker pack branding.
   *
   * @param bannerId - Sticker pack banner asset identifier
   * @param options - Size and format preferences
   * @returns Typed sticker pack banner URL
   */
  stickerPackBanner(
    bannerId: string,
    options?: CdnOptions<StaticImageFormat>,
  ): StickerPackBannerUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(
      `app-assets/710982414301790216/store/${bannerId}.${format}`,
      options?.size,
    );
  },

  /**
   * Generates team icon URL for Discord developer teams.
   * Static format for professional team branding and identification.
   *
   * @param teamId - Team snowflake identifier
   * @param hash - Team icon hash from team object
   * @param options - Size and format preferences
   * @returns Typed team icon URL
   */
  teamIcon(teamId: string, hash: string, options?: CdnOptions<StaticImageFormat>): TeamIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`team-icons/${teamId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates sticker URL with format detection and media proxy optimization.
   * Supports PNG, GIF, and Lottie formats with automatic proxy routing.
   *
   * @param stickerId - Sticker snowflake identifier
   * @param options - Size, format, and proxy preferences
   * @returns Typed sticker URL with optimal delivery method
   */
  sticker(stickerId: string, options?: CdnOptions<StickerFormat>): StickerUrl {
    const format = options?.format ?? "png";
    const useMediaProxy = options?.useMediaProxy ?? true;
    // Animated stickers (GIF) prefer media proxy for better performance
    if (useMediaProxy && format === "gif") {
      return this.buildUrl(`stickers/${stickerId}.gif`, options?.size, useMediaProxy);
    }

    return this.buildUrl(`stickers/${stickerId}.${format}`, options?.size);
  },

  /**
   * Generates role icon URL for custom server role visualization.
   * Static format only for consistent UI performance and rendering.
   *
   * @param roleId - Role snowflake identifier
   * @param hash - Role icon hash from role object
   * @param options - Size and format preferences
   * @returns Typed role icon URL
   */
  roleIcon(roleId: string, hash: string, options?: CdnOptions<StaticImageFormat>): RoleIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`role-icons/${roleId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates guild scheduled event cover image URL.
   * Static format for event promotion and discovery features.
   *
   * @param eventId - Scheduled event snowflake identifier
   * @param hash - Event cover image hash
   * @param options - Size and format preferences
   * @returns Typed scheduled event cover URL
   */
  guildScheduledEventCover(
    eventId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): GuildScheduledEventCoverUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`guild-events/${eventId}/${hash}.${format}`, options?.size);
  },

  /**
   * Generates guild member banner URL for per-server customization.
   * Supports animated banners with automatic format detection.
   *
   * @param guildId - Guild snowflake identifier
   * @param userId - User snowflake identifier
   * @param hash - Member banner hash from guild member object
   * @param options - Size, format, and animation preferences
   * @returns Typed guild member banner URL with optimal format
   */
  guildMemberBanner(
    guildId: string,
    userId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): GuildMemberBannerUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(
      `guilds/${guildId}/users/${userId}/banners/${hash}.${format}`,
      options?.size,
    );
  },

  /**
   * Generates guild tag badge URL for server verification and categories.
   * Static PNG format ensures consistent badge display across clients.
   *
   * @param guildId - Guild snowflake identifier
   * @param badgeHash - Badge hash from guild verification object
   * @param options - Size and format preferences
   * @returns Typed guild tag badge URL
   */
  guildTagBadge(
    guildId: string,
    badgeHash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): GuildTagBadgeUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`guild-tag-badges/${guildId}/${badgeHash}.${format}`, options?.size);
  },

  /**
   * Generates message attachment URL with filename encoding and security parameters.
   * Includes automatic filename encoding for URL safety and proper routing.
   *
   * @param channelId - Channel snowflake identifier
   * @param attachmentId - Attachment snowflake identifier
   * @param filename - Original filename with extension
   * @param options - Size preferences for image attachments
   * @returns Typed attachment URL with encoded filename
   */
  attachment(
    channelId: string,
    attachmentId: string,
    filename: string,
    options?: CdnOptions,
  ): AttachmentUrl {
    // Encode filename for URL safety
    return this.buildUrl(
      `attachments/${channelId}/${attachmentId}/${encodeURIComponent(filename)}`,
      options?.size,
    );
  },
} as const;
