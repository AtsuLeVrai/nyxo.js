export type CdnUrl<T extends string = string> = `https://cdn.discordapp.com/${T}`;

export type MediaProxyUrl<T extends string = string> = `https://media.discordapp.net/${T}`;

export type AnyCdnUrl<T extends string = string> = CdnUrl<T> | MediaProxyUrl<T>;

type ExtractPath<T extends AnyCdnUrl> = T extends CdnUrl<infer P>
  ? P
  : T extends MediaProxyUrl<infer P>
    ? P
    : never;

export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export type AssetFormat = "png" | "jpeg" | "webp" | "gif" | "avif" | "json";

export type StaticImageFormat = Exclude<AssetFormat, "gif" | "json">;

export type DynamicImageFormat = Exclude<AssetFormat, "json">;

export type StickerFormat = Exclude<AssetFormat, "jpeg" | "webp">;

export type EmojiUrl = CdnUrl<`emojis/${string}.${DynamicImageFormat}${string}`>;

export type GuildIconUrl = CdnUrl<`icons/${string}/${string}.${DynamicImageFormat}${string}`>;

export type GuildSplashUrl = CdnUrl<`splashes/${string}/${string}.${StaticImageFormat}${string}`>;

export type GuildDiscoverySplashUrl =
  CdnUrl<`discovery-splashes/${string}/${string}.${StaticImageFormat}${string}`>;

export type GuildBannerUrl = CdnUrl<`banners/${string}/${string}.${DynamicImageFormat}${string}`>;

export type UserBannerUrl = CdnUrl<`banners/${string}/${string}.${DynamicImageFormat}${string}`>;

export type DefaultUserAvatarUrl = CdnUrl<`embed/avatars/${number}.png`>;

export type UserAvatarUrl = CdnUrl<`avatars/${string}/${string}.${DynamicImageFormat}${string}`>;

export type GuildMemberAvatarUrl =
  CdnUrl<`guilds/${string}/users/${string}/avatars/${string}.${DynamicImageFormat}${string}`>;

export type AvatarDecorationUrl = CdnUrl<`avatar-decoration-presets/${string}.png`>;

export type ApplicationIconUrl =
  CdnUrl<`app-icons/${string}/${string}.${StaticImageFormat}${string}`>;

export type ApplicationCoverUrl =
  CdnUrl<`app-icons/${string}/${string}.${StaticImageFormat}${string}`>;

export type ApplicationAssetUrl =
  CdnUrl<`app-assets/${string}/${string}.${StaticImageFormat}${string}`>;

export type AchievementIconUrl =
  CdnUrl<`app-assets/${string}/achievements/${string}/icons/${string}.${StaticImageFormat}${string}`>;

export type StorePageAssetUrl =
  CdnUrl<`app-assets/${string}/store/${string}.${StaticImageFormat}${string}`>;

export type StickerPackBannerUrl =
  CdnUrl<`app-assets/710982414301790216/store/${string}.${StaticImageFormat}${string}`>;

export type TeamIconUrl = CdnUrl<`team-icons/${string}/${string}.${StaticImageFormat}${string}`>;

export type StickerUrl = AnyCdnUrl<`stickers/${string}.${StickerFormat}${string}`>;

export type RoleIconUrl = CdnUrl<`role-icons/${string}/${string}.${StaticImageFormat}${string}`>;

export type GuildScheduledEventCoverUrl =
  CdnUrl<`guild-events/${string}/${string}.${StaticImageFormat}${string}`>;

export type GuildMemberBannerUrl =
  CdnUrl<`guilds/${string}/users/${string}/banners/${string}.${DynamicImageFormat}${string}`>;

export type GuildTagBadgeUrl =
  CdnUrl<`guild-tag-badges/${string}/${string}.${StaticImageFormat}${string}`>;

export type AttachmentUrl = CdnUrl<`attachments/${string}/${string}/${string}`>;

export interface CdnOptions<
  T extends StaticImageFormat | DynamicImageFormat | StickerFormat = AssetFormat,
> {
  readonly size?: ImageSize;

  readonly format?: T;

  readonly animated?: boolean;

  readonly useMediaProxy?: boolean;
}

