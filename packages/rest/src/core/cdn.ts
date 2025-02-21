import type { Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const BASE_URL = "https://cdn.discordapp.com";
const MEDIA_PROXY_URL = "https://media.discordapp.net";
const ANIMATED_HASH = /^a_/;

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

export type ImageSize = z.infer<typeof ImageSize>;

export const BaseImageOptions = z.object({
  size: ImageSize.optional(),
});

export type BaseImageOptions = z.infer<typeof BaseImageOptions>;

export const RasterFormat = z.enum(["png", "jpeg", "webp"]);
export type RasterFormat = z.infer<typeof RasterFormat>;

export const AnimatedFormat = z.enum(["png", "jpeg", "webp", "gif"]);
export type AnimatedFormat = z.infer<typeof AnimatedFormat>;

export const StickerFormat = z.enum(["png", "gif", "json"]);
export type StickerFormat = z.infer<typeof StickerFormat>;

export const ImageOptions = BaseImageOptions.extend({
  format: RasterFormat.default("png"),
});

export type ImageOptions = z.infer<typeof ImageOptions>;

export const AnimatedImageOptions = BaseImageOptions.extend({
  format: AnimatedFormat.default("png"),
  animated: z.boolean().default(false),
});

export type AnimatedImageOptions = z.infer<typeof AnimatedImageOptions>;

export const StickerFormatOptions = BaseImageOptions.extend({
  format: StickerFormat.default("png"),
  useMediaProxy: z.boolean().default(true),
});

export type StickerFormatOptions = z.infer<typeof StickerFormatOptions>;

const Hash = z.string().regex(/^[a-fA-F0-9_]+$/);

export const Cdn = {
  validateSize(size: number | undefined): number | undefined {
    if (!size) {
      return undefined;
    }

    const result = ImageSize.safeParse(size);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }
    return result.data;
  },

  getFormatFromHash(
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    if (options?.format) {
      return options.format;
    }

    return ANIMATED_HASH.test(hash) || options?.animated ? "gif" : "png";
  },

  buildUrl(
    path: string[],
    options?: z.input<typeof BaseImageOptions>,
    baseUrl: typeof BASE_URL | typeof MEDIA_PROXY_URL = BASE_URL,
  ): string {
    const url = new URL(path.join("/"), baseUrl);
    const validatedSize = this.validateSize(options?.size);
    if (validatedSize) {
      url.searchParams.set("size", validatedSize.toString());
    }
    return url.toString();
  },

  emoji(
    emojiId: Snowflake,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["emojis", `${emojiId}.${result.data.format}`],
      result.data,
    );
  },

  guildIcon(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(["icons", guildId, `${hash}.${format}`], result.data);
  },

  guildSplash(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["splashes", guildId, `${hash}.${result.data.format}`],
      result.data,
    );
  },

  guildDiscoverySplash(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["discovery-splashes", guildId, `${hash}.${result.data.format}`],
      result.data,
    );
  },

  guildBanner(
    guildId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(
      ["banners", guildId, `${hash}.${format}`],
      result.data,
    );
  },

  userBanner(
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(["banners", userId, `${hash}.${format}`], result.data);
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
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(["avatars", userId, `${hash}.${format}`], result.data);
  },

  guildMemberAvatar(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(
      ["guilds", guildId, "users", userId, "avatars", `${hash}.${format}`],
      result.data,
    );
  },

  avatarDecoration(assetId: Snowflake): string {
    return this.buildUrl(["avatar-decoration-presets", `${assetId}.png`]);
  },

  applicationIcon(
    applicationId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["app-icons", applicationId, `${hash}.${result.data.format}`],
      result.data,
    );
  },

  applicationCover(
    applicationId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["app-icons", applicationId, `${hash}.${result.data.format}`],
      result.data,
    );
  },

  applicationAsset(
    applicationId: Snowflake,
    assetId: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["app-assets", applicationId, `${assetId}.${result.data.format}`],
      result.data,
    );
  },

  achievementIcon(
    applicationId: Snowflake,
    achievementId: Snowflake,
    iconHash: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(iconHash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      [
        "app-assets",
        applicationId,
        "achievements",
        achievementId,
        "icons",
        `${iconHash}.${result.data.format}`,
      ],
      result.data,
    );
  },

  storePageAsset(
    applicationId: Snowflake,
    assetId: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      [
        "app-assets",
        applicationId,
        "store",
        `${assetId}.${result.data.format}`,
      ],
      result.data,
    );
  },

  stickerPackBanner(
    bannerId: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      [
        "app-assets",
        "710982414301790216",
        "store",
        `${bannerId}.${result.data.format}`,
      ],
      result.data,
    );
  },

  teamIcon(
    teamId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["team-icons", teamId, `${hash}.${result.data.format}`],
      result.data,
    );
  },

  sticker(
    stickerId: Snowflake,
    options: z.input<typeof StickerFormatOptions> = {},
  ): string {
    const result = StickerFormatOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    if (result.data.format === "gif" && result.data.useMediaProxy) {
      return this.buildUrl(
        ["stickers", `${stickerId}.gif`],
        result.data,
        MEDIA_PROXY_URL,
      );
    }

    return this.buildUrl(
      ["stickers", `${stickerId}.${result.data.format}`],
      result.data,
    );
  },

  roleIcon(
    roleId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["role-icons", roleId, `${hash}.${result.data.format}`],
      result.data,
    );
  },

  guildScheduledEventCover(
    eventId: Snowflake,
    hash: string,
    options: z.input<typeof ImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = ImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["guild-events", eventId, `${hash}.${result.data.format}`],
      result.data,
    );
  },

  guildMemberBanner(
    guildId: Snowflake,
    userId: Snowflake,
    hash: string,
    options: z.input<typeof AnimatedImageOptions> = {},
  ): string {
    Hash.parse(hash);
    const result = AnimatedImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    const format = this.getFormatFromHash(hash, result.data);
    return this.buildUrl(
      ["guilds", guildId, "users", userId, "banners", `${hash}.${format}`],
      result.data,
    );
  },

  attachment(
    channelId: Snowflake,
    attachmentId: Snowflake,
    filename: string,
    options: z.input<typeof BaseImageOptions> = {},
  ): string {
    const result = BaseImageOptions.safeParse(options);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.buildUrl(
      ["attachments", channelId, attachmentId, encodeURIComponent(filename)],
      result.data,
    );
  },
} as const;
