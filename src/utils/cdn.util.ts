export type CdnUrl<T extends string = string> = `https://cdn.discordapp.com/${T}`;
export type MediaProxyUrl<T extends string = string> = `https://media.discordapp.net/${T}`;
export type AnyCdnUrl<T extends string = string> = CdnUrl<T> | MediaProxyUrl<T>;

type ExtractPath<T extends AnyCdnUrl> = T extends CdnUrl<infer P>
  ? P
  : T extends MediaProxyUrl<infer P>
    ? P
    : never;

export type EmojiUrl = CdnUrl<`emojis/${string}.${AnimatedFormat}${string}`>;
export type GuildIconUrl = CdnUrl<`icons/${string}/${string}.${AnimatedFormat}${string}`>;
export type GuildSplashUrl = CdnUrl<`splashes/${string}/${string}.${RasterFormat}${string}`>;
export type GuildDiscoverySplashUrl =
  CdnUrl<`discovery-splashes/${string}/${string}.${RasterFormat}${string}`>;
export type GuildBannerUrl = CdnUrl<`banners/${string}/${string}.${AnimatedFormat}${string}`>;
export type UserBannerUrl = CdnUrl<`banners/${string}/${string}.${AnimatedFormat}${string}`>;
export type DefaultUserAvatarUrl = CdnUrl<`embed/avatars/${number}.png`>;
export type UserAvatarUrl = CdnUrl<`avatars/${string}/${string}.${AnimatedFormat}${string}`>;
export type GuildMemberAvatarUrl =
  CdnUrl<`guilds/${string}/users/${string}/avatars/${string}.${AnimatedFormat}${string}`>;
export type AvatarDecorationUrl = CdnUrl<`avatar-decoration-presets/${string}.png`>;
export type ApplicationIconUrl = CdnUrl<`app-icons/${string}/${string}.${RasterFormat}${string}`>;
export type ApplicationCoverUrl = CdnUrl<`app-icons/${string}/${string}.${RasterFormat}${string}`>;
export type ApplicationAssetUrl = CdnUrl<`app-assets/${string}/${string}.${RasterFormat}${string}`>;
export type AchievementIconUrl =
  CdnUrl<`app-assets/${string}/achievements/${string}/icons/${string}.${RasterFormat}${string}`>;
export type StorePageAssetUrl =
  CdnUrl<`app-assets/${string}/store/${string}.${RasterFormat}${string}`>;
export type StickerPackBannerUrl =
  CdnUrl<`app-assets/710982414301790216/store/${string}.${RasterFormat}${string}`>;
export type TeamIconUrl = CdnUrl<`team-icons/${string}/${string}.${RasterFormat}${string}`>;
export type StickerUrl = AnyCdnUrl<`stickers/${string}.${StickerFormat}${string}`>;
export type RoleIconUrl = CdnUrl<`role-icons/${string}/${string}.${RasterFormat}${string}`>;
export type GuildScheduledEventCoverUrl =
  CdnUrl<`guild-events/${string}/${string}.${RasterFormat}${string}`>;
export type GuildMemberBannerUrl =
  CdnUrl<`guilds/${string}/users/${string}/banners/${string}.${AnimatedFormat}${string}`>;
export type GuildTagBadgeUrl =
  CdnUrl<`guild-tag-badges/${string}/${string}.${RasterFormat}${string}`>;
export type AttachmentUrl = CdnUrl<`attachments/${string}/${string}/${string}`>;

export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export type AssetFormat = "png" | "jpeg" | "webp" | "gif" | "json";
export type RasterFormat = Exclude<AssetFormat, "gif" | "json">;
export type AnimatedFormat = Exclude<AssetFormat, "json">;
export type StickerFormat = Exclude<AssetFormat, "jpeg" | "webp">;

export interface CdnOptions<T extends RasterFormat | AnimatedFormat | StickerFormat = AssetFormat> {
  size?: ImageSize;
  format?: T;
  animated?: boolean;
  useMediaProxy?: boolean;
}

