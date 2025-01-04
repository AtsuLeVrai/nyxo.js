import { type Snowflake, SnowflakeManager } from "@nyxjs/core";
import { SignedUrlManager } from "../managers/index.js";
import {
  type AnimatedImageOptionsEntity,
  type AttachmentOptionsEntity,
  type BaseImageOptionsEntity,
  type CdnEntity,
  IMAGE_FORMAT,
  IMAGE_SIZE,
  type ImageFormat,
  type ImageSize,
  type StickerFormatOptionsEntity,
} from "../types/index.js";
import { Rest } from "./rest.js";

const DEFAULT_FORMAT: ImageFormat = "png";
const VALID_FORMATS: Set<string> = new Set(Object.values(IMAGE_FORMAT));
const VALID_SIZES: Set<number> = new Set(Object.values(IMAGE_SIZE));
const signedUrlManager = new SignedUrlManager(
  process.env.DISCORD_SIGNING_KEY ?? "",
);

function validateId(id: Snowflake | number, name = "ID"): string {
  const stringId = id.toString();
  if (!SnowflakeManager.isValid(stringId)) {
    throw new Error(`Invalid ${name}: ${id}`);
  }
  return stringId;
}

function validateHash(hash: string): void {
  if (!(hash && /^[a-fA-F0-9_]+$/.test(hash.replace(/^a_/, "")))) {
    throw new Error(`Invalid hash: ${hash}`);
  }
}

function validateSize(size?: number): void {
  if (size !== undefined && !VALID_SIZES.has(size)) {
    throw new Error(
      `Invalid size. Must be one of: ${Array.from(VALID_SIZES).join(", ")}`,
    );
  }
}

function validateFormat(format?: string): void {
  if (format && !VALID_FORMATS.has(format)) {
    throw new Error(
      `Invalid format. Must be one of: ${Array.from(VALID_FORMATS).join(", ")}`,
    );
  }
}

function isAnimated(hash: string): boolean {
  return hash.startsWith("a_");
}

function buildUrl(
  parts: string[],
  options?: BaseImageOptionsEntity,
  baseUrl: string = Rest.CDN_URL,
): string {
  if (options) {
    validateSize(options.size);
    validateFormat(options.format);
  }

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
  if ((isAnimated(hash) || options?.animated) && !options?.format) {
    return "gif";
  }
  return options?.format ?? DEFAULT_FORMAT;
}

