import { createHmac } from "node:crypto";
import { type Snowflake, SnowflakeManager } from "@nyxjs/core";
import type {
  AnimatedImageOptionsEntity,
  AttachmentOptionsEntity,
  BaseImageOptionsEntity,
  CdnEntity,
  ImageFormat,
  SignedAttachmentParametersEntity,
  StickerFormatOptionsEntity,
} from "./types/index.js";

const DEFAULT_FORMAT: ImageFormat = "png";

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

function isAnimated(hash: string): boolean {
  return hash.startsWith("a_");
}

function buildUrl(
  parts: string[],
  options?: BaseImageOptionsEntity,
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
  if ((isAnimated(hash) || options?.animated) && !options?.format) {
    return "gif";
  }
  return options?.format ?? DEFAULT_FORMAT;
}

function extractSignedParameters(
  url: URL,
): SignedAttachmentParametersEntity | null {
  const ex = url.searchParams.get("ex");
  const is = url.searchParams.get("is");
  const hm = url.searchParams.get("hm");

  if (!(ex && is && hm)) {
    return null;
  }

  return { ex, is, hm };
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
    const url = new URL(path.join("/"), "https://cdn.discordapp.com");

    // biome-ignore lint/style/useExplicitLengthCheck: This is a valid check
    if (options?.size && options?.size > 0) {
      url.searchParams.set("size", options.size.toString());
    }

    if (options?.signed) {
      return Cdn.signUrl(url.toString(), options.signed.signingKey);
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
      return buildUrl(
        ["stickers", `${id}.gif`],
        undefined,
        "https://media.discordapp.net",
      );
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

  signUrl(url: string, signingKey: string): string {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;

    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 300;

    const params = Cdn.createSignedParameters(path, signingKey, expiry, now);

    parsedUrl.searchParams.set("ex", params.ex);
    parsedUrl.searchParams.set("is", params.is);
    parsedUrl.searchParams.set("hm", params.hm);

    return parsedUrl.toString();
  },

  createSignedParameters(
    path: string,
    signingKey: string,
    expiryTimestamp: number,
    issuedTimestamp: number,
  ): SignedAttachmentParametersEntity {
    const ex = expiryTimestamp.toString(16);
    const is = issuedTimestamp.toString(16);

    const message = `${path}?ex=${ex}&is=${is}`;
    const hmac = createHmac("sha256", signingKey).update(message).digest("hex");

    return {
      ex,
      is,
      hm: hmac,
    };
  },

  verifySignedUrl(url: string, signingKey: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const params = extractSignedParameters(parsedUrl);

      if (!params) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiry = Number.parseInt(params.ex, 16);
      if (now > expiry) {
        return false;
      }

      const expectedParams = Cdn.createSignedParameters(
        parsedUrl.pathname,
        signingKey,
        expiry,
        Number.parseInt(params.is, 16),
      );

      return params.hm === expectedParams.hm;
    } catch {
      return false;
    }
  },

  refreshSignedUrl(url: string, signingKey: string): string {
    const parsedUrl = new URL(url);

    parsedUrl.searchParams.delete("ex");
    parsedUrl.searchParams.delete("is");
    parsedUrl.searchParams.delete("hm");

    return this.signUrl(parsedUrl.toString(), signingKey);
  },
};
