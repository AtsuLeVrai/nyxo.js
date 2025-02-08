import type { Snowflake } from "@nyxjs/core";
import { CDN_CONSTANTS } from "../constants/index.js";
import type {
  AnimatedImageOptions,
  BaseImageOptions,
  ImageOptions,
  StickerFormatOptions,
} from "../types/index.js";

export const Cdn = {
  validateHash(hash: string): void {
    if (
      !(
        hash &&
        CDN_CONSTANTS.PATTERNS.HASH.test(
          hash.replace(CDN_CONSTANTS.PATTERNS.ANIMATED_HASH, ""),
        )
      )
    ) {
      throw new Error(`Invalid hash format: ${hash}`);
    }
  },

  validateSize(size: number | undefined): number | undefined {
    if (!size) {
      return undefined;
    }

    if (size < 16 || size > 4096 || (size & (size - 1)) !== 0) {
      throw new Error(
        `Invalid size: ${size}. Must be a power of 2 between 16 and 4096`,
      );
    }
    return size;
  },

  getFormatFromHash(hash: string, options?: AnimatedImageOptions): string {
    const format = options?.format;
    if (format) {
      return format;
    }

    const isAnimated =
      CDN_CONSTANTS.PATTERNS.ANIMATED_HASH.test(hash) || options?.animated;
    return isAnimated ? "gif" : CDN_CONSTANTS.FORMATS.DEFAULT;
  },

  buildUrl(
    path: string[],
    options?: BaseImageOptions,
    baseUrl:
      | typeof CDN_CONSTANTS.BASE_URL
      | typeof CDN_CONSTANTS.MEDIA_PROXY_URL = CDN_CONSTANTS.BASE_URL,
  ): string {
    const url = new URL(path.join("/"), baseUrl);

    const validatedSize = this.validateSize(options?.size);
    if (validatedSize) {
      url.searchParams.set("size", validatedSize.toString());
    }

    return url.toString();
  },

  emoji(emojiId: Snowflake, options?: AnimatedImageOptions): string {
    return this.buildUrl(
      [
        "emojis",
        `${emojiId}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  guildIcon(
    guildId: Snowflake,
    hash: string,
    options?: AnimatedImageOptions,
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(["icons", guildId, `${hash}.${format}`], options);
  },

  guildSplash(
    guildId: Snowflake,
    hash: string,
    options?: ImageOptions,
  ): string {
    this.validateHash(hash);
    return this.buildUrl(
      [
        "splashes",
        guildId,
        `${hash}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  guildDiscoverySplash(
    guildId: Snowflake,
    hash: string,
    options?: ImageOptions,
  ): string {
    this.validateHash(hash);
    return this.buildUrl(
      [
        "discovery-splashes",
        guildId,
        `${hash}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  guildBanner(
    guildId: Snowflake,
    hash: string,
    options?: AnimatedImageOptions,
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(["banners", guildId, `${hash}.${format}`], options);
  },

  userBanner(
    userId: Snowflake,
    hash: string,
    options?: AnimatedImageOptions,
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(["banners", userId, `${hash}.${format}`], options);
  },

  defaultUserAvatar(discriminator: string | number): string {
    const index =
      typeof discriminator === "string"
        ? Number(discriminator) % 5
        : discriminator % 5;
    return this.buildUrl(["embed/avatars", `${index}.png`]);
  },

  defaultUserAvatarSystem(userId: Snowflake): string {
    const index = Number((BigInt(userId) >> 22n) % 6n);
    return this.buildUrl(["embed/avatars", `${index}.png`]);
  },

  userAvatar(
    userId: Snowflake,
    hash: string,
    options?: AnimatedImageOptions,
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(["avatars", userId, `${hash}.${format}`], options);
  },

  guildMemberAvatar(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options?: AnimatedImageOptions,
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(
      ["guilds", guildId, "users", userId, "avatars", `${hash}.${format}`],
      options,
    );
  },

  avatarDecoration(assetId: Snowflake): string {
    return this.buildUrl(["avatar-decoration-presets", `${assetId}.png`]);
  },

  applicationIcon(
    applicationId: Snowflake,
    hash: string,
    options?: ImageOptions,
  ): string {
    this.validateHash(hash);
    return this.buildUrl(
      [
        "app-icons",
        applicationId,
        `${hash}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  applicationCover(
    applicationId: Snowflake,
    hash: string,
    options?: ImageOptions,
  ): string {
    this.validateHash(hash);
    return this.buildUrl(
      [
        "app-icons",
        applicationId,
        `${hash}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  applicationAsset(
    applicationId: Snowflake,
    assetId: string,
    options?: ImageOptions,
  ): string {
    return this.buildUrl(
      [
        "app-assets",
        applicationId,
        `${assetId}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  achievementIcon(
    applicationId: Snowflake,
    achievementId: Snowflake,
    iconHash: string,
    options?: ImageOptions,
  ): string {
    this.validateHash(iconHash);
    return this.buildUrl(
      [
        "app-assets",
        applicationId,
        "achievements",
        achievementId,
        "icons",
        `${iconHash}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  storePageAsset(
    applicationId: Snowflake,
    assetId: string,
    options?: ImageOptions,
  ): string {
    return this.buildUrl(
      [
        "app-assets",
        applicationId,
        "store",
        `${assetId}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  stickerPackBanner(bannerId: string, options?: ImageOptions): string {
    return this.buildUrl(
      [
        "app-assets",
        "710982414301790216",
        "store",
        `${bannerId}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  teamIcon(teamId: Snowflake, hash: string, options?: ImageOptions): string {
    this.validateHash(hash);
    return this.buildUrl(
      [
        "team-icons",
        teamId,
        `${hash}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  sticker(stickerId: Snowflake, options?: StickerFormatOptions): string {
    const format = options?.format ?? "png";

    if (format === "gif" && options?.useMediaProxy) {
      return this.buildUrl(
        ["stickers", `${stickerId}.gif`],
        options,
        CDN_CONSTANTS.MEDIA_PROXY_URL,
      );
    }

    return this.buildUrl(["stickers", `${stickerId}.${format}`], options);
  },

  roleIcon(roleId: Snowflake, hash: string, options?: ImageOptions): string {
    this.validateHash(hash);
    return this.buildUrl(
      [
        "role-icons",
        roleId,
        `${hash}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  guildScheduledEventCover(
    eventId: Snowflake,
    hash: string,
    options?: ImageOptions,
  ): string {
    this.validateHash(hash);
    return this.buildUrl(
      [
        "guild-events",
        eventId,
        `${hash}.${options?.format ?? CDN_CONSTANTS.FORMATS.DEFAULT}`,
      ],
      options,
    );
  },

  guildMemberBanner(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options?: AnimatedImageOptions,
  ): string {
    this.validateHash(hash);
    const format = this.getFormatFromHash(hash, options);
    return this.buildUrl(
      ["guilds", guildId, "users", userId, "banners", `${hash}.${format}`],
      options,
    );
  },

  attachment(
    channelId: Snowflake,
    attachmentId: Snowflake,
    filename: string,
    options?: BaseImageOptions,
  ): string {
    return this.buildUrl(
      ["attachments", channelId, attachmentId, encodeURIComponent(filename)],
      options,
    );
  },
} as const;
