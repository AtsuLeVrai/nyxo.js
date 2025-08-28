/**
 * @description Discord CDN URL template type for type-safe asset URL generation.
 * @see {@link https://discord.com/developers/docs/reference#image-formatting}
 */
export type CdnUrl<T extends string = string> = `https://cdn.discordapp.com/${T}`;

/**
 * @description Discord media proxy URL template type for animated content and stickers.
 * @see {@link https://discord.com/developers/docs/reference#image-formatting}
 */
export type MediaProxyUrl<T extends string = string> = `https://media.discordapp.net/${T}`;

/**
 * @description Union type for both Discord CDN and media proxy URLs.
 */
export type AnyCdnUrl<T extends string = string> = CdnUrl<T> | MediaProxyUrl<T>;

/**
 * @description Utility type to extract path segment from CDN URL types.
 */
type ExtractPath<T extends AnyCdnUrl> = T extends CdnUrl<infer P>
  ? P
  : T extends MediaProxyUrl<infer P>
    ? P
    : never;

/**
 * @description Type-safe URL for Discord custom emoji assets, supporting both static and animated formats.
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 */
export type EmojiUrl = CdnUrl<`emojis/${string}.${DynamicImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord guild icon assets, supporting both static and animated formats.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
 */
export type GuildIconUrl = CdnUrl<`icons/${string}/${string}.${DynamicImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord guild splash image assets (static formats only).
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
 */
export type GuildSplashUrl = CdnUrl<`splashes/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord guild discovery splash assets (static formats only).
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
 */
export type GuildDiscoverySplashUrl =
  CdnUrl<`discovery-splashes/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord guild banner assets, supporting both static and animated formats.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
 */
export type GuildBannerUrl = CdnUrl<`banners/${string}/${string}.${DynamicImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord user banner assets, supporting both static and animated formats.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object}
 */
export type UserBannerUrl = CdnUrl<`banners/${string}/${string}.${DynamicImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord default user avatar assets (static PNG only).
 * @see {@link https://discord.com/developers/docs/resources/user#user-object}
 */
export type DefaultUserAvatarUrl = CdnUrl<`embed/avatars/${number}.png`>;

/**
 * @description Type-safe URL for Discord user avatar assets, supporting both static and animated formats.
 * @see {@link https://discord.com/developers/docs/resources/user#user-object}
 */
export type UserAvatarUrl = CdnUrl<`avatars/${string}/${string}.${DynamicImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord guild member avatar assets, supporting both static and animated formats.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object}
 */
export type GuildMemberAvatarUrl =
  CdnUrl<`guilds/${string}/users/${string}/avatars/${string}.${DynamicImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord avatar decoration assets (static PNG only).
 * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object}
 */
export type AvatarDecorationUrl = CdnUrl<`avatar-decoration-presets/${string}.png`>;

/**
 * @description Type-safe URL for Discord application icon assets (static formats only).
 * @see {@link https://discord.com/developers/docs/resources/application#application-object}
 */
export type ApplicationIconUrl =
  CdnUrl<`app-icons/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord application cover assets (static formats only).
 * @see {@link https://discord.com/developers/docs/resources/application#application-object}
 */
export type ApplicationCoverUrl =
  CdnUrl<`app-icons/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord application asset resources (static formats only).
 * @see {@link https://discord.com/developers/docs/resources/application#application-object}
 */
export type ApplicationAssetUrl =
  CdnUrl<`app-assets/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord achievement icon assets (static formats only).
 * @see {@link https://discord.com/developers/docs/game-sdk/achievements}
 */
export type AchievementIconUrl =
  CdnUrl<`app-assets/${string}/achievements/${string}/icons/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord store page asset resources (static formats only).
 * @see {@link https://discord.com/developers/docs/game-sdk/store}
 */
export type StorePageAssetUrl =
  CdnUrl<`app-assets/${string}/store/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord sticker pack banner assets (static formats only).
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object}
 */
export type StickerPackBannerUrl =
  CdnUrl<`app-assets/710982414301790216/store/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord team icon assets (static formats only).
 * @see {@link https://discord.com/developers/docs/topics/teams}
 */
export type TeamIconUrl = CdnUrl<`team-icons/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord sticker assets, supporting both CDN and media proxy URLs.
 * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object}
 */
export type StickerUrl = AnyCdnUrl<`stickers/${string}.${StickerFormat}${string}`>;

/**
 * @description Type-safe URL for Discord role icon assets (static formats only).
 * @see {@link https://discord.com/developers/docs/topics/permissions#role-object}
 */
export type RoleIconUrl = CdnUrl<`role-icons/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord guild scheduled event cover assets (static formats only).
 * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object}
 */
export type GuildScheduledEventCoverUrl =
  CdnUrl<`guild-events/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord guild member banner assets, supporting both static and animated formats.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object}
 */
export type GuildMemberBannerUrl =
  CdnUrl<`guilds/${string}/users/${string}/banners/${string}.${DynamicImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord guild tag badge assets (static formats only).
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
 */
export type GuildTagBadgeUrl =
  CdnUrl<`guild-tag-badges/${string}/${string}.${StaticImageFormat}${string}`>;

/**
 * @description Type-safe URL for Discord message attachment assets (any file format).
 * @see {@link https://discord.com/developers/docs/resources/channel#attachment-object}
 */
export type AttachmentUrl = CdnUrl<`attachments/${string}/${string}/${string}`>;

/**
 * @description Supported image sizes for Discord CDN assets. Discord automatically resizes images to these dimensions.
 * @see {@link https://discord.com/developers/docs/reference#image-formatting-image-formats}
 */
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

/**
 * @description All supported asset formats for Discord CDN resources.
 * @see {@link https://discord.com/developers/docs/reference#image-formatting-image-formats}
 */
export type AssetFormat = "png" | "jpeg" | "webp" | "gif" | "json";

/**
 * @description Static image formats excluding animated and JSON formats (for banners, icons, etc.).
 */
export type StaticImageFormat = Exclude<AssetFormat, "gif" | "json">;

/**
 * @description Dynamic image formats supporting both static and animated content (for avatars, emojis, etc.).
 */
export type DynamicImageFormat = Exclude<AssetFormat, "json">;

/**
 * @description Specialized formats for Discord stickers (PNG, GIF, and Lottie JSON).
 */
export type StickerFormat = Exclude<AssetFormat, "jpeg" | "webp">;

/**
 * @description Configuration options for CDN asset URL generation with format, size, and proxy preferences.
 * @see {@link https://discord.com/developers/docs/reference#image-formatting}
 */
export interface CdnOptions<
  T extends StaticImageFormat | DynamicImageFormat | StickerFormat = AssetFormat,
> {
  /** Desired image size (Discord will resize automatically) */
  size?: ImageSize;
  /** Asset format preference */
  format?: T;
  /** Force animated format for animated assets */
  animated?: boolean;
  /** Use media proxy URL instead of CDN for animated content */
  useMediaProxy?: boolean;
}

/**
 * @description Discord CDN utilities for generating type-safe asset URLs with automatic format detection and performance optimizations.
 * @see {@link https://discord.com/developers/docs/reference#image-formatting}
 */
export const Cdn = {
  /** Regex pattern to detect animated asset hashes (starting with "a_") */
  ANIMATED_HASH_PATTERN: /^a_/,
  /** Discord epoch timestamp (January 1, 2015 00:00:00 UTC) */
  DISCORD_EPOCH: 1420070400000n,
  /** Discord CDN base URL for static and animated assets */
  CDN_URL: "https://cdn.discordapp.com/" as const,
  /** Discord media proxy URL for animated stickers and special content */
  MEDIA_PROXY_URL: "https://media.discordapp.net/" as const,
  /** Default avatar counts for different systems */
  DEFAULT_AVATARS: { legacy: 5, new: 6 } as const,

  /**
   * @description Determines optimal format for asset based on hash pattern and options with improved performance.
   *
   * @param hash - Asset hash from Discord API (animated hashes start with "a_")
   * @param options - Format preferences and animation settings
   * @returns Appropriate format ("gif" for animated, "png" for static by default)
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
   * @description Builds optimized type-safe CDN URL, size parameter, and media proxy support.
   *
   * @param path - Asset path relative to CDN base URL
   * @param size - Optional image size (Discord will resize automatically)
   * @param useMediaProxy - Use media proxy URL instead of CDN for animated content
   * @returns Complete CDN URL with type safety
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
   * @description Generates type-safe URL for Discord custom emoji assets with validation and format optimization.
   * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
   *
   * @param emojiId - Discord emoji snowflake ID
   * @param options - Format and size preferences
   * @returns Type-safe CDN URL for emoji asset
   */
  getEmojiUrl(emojiId: string, options?: CdnOptions<DynamicImageFormat>): EmojiUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`emojis/${emojiId}.${format}`, options?.size);
  },

  /**
   * @description Generates type-safe URL for Discord guild icon with validation and automatic animated format detection.
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Icon hash from guild object (animated hashes start with "a_")
   * @param options - Format and size preferences
   * @returns Type-safe CDN URL for guild icon asset
   */
  getGuildIconUrl(
    guildId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): GuildIconUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`icons/${guildId}/${hash}.${format}`, options?.size);
  },

  /**
   * @description Generates type-safe URL for Discord guild splash image (static formats only).
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Splash image hash from guild object
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for guild splash asset
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
   * @description Generates type-safe URL for Discord guild discovery splash image (static formats only).
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Discovery splash hash from guild object
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for guild discovery splash asset
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
   * @description Generates type-safe URL for Discord guild banner with automatic animated format detection.
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
   *
   * @param guildId - Discord guild snowflake ID
   * @param hash - Banner hash from guild object (animated hashes start with "a_")
   * @param options - Format and size preferences
   * @returns Type-safe CDN URL for guild banner asset
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
   * @description Generates type-safe URL for Discord user banner with automatic animated format detection.
   * @see {@link https://discord.com/developers/docs/resources/user#user-object}
   *
   * @param userId - Discord user snowflake ID
   * @param hash - Banner hash from user object (animated hashes start with "a_")
   * @param options - Format and size preferences
   * @returns Type-safe CDN URL for user banner asset
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
   * @description Generates URL for default Discord user avatar based on discriminator (legacy username system).
   * @see {@link https://discord.com/developers/docs/resources/user#user-object}
   *
   * @param discriminator - User discriminator number or string (0001-9999)
   * @returns Type-safe CDN URL for default avatar (PNG format only)
   */
  getDefaultAvatarByDiscriminator(discriminator: string | number): DefaultUserAvatarUrl {
    const numericDiscriminator =
      typeof discriminator === "string" ? Number(discriminator) : discriminator;
    const index = numericDiscriminator % this.DEFAULT_AVATARS.legacy;
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  /**
   * @description Generates URL for default Discord user avatar based on user ID (new username system).
   * @see {@link https://discord.com/developers/docs/resources/user#user-object}
   *
   * @param userId - Discord user snowflake ID
   * @returns Type-safe CDN URL for default avatar (PNG format only)
   */
  getDefaultAvatarByUserId(userId: string): DefaultUserAvatarUrl {
    // Use snowflake timestamp bits for deterministic avatar selection
    const index = Number((BigInt(userId) >> 22n) % BigInt(this.DEFAULT_AVATARS.new));
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  /**
   * @description Generates type-safe URL for Discord user avatar with validation and automatic format detection.
   * @see {@link https://discord.com/developers/docs/resources/user#user-object}
   *
   * @param userId - Discord user snowflake ID
   * @param hash - Avatar hash from user object (animated hashes start with "a_")
   * @param options - Format and size preferences
   * @returns Type-safe CDN URL for user avatar asset
   */
  getUserAvatarUrl(
    userId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): UserAvatarUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`avatars/${userId}/${hash}.${format}`, options?.size);
  },

  /**
   * @description Generates type-safe URL for Discord guild member avatar with automatic animated format detection.
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object}
   *
   * @param guildId - Discord guild snowflake ID
   * @param userId - Discord user snowflake ID
   * @param hash - Avatar hash from guild member object (animated hashes start with "a_")
   * @param options - Format and size preferences
   * @returns Type-safe CDN URL for guild member avatar asset
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
   * @description Generates type-safe URL for Discord avatar decoration preset (static PNG only).
   * @see {@link https://discord.com/developers/docs/resources/user#avatar-decoration-data-object}
   *
   * @param assetId - Avatar decoration asset ID
   * @returns Type-safe CDN URL for avatar decoration asset
   */
  avatarDecoration(assetId: string): AvatarDecorationUrl {
    return this.buildUrl(`avatar-decoration-presets/${assetId}.png`);
  },

  /**
   * @description Generates type-safe URL for Discord application icon (static formats only).
   * @see {@link https://discord.com/developers/docs/resources/application#application-object}
   *
   * @param applicationId - Discord application snowflake ID
   * @param hash - Icon hash from application object
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for application icon asset
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
   * @description Generates type-safe URL for Discord application cover image (static formats only).
   * @see {@link https://discord.com/developers/docs/resources/application#application-object}
   *
   * @param applicationId - Discord application snowflake ID
   * @param hash - Cover image hash from application object
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for application cover asset
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
   * @description Generates type-safe URL for Discord application asset resource (static formats only).
   * @see {@link https://discord.com/developers/docs/resources/application#application-object}
   *
   * @param applicationId - Discord application snowflake ID
   * @param assetId - Asset ID from application resources
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for application asset
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
   * @description Generates type-safe URL for Discord achievement icon (static formats only).
   * @see {@link https://discord.com/developers/docs/game-sdk/achievements}
   *
   * @param applicationId - Discord application snowflake ID
   * @param achievementId - Achievement ID from application
   * @param iconHash - Icon hash for the achievement
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for achievement icon asset
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
   * @description Generates type-safe URL for Discord store page asset (static formats only).
   * @see {@link https://discord.com/developers/docs/game-sdk/store}
   *
   * @param applicationId - Discord application snowflake ID
   * @param assetId - Store asset ID
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for store page asset
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
   * @description Generates type-safe URL for Discord sticker pack banner (static formats only).
   * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-pack-object}
   *
   * @param bannerId - Sticker pack banner ID
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for sticker pack banner asset
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
   * @description Generates type-safe URL for Discord team icon (static formats only).
   * @see {@link https://discord.com/developers/docs/topics/teams}
   *
   * @param teamId - Discord team snowflake ID
   * @param hash - Team icon hash
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for team icon asset
   */
  teamIcon(teamId: string, hash: string, options?: CdnOptions<StaticImageFormat>): TeamIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`team-icons/${teamId}/${hash}.${format}`, options?.size);
  },

  /**
   * @description Generates type-safe URL for Discord sticker with automatic media proxy selection for animated content.
   * @see {@link https://discord.com/developers/docs/resources/sticker#sticker-object}
   *
   * @param stickerId - Discord sticker snowflake ID
   * @param options - Format, size, and media proxy preferences
   * @returns Type-safe CDN or media proxy URL for sticker asset
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
   * @description Generates type-safe URL for Discord role icon (static formats only).
   * @see {@link https://discord.com/developers/docs/topics/permissions#role-object}
   *
   * @param roleId - Discord role snowflake ID
   * @param hash - Role icon hash from role object
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for role icon asset
   */
  roleIcon(roleId: string, hash: string, options?: CdnOptions<StaticImageFormat>): RoleIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`role-icons/${roleId}/${hash}.${format}`, options?.size);
  },

  /**
   * @description Generates type-safe URL for Discord guild scheduled event cover image (static formats only).
   * @see {@link https://discord.com/developers/docs/resources/guild-scheduled-event#guild-scheduled-event-object}
   *
   * @param eventId - Discord scheduled event snowflake ID
   * @param hash - Cover image hash from event object
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for guild scheduled event cover asset
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
   * @description Generates type-safe URL for Discord guild member banner with automatic animated format detection.
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object}
   *
   * @param guildId - Discord guild snowflake ID
   * @param userId - Discord user snowflake ID
   * @param hash - Banner hash from guild member object (animated hashes start with "a_")
   * @param options - Format and size preferences
   * @returns Type-safe CDN URL for guild member banner asset
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
   * @description Generates type-safe URL for Discord guild tag badge (static formats only).
   * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
   *
   * @param guildId - Discord guild snowflake ID
   * @param badgeHash - Guild tag badge hash
   * @param options - Format and size preferences (static formats only)
   * @returns Type-safe CDN URL for guild tag badge asset
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
   * @description Generates type-safe URL for Discord message attachment with automatic filename encoding.
   * @see {@link https://discord.com/developers/docs/resources/channel#attachment-object}
   *
   * @param channelId - Discord channel snowflake ID
   * @param attachmentId - Discord attachment snowflake ID
   * @param filename - Original filename (will be URL-encoded automatically)
   * @param options - Size preferences for image attachments
   * @returns Type-safe CDN URL for attachment asset
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