export const Cdn: CdnEntity = {
  attachment(
    channelId: Snowflake | number,
    attachmentId: Snowflake | number,
    filename: string,
    options?: AttachmentOptionsEntity,
  ): string {
    const cId = validateId(channelId, "Channel ID");
    const aId = validateId(attachmentId, "Attachment ID");

    const path = ["attachments", cId, aId, encodeURIComponent(filename)];
    const url = new URL(path.join("/"), Rest.CDN_URL);

    // biome-ignore lint/style/useExplicitLengthCheck: This is a valid check
    if (options?.size && options?.size > 0) {
      validateSize(options.size);
      url.searchParams.set("size", options.size.toString());
    }

    if (options?.signed) {
      return signedUrlManager.signUrl(url.toString());
    }

    return url.toString();
  },

  getDefaultAvatarIndex(discriminator: number | string): number {
    const discrim =
      typeof discriminator === "string"
        ? Number.parseInt(discriminator)
        : discriminator;
    return discrim % 5;
  },

  getNewSystemAvatarIndex(userId: Snowflake): number {
    return Number((BigInt(userId) >> 22n) % 6n);
  },

  getNearestValidSize(size: number): ImageSize {
    const validSizes = Array.from(VALID_SIZES).sort((a, b) => a - b);
    return validSizes.reduce((prev, curr) =>
      Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev,
    ) as ImageSize;
  },

  emoji(
    emojiId: Snowflake | number,
    options?: AnimatedImageOptionsEntity,
  ): string {
    const id = validateId(emojiId, "Emoji ID");
    const extension = options?.animated ? "gif" : getExtension("", options);
    return buildUrl(["emojis", `${id}.${extension}`], options);
  },

  userAvatar(
    userId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    const id = validateId(userId, "User ID");
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(["avatars", id, `${hash}.${extension}`], options);
  },

  defaultUserAvatar(discriminator: number | string): string {
    const index = Cdn.getDefaultAvatarIndex(discriminator);
    return buildUrl(["embed/avatars", `${index}.png`]);
  },

  userBanner(
    userId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    const id = validateId(userId, "User ID");
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(["banners", id, `${hash}.${extension}`], options);
  },

  avatarDecoration(assetId: Snowflake | number): string {
    const id = validateId(assetId, "Asset ID");
    return buildUrl(["avatar-decoration-presets", `${id}.png`]);
  },

  guildIcon(
    guildId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    const id = validateId(guildId, "Guild ID");
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(["icons", id, `${hash}.${extension}`], options);
  },

  guildSplash(
    guildId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(guildId, "Guild ID");
    validateHash(hash);
    return buildUrl(
      ["splashes", id, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  guildDiscoverySplash(
    guildId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(guildId, "Guild ID");
    validateHash(hash);
    return buildUrl(
      [
        "discovery-splashes",
        id,
        `${hash}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  guildMemberAvatar(
    guildId: Snowflake | number,
    userId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    const gId = validateId(guildId, "Guild ID");
    const uId = validateId(userId, "User ID");
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(
      ["guilds", gId, "users", uId, "avatars", `${hash}.${extension}`],
      options,
    );
  },

  guildMemberBanner(
    guildId: Snowflake | number,
    userId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ): string {
    const gId = validateId(guildId, "Guild ID");
    const uId = validateId(userId, "User ID");
    validateHash(hash);
    const extension = getExtension(hash, options);
    return buildUrl(
      ["guilds", gId, "users", uId, "banners", `${hash}.${extension}`],
      options,
    );
  },

  guildScheduledEventCover(
    eventId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(eventId, "Event ID");
    validateHash(hash);
    return buildUrl(
      ["guild-events", id, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  applicationIcon(
    applicationId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(applicationId, "Application ID");
    validateHash(hash);
    return buildUrl(
      ["app-icons", id, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  applicationCover(
    applicationId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(applicationId, "Application ID");
    validateHash(hash);
    return buildUrl(
      ["app-icons", id, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  applicationAsset(
    applicationId: Snowflake | number,
    assetId: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(applicationId, "Application ID");
    return buildUrl(
      ["app-assets", id, `${assetId}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  achievementIcon(
    applicationId: Snowflake | number,
    achievementId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const appId = validateId(applicationId, "Application ID");
    const achId = validateId(achievementId, "Achievement ID");
    validateHash(hash);
    return buildUrl(
      [
        "app-assets",
        appId,
        "achievements",
        achId,
        "icons",
        `${hash}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  storePageAsset(
    applicationId: Snowflake | number,
    assetId: Snowflake,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(applicationId, "Application ID");
    return buildUrl(
      [
        "app-assets",
        id,
        "store",
        `${assetId}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  stickerPackBanner(
    bannerAssetId: Snowflake | number,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(bannerAssetId, "Banner Asset ID");
    return buildUrl(
      [
        "app-assets",
        "710982414301790216",
        "store",
        `${id}.${options?.format || DEFAULT_FORMAT}`,
      ],
      options,
    );
  },

  sticker(
    stickerId: Snowflake | number,
    options?: StickerFormatOptionsEntity,
  ): string {
    const id = validateId(stickerId, "Sticker ID");
    const format = options?.format || "png";

    if (format === "gif" && options?.useMediaUrl) {
      return buildUrl(["stickers", `${id}.gif`], undefined, Rest.MEDIA_URL);
    }

    if (format === "json") {
      return buildUrl(["stickers", `${id}.json`]);
    }

    return buildUrl(["stickers", `${id}.png`]);
  },

  teamIcon(
    teamId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(teamId, "Team ID");
    validateHash(hash);
    return buildUrl(
      ["team-icons", id, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },

  roleIcon(
    roleId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ): string {
    const id = validateId(roleId, "Role ID");
    validateHash(hash);
    return buildUrl(
      ["role-icons", id, `${hash}.${options?.format || DEFAULT_FORMAT}`],
      options,
    );
  },
};