export const Cdn = {
  ANIMATED_HASH: /^a_/,
  BASE_URL: "https://cdn.discordapp.com/" as const,
  MEDIA_PROXY_URL: "https://media.discordapp.net/" as const,
  getFormatFromHash(hash: string, options: CdnOptions<AnimatedFormat>): AnimatedFormat {
    if (options.format) {
      return options.format;
    }
    const isAnimated = options.animated || this.ANIMATED_HASH.test(hash);
    return isAnimated ? "gif" : "png";
  },
  buildUrl<T extends AnyCdnUrl>(path: ExtractPath<T>, size?: ImageSize, useMediaProxy = false): T {
    const url = new URL(path, useMediaProxy ? this.MEDIA_PROXY_URL : this.BASE_URL);
    if (size) {
      url.searchParams.set("size", size.toString());
    }
    return url.toString() as T;
  },
  emoji(emojiId: string, options: CdnOptions<AnimatedFormat> = {}): EmojiUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`emojis/${emojiId}.${format}`, options.size);
  },
  guildIcon(guildId: string, hash: string, options: CdnOptions<AnimatedFormat> = {}): GuildIconUrl {
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(`icons/${guildId}/${hash}.${format}`, options.size);
  },
  guildSplash(
    guildId: string,
    hash: string,
    options: CdnOptions<RasterFormat> = {},
  ): GuildSplashUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`splashes/${guildId}/${hash}.${format}`, options.size);
  },
  guildDiscoverySplash(
    guildId: string,
    hash: string,
    options: CdnOptions<RasterFormat> = {},
  ): GuildDiscoverySplashUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`discovery-splashes/${guildId}/${hash}.${format}`, options.size);
  },
  guildBanner(
    guildId: string,
    hash: string,
    options: CdnOptions<AnimatedFormat> = {},
  ): GuildBannerUrl {
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(`banners/${guildId}/${hash}.${format}`, options.size);
  },
  userBanner(
    userId: string,
    hash: string,
    options: CdnOptions<AnimatedFormat> = {},
  ): UserBannerUrl {
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(`banners/${userId}/${hash}.${format}`, options.size);
  },
  defaultUserAvatar(discriminator: string | number): DefaultUserAvatarUrl {
    const index = typeof discriminator === "string" ? Number(discriminator) % 5 : discriminator % 5;
    return this.buildUrl(`embed/avatars/${index}.png`);
  },
  defaultUserAvatarSystem(userId: string): DefaultUserAvatarUrl {
    const index = Number((BigInt(userId) >> 22n) % 6n);
    return this.buildUrl(`embed/avatars/${index}.png`);
  },
  userAvatar(
    userId: string,
    hash: string,
    options: CdnOptions<AnimatedFormat> = {},
  ): UserAvatarUrl {
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(`avatars/${userId}/${hash}.${format}`, options.size);
  },
  guildMemberAvatar(
    guildId: string,
    userId: string,
    hash: string,
    options: CdnOptions<AnimatedFormat> = {},
  ): GuildMemberAvatarUrl {
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(
      `guilds/${guildId}/users/${userId}/avatars/${hash}.${format}`,
      options.size,
    );
  },
  avatarDecoration(assetId: string): AvatarDecorationUrl {
    return this.buildUrl(`avatar-decoration-presets/${assetId}.png`);
  },
  applicationIcon(
    applicationId: string,
    hash: string,
    options: CdnOptions<RasterFormat> = {},
  ): ApplicationIconUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`app-icons/${applicationId}/${hash}.${format}`, options.size);
  },
  applicationCover(
    applicationId: string,
    hash: string,
    options: CdnOptions<RasterFormat> = {},
  ): ApplicationCoverUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`app-icons/${applicationId}/${hash}.${format}`, options.size);
  },
  applicationAsset(
    applicationId: string,
    assetId: string,
    options: CdnOptions<RasterFormat> = {},
  ): ApplicationAssetUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`app-assets/${applicationId}/${assetId}.${format}`, options.size);
  },
  achievementIcon(
    applicationId: string,
    achievementId: string,
    iconHash: string,
    options: CdnOptions<RasterFormat> = {},
  ): AchievementIconUrl {
    const format = options.format ?? "png";
    return this.buildUrl(
      `app-assets/${applicationId}/achievements/${achievementId}/icons/${iconHash}.${format}`,
      options.size,
    );
  },
  storePageAsset(
    applicationId: string,
    assetId: string,
    options: CdnOptions<RasterFormat> = {},
  ): StorePageAssetUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`app-assets/${applicationId}/store/${assetId}.${format}`, options.size);
  },
  stickerPackBanner(
    bannerId: string,
    options: CdnOptions<RasterFormat> = {},
  ): StickerPackBannerUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`app-assets/710982414301790216/store/${bannerId}.${format}`, options.size);
  },
  teamIcon(teamId: string, hash: string, options: CdnOptions<RasterFormat> = {}): TeamIconUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`team-icons/${teamId}/${hash}.${format}`, options.size);
  },
  sticker(stickerId: string, options: CdnOptions<StickerFormat> = {}): StickerUrl {
    const format = options.format ?? "png";
    const useMediaProxy = options.useMediaProxy ?? true;
    if (format === "gif") {
      return this.buildUrl(`stickers/${stickerId}.gif`, options.size, useMediaProxy);
    }
    return this.buildUrl(`stickers/${stickerId}.${format}`, options.size);
  },
  roleIcon(roleId: string, hash: string, options: CdnOptions<RasterFormat> = {}): RoleIconUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`role-icons/${roleId}/${hash}.${format}`, options.size);
  },
  guildScheduledEventCover(
    eventId: string,
    hash: string,
    options: CdnOptions<RasterFormat> = {},
  ): GuildScheduledEventCoverUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`guild-events/${eventId}/${hash}.${format}`, options.size);
  },
  guildMemberBanner(
    guildId: string,
    userId: string,
    hash: string,
    options: CdnOptions<AnimatedFormat> = {},
  ): GuildMemberBannerUrl {
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(
      `guilds/${guildId}/users/${userId}/banners/${hash}.${format}`,
      options.size,
    );
  },
  guildTagBadge(
    guildId: string,
    badgeHash: string,
    options: CdnOptions<RasterFormat> = {},
  ): GuildTagBadgeUrl {
    const format = options.format ?? "png";
    return this.buildUrl(`guild-tag-badges/${guildId}/${badgeHash}.${format}`, options.size);
  },
  attachment(
    channelId: string,
    attachmentId: string,
    filename: string,
    options: CdnOptions = {},
  ): AttachmentUrl {
    return this.buildUrl(
      `attachments/${channelId}/${attachmentId}/${encodeURIComponent(filename)}`,
      options.size,
    );
  },
} as const;