export const Cdn = {
  ANIMATED_HASH_PATTERN: /^a_/,

  CDN_URL: "https://cdn.discordapp.com/" as const satisfies CdnUrl,

  MEDIA_PROXY_URL: "https://media.discordapp.net/" as const satisfies MediaProxyUrl,

  DEFAULT_AVATARS: { legacy: 5, new: 6 } as const,

  getOptimalFormat(hash: string, options?: CdnOptions<DynamicImageFormat>): DynamicImageFormat {
    if (options?.format) {
      return options.format;
    }

    const isAnimated = options?.animated || this.ANIMATED_HASH_PATTERN.test(hash);
    return isAnimated ? "gif" : "png";
  },

  buildUrl<T extends AnyCdnUrl>(path: ExtractPath<T>, size?: ImageSize, useMediaProxy = false): T {
    const baseUrl = useMediaProxy ? this.MEDIA_PROXY_URL : this.CDN_URL;
    const url = new URL(path, baseUrl);

    if (size) {
      url.searchParams.set("size", size.toString());
    }

    return url.toString() as T;
  },

  emojiUrl(emojiId: string, options?: CdnOptions<DynamicImageFormat>): EmojiUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`emojis/${emojiId}.${format}`, options?.size);
  },

  guildIconUrl(
    guildId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): GuildIconUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`icons/${guildId}/${hash}.${format}`, options?.size);
  },

  guildSplash(
    guildId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): GuildSplashUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`splashes/${guildId}/${hash}.${format}`, options?.size);
  },

  guildDiscoverySplash(
    guildId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): GuildDiscoverySplashUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`discovery-splashes/${guildId}/${hash}.${format}`, options?.size);
  },

  guildBanner(
    guildId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): GuildBannerUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`banners/${guildId}/${hash}.${format}`, options?.size);
  },

  userBanner(
    userId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): UserBannerUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`banners/${userId}/${hash}.${format}`, options?.size);
  },

  defaultAvatarByDiscriminator(discriminator: string | number): DefaultUserAvatarUrl {
    const numericDiscriminator =
      typeof discriminator === "string" ? Number(discriminator) : discriminator;
    const index = numericDiscriminator % this.DEFAULT_AVATARS.legacy;
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  defaultAvatarByUserId(userId: string): DefaultUserAvatarUrl {
    const index = Number((BigInt(userId) >> 22n) % BigInt(this.DEFAULT_AVATARS.new));
    return this.buildUrl(`embed/avatars/${index}.png`);
  },

  userAvatarUrl(
    userId: string,
    hash: string,
    options?: CdnOptions<DynamicImageFormat>,
  ): UserAvatarUrl {
    const format = this.getOptimalFormat(hash, options);
    return this.buildUrl(`avatars/${userId}/${hash}.${format}`, options?.size);
  },

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

  avatarDecoration(assetId: string): AvatarDecorationUrl {
    return this.buildUrl(`avatar-decoration-presets/${assetId}.png`);
  },

  applicationIcon(
    applicationId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): ApplicationIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`app-icons/${applicationId}/${hash}.${format}`, options?.size);
  },

  applicationCover(
    applicationId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): ApplicationCoverUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`app-icons/${applicationId}/${hash}.${format}`, options?.size);
  },

  applicationAsset(
    applicationId: string,
    assetId: string,
    options?: CdnOptions<StaticImageFormat>,
  ): ApplicationAssetUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`app-assets/${applicationId}/${assetId}.${format}`, options?.size);
  },

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

  storePageAsset(
    applicationId: string,
    assetId: string,
    options?: CdnOptions<StaticImageFormat>,
  ): StorePageAssetUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`app-assets/${applicationId}/store/${assetId}.${format}`, options?.size);
  },

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

  teamIcon(teamId: string, hash: string, options?: CdnOptions<StaticImageFormat>): TeamIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`team-icons/${teamId}/${hash}.${format}`, options?.size);
  },

  sticker(stickerId: string, options?: CdnOptions<StickerFormat>): StickerUrl {
    const format = options?.format ?? "png";
    const useMediaProxy = options?.useMediaProxy ?? true;

    if (useMediaProxy && format === "gif") {
      return this.buildUrl(`stickers/${stickerId}.gif`, options?.size, useMediaProxy);
    }

    return this.buildUrl(`stickers/${stickerId}.${format}`, options?.size);
  },

  roleIcon(roleId: string, hash: string, options?: CdnOptions<StaticImageFormat>): RoleIconUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`role-icons/${roleId}/${hash}.${format}`, options?.size);
  },

  guildScheduledEventCover(
    eventId: string,
    hash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): GuildScheduledEventCoverUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`guild-events/${eventId}/${hash}.${format}`, options?.size);
  },

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

  guildTagBadge(
    guildId: string,
    badgeHash: string,
    options?: CdnOptions<StaticImageFormat>,
  ): GuildTagBadgeUrl {
    const format = options?.format ?? "png";
    return this.buildUrl(`guild-tag-badges/${guildId}/${badgeHash}.${format}`, options?.size);
  },

  attachment(
    channelId: string,
    attachmentId: string,
    filename: string,
    options?: CdnOptions,
  ): AttachmentUrl {
    return this.buildUrl(
      `attachments/${channelId}/${attachmentId}/${encodeURIComponent(filename)}`,
      options?.size,
    );
  },
} as const;
