import {
  type EmbedAuthorEntity,
  type EmbedEntity,
  type EmbedFieldEntity,
  type EmbedFooterEntity,
  type EmbedImageEntity,
  type EmbedProviderEntity,
  type EmbedThumbnailEntity,
  EmbedType,
  type EmbedVideoEntity,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { EMBED_LIMITS } from "../utils/index.js";

/**
 * Zod validator for an embed field.
 * Validates the field name, value, and inline flag according to Discord's requirements.
 */
export const EmbedFieldSchema = z.object({
  /**
   * Name of the field.
   * Title/header of this field section.
   */
  name: z.string().max(EMBED_LIMITS.FIELD_NAME),

  /**
   * Value of the field.
   * Content text for this field section.
   */
  value: z.string().max(EMBED_LIMITS.FIELD_VALUE),

  /**
   * Whether or not this field should display inline.
   * If true, field will be displayed side-by-side with other inline fields.
   */
  inline: z.boolean().default(false),
}) satisfies z.ZodType<EmbedFieldEntity, EmbedFieldEntity>;

/**
 * Zod validator for an embed footer.
 * Validates the footer text and optional icon according to Discord's requirements.
 */
export const EmbedFooterSchema = z.object({
  /**
   * Footer text.
   * Text displayed in the footer area.
   */
  text: z.string().max(EMBED_LIMITS.FOOTER_TEXT),

  /**
   * URL of footer icon.
   * Image displayed next to footer text.
   */
  icon_url: z.url().optional(),

  /**
   * A proxied URL of the footer icon.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_icon_url: z.url().optional(),
}) satisfies z.ZodType<EmbedFooterEntity, EmbedFooterEntity>;

/**
 * Zod validator for an embed author.
 * Validates the author name and optional URL/icon according to Discord's requirements.
 */
export const EmbedAuthorSchema = z.object({
  /**
   * Name of author.
   * Display name for the author section.
   */
  name: z.string().max(EMBED_LIMITS.AUTHOR_NAME),

  /**
   * URL of author.
   * Link for the author's name.
   */
  url: z.url().optional(),

  /**
   * URL of author icon.
   * Avatar/icon displayed next to author name.
   */
  icon_url: z.url().optional(),

  /**
   * A proxied URL of author icon.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_icon_url: z.url().optional(),
}) satisfies z.ZodType<EmbedAuthorEntity, EmbedAuthorEntity>;

/**
 * Zod validator for an embed provider.
 * Validates the provider name and URL.
 */
export const EmbedProviderSchema = z.object({
  /**
   * Name of provider.
   * Name of the service that provided the embed content.
   */
  name: z.string().optional(),

  /**
   * URL of provider.
   * Link to the provider's site.
   */
  url: z.url().optional(),
}) satisfies z.ZodType<EmbedProviderEntity, EmbedProviderEntity>;

/**
 * Zod validator for an embed image or thumbnail.
 * Validates the image URL and optional dimensions.
 */
export const EmbedImageSchema = z.object({
  /**
   * Source URL of image.
   * Direct link to the image.
   */
  url: z.url(),

  /**
   * A proxied URL of the image.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_url: z.url().optional(),

  /**
   * Height of image.
   * Image height in pixels.
   */
  height: z.number().int().positive().optional(),

  /**
   * Width of image.
   * Image width in pixels.
   */
  width: z.number().int().positive().optional(),
}) satisfies z.ZodType<EmbedImageEntity, EmbedImageEntity>;

/**
 * Zod validator for an embed thumbnail.
 * Validates the thumbnail URL and optional dimensions.
 */
export const EmbedThumbnailSchema = z.object({
  /**
   * Source URL of thumbnail.
   * Direct link to the thumbnail image.
   */
  url: z.url(),

  /**
   * A proxied URL of the thumbnail.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_url: z.url().optional(),

  /**
   * Height of thumbnail.
   * Thumbnail height in pixels.
   */
  height: z.number().int().positive().optional(),

  /**
   * Width of thumbnail.
   * Thumbnail width in pixels.
   */
  width: z.number().int().positive().optional(),
}) satisfies z.ZodType<EmbedThumbnailEntity, EmbedThumbnailEntity>;

/**
 * Zod validator for an embed video.
 * Validates the video URL and optional dimensions.
 */
export const EmbedVideoSchema = z.object({
  /**
   * Source URL of video.
   * Direct link to the video.
   */
  url: z.url().optional(),

  /**
   * A proxied URL of the video.
   * CDN URL that goes through Discord's proxy.
   */
  proxy_url: z.url().optional(),

  /**
   * Height of video.
   * Video height in pixels.
   */
  height: z.number().int().positive().optional(),

  /**
   * Width of video.
   * Video width in pixels.
   */
  width: z.number().int().positive().optional(),
}) satisfies z.ZodType<EmbedVideoEntity, EmbedVideoEntity>;

/**
 * Zod validator for an embed entity.
 * Defines a comprehensive validator for all properties of a Discord embed.
 */
export const EmbedSchema = z
  .object({
    /**
     * Title of embed.
     * Main heading displayed at the top of the embed.
     */
    title: z.string().max(EMBED_LIMITS.TITLE).optional(),

    /**
     * Type of embed (always "rich" for webhook embeds).
     * Determines how the embed is rendered.
     */
    type: z.enum(EmbedType).default(EmbedType.Rich),

    /**
     * Description of embed.
     * Main text content of the embed.
     */
    description: z.string().max(EMBED_LIMITS.DESCRIPTION).optional(),

    /**
     * URL of embed.
     * Makes the title a clickable link.
     */
    url: z.url().optional(),

    /**
     * Timestamp of embed content.
     * Displays time in the footer, usually in ISO8601 format.
     */
    timestamp: z.iso.datetime().optional(),

    /**
     * Color code of the embed.
     * Color of the left border of the embed in integer format.
     */
    color: z.number().int().nonnegative().max(0xffffff).optional(),

    /**
     * Footer information.
     * Displayed at the bottom of the embed.
     */
    footer: EmbedFooterSchema.optional(),

    /**
     * Image information.
     * Large image displayed in the embed.
     */
    image: EmbedImageSchema.optional(),

    /**
     * Thumbnail information.
     * Small image displayed to the right of the embed.
     */
    thumbnail: EmbedThumbnailSchema.optional(),

    /**
     * Video information.
     * Video displayed in the embed.
     */
    video: EmbedVideoSchema.optional(),

    /**
     * Provider information.
     * Information about the source of the embed.
     */
    provider: EmbedProviderSchema.optional(),

    /**
     * Author information.
     * Displayed at the top of the embed before the title.
     */
    author: EmbedAuthorSchema.optional(),

    /**
     * Fields information.
     * Sections of titled text content within the embed.
     */
    fields: z.array(EmbedFieldSchema).max(EMBED_LIMITS.FIELDS).optional(),
  })
  .refine(
    (data) => {
      // Calculate total character count
      let length = 0;

      if (data.title) {
        length += data.title.length;
      }
      if (data.description) {
        length += data.description.length;
      }
      if (data.footer?.text) {
        length += data.footer.text.length;
      }
      if (data.author?.name) {
        length += data.author.name.length;
      }

      if (data.fields) {
        for (const field of data.fields) {
          length += field.name.length + field.value.length;
        }
      }

      return length <= EMBED_LIMITS.TOTAL_LENGTH;
    },
    {
      message: `Embed exceeds maximum total character limit (${EMBED_LIMITS.TOTAL_LENGTH})`,
      path: ["_all"],
    },
  ) satisfies z.ZodType<EmbedEntity, EmbedEntity>;
