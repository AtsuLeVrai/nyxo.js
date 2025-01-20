import type { Snowflake } from "@nyxjs/core";
import type {
  AnimatedImageOptionsEntity,
  ImageFormat,
  ImageProcessingOptions,
  StickerFormatOptionsEntity,
} from "../types/index.js";

const DEFAULT_FORMAT: ImageFormat = "png";
const HASH_REGEX = /^[a-fA-F0-9_]+$/;
const HASH_REPLACE_REGEX = /^a_/;

function validateHash(hash: string): void {
  if (!(hash && HASH_REGEX.test(hash.replace(HASH_REPLACE_REGEX, "")))) {
    throw new Error(`Invalid hash: ${hash}`);
  }
}

function buildUrl(
  parts: string[],
  options?: ImageProcessingOptions,
  baseUrl = "https://cdn.discordapp.com",
): string {
  const url = new URL(parts.join("/"), baseUrl);

  // biome-ignore lint/style/useExplicitLengthCheck: This is a valid check
  if (options?.size && options?.size > 0 && options.size > 0) {
    url.searchParams.set("size", options.size.toString());
  }

  return url.toString();
}

function getExtension(
  hash: string,
  options?: AnimatedImageOptionsEntity,
): string {
  if ((hash.startsWith("a_") || options?.animated) && !options?.format) {
    return "gif";
  }
  return options?.format ?? DEFAULT_FORMAT;
}

export const Cdn = {
  attachment(
    channelId: Snowflake,
    attachmentId: Snowflake,
    filename: string,
    options?: ImageProcessingOptions,
  ): string {
    const path = [
      "attachments",
      channelId,
      attachmentId,
      encodeURIComponent(filename),
    ];
    const url = new URL(path.join("/"), "https://cdn.discordapp.com");

    // biome-ignore lint/style/useExplicitLengthCheck: Bug in biome
    if (options?.size && options.size > 0) {
      url.searchParams.set("size", options.size.toString());
    }

    return url.toString();
  },

  getDefaultAvatarIndex(discriminator: string): number {
    return Number.parseInt(discriminator) % 5;
  },

  getNewSystemAvatarIndex(userId: Snowflake): number {
    return Number((BigInt(userId) >> 22n) % 6n);
  },

  emoji(emojiId: Snowflake, options?: AnimatedImageOptionsEntity): string {
    const extension = options?.animated ? "gif" : getExtension("", options);
    return buildUrl(["emojis", `${emojiId}.${extension}`], options);
  },

  userAvatar(
    userId: Snowflake,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(["avatars", userId, `${hash}.${extension}`], options);
  },

  defaultUserAvatar(discriminator: string): string {
    const index = Cdn.getDefaultAvatarIndex(discriminator);
    return buildUrl(["embed/avatars", `${index}.png`]);
  },

  userBanner(
    userId: Snowflake,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(["banners", userId, `${hash}.${extension}`], options);
  },

  avatarDecoration(assetId: Snowflake): string {
    return buildUrl(["avatar-decoration-presets", `${assetId}.png`]);
  },

  guildIcon(
    guildId: Snowflake,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(["icons", guildId, `${hash}.${extension}`], options);
  },

  guildSplash(
    guildId: Snowflake,
    hash: string,
    options?: ImageProcessingOptions,
  ): string {
    validateHash(hash);
    return buildUrl(
      ["splashes", guildId, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  guildDiscoverySplash(
    guildId: Snowflake,
    hash: string,
    options?: ImageProcessingOptions,
  ): string {
    validateHash(hash);
    return buildUrl(
      [
        "discovery-splashes",
        guildId,
        `${hash}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  guildMemberAvatar(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(
      ["guilds", guildId, "users", userId, "avatars", `${hash}.${extension}`],
      options,
    );
  },

  guildMemberBanner(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(
      ["guilds", guildId, "users", userId, "banners", `${hash}.${extension}`],
      options,
    );
  },

  guildScheduledEventCover(
    eventId: Snowflake,
    hash: string,
    options?: ImageProcessingOptions,
  ): string {
    validateHash(hash);
    return buildUrl(
      ["guild-events", eventId, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  applicationIcon(
    applicationId: Snowflake,
    hash: string,
    options?: ImageProcessingOptions,
  ): string {
    validateHash(hash);
    return buildUrl(
      [
        "app-icons",
        applicationId,
        `${hash}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  applicationCover(
    applicationId: Snowflake,
    hash: string,
    options?: ImageProcessingOptions,
  ): string {
    validateHash(hash);
    return buildUrl(
      [
        "app-icons",
        applicationId,
        `${hash}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  applicationAsset(
    applicationId: Snowflake,
    assetId: string,
    options?: ImageProcessingOptions,
  ): string {
    return buildUrl(
      [
        "app-assets",
        applicationId,
        `${assetId}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  achievementIcon(
    applicationId: Snowflake,
    achievementId: Snowflake,
    hash: string,
    options?: ImageProcessingOptions,
  ): string {
    validateHash(hash);
    return buildUrl(
      [
        "app-assets",
        applicationId,
        "achievements",
        achievementId,
        "icons",
        `${hash}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  storePageAsset(
    applicationId: Snowflake,
    assetId: Snowflake,
    options?: ImageProcessingOptions,
  ): string {
    return buildUrl(
      [
        "app-assets",
        applicationId,
        "store",
        `${assetId}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  stickerPackBanner(
    bannerAssetId: Snowflake,
    options?: ImageProcessingOptions,
  ): string {
    return buildUrl(
      [
        "app-assets",
        "710982414301790216",
        "store",
        `${bannerAssetId}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  sticker(stickerId: Snowflake, options?: StickerFormatOptionsEntity): string {
    const format = options?.format || "png";

    if (format === "gif" && options?.useMediaUrl) {
      return buildUrl(
        ["stickers", `${stickerId}.gif`],
        undefined,
        "https://media.discordapp.net",
      );
    }

    if (format === "json") {
      return buildUrl(["stickers", `${stickerId}.json`]);
    }

    return buildUrl(["stickers", `${stickerId}.png`]);
  },

  teamIcon(
    teamId: Snowflake,
    hash: string,
    options?: ImageProcessingOptions,
  ): string {
    validateHash(hash);
    return buildUrl(
      ["team-icons", teamId, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  roleIcon(
    roleId: Snowflake,
    hash: string,
    options?: ImageProcessingOptions,
  ): string {
    validateHash(hash);
    return buildUrl(
      ["role-icons", roleId, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },
} as const;
