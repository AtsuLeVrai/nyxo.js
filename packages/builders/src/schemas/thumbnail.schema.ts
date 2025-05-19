import {
  ComponentType,
  type ThumbnailEntity,
  type UnfurledMediaItemEntity,
} from "@nyxojs/core";
import { z } from "zod/v4";

/**
 * Zod validator for an unfurled media item.
 * Validates the media structure according to Discord's requirements.
 */
export const UnfurledMediaItemSchema = z.object({
  /**
   * URL of the media.
   * Supports arbitrary URLs and attachment references.
   */
  url: z.string(),

  /**
   * The proxied URL of the media item.
   * This field is ignored in requests and provided by the API in responses.
   */
  proxy_url: z.string().optional(),

  /**
   * The height of the media item.
   * This field is ignored in requests and provided by the API in responses.
   */
  height: z.number().int().positive().nullish(),

  /**
   * The width of the media item.
   * This field is ignored in requests and provided by the API in responses.
   */
  width: z.number().int().positive().nullish(),

  /**
   * The media type of the content.
   * This field is ignored in requests and provided by the API in responses.
   */
  content_type: z.string().optional(),
}) satisfies z.ZodType<UnfurledMediaItemEntity, UnfurledMediaItemEntity>;

/**
 * Zod validator for a thumbnail component.
 * Validates the thumbnail structure according to Discord's requirements.
 */
export const ThumbnailSchema = z
  .object({
    /**
     * Type of component - always 11 for a thumbnail.
     */
    type: z.literal(ComponentType.Thumbnail),

    /**
     * Optional identifier for component.
     * 32-bit integer used as an optional identifier.
     */
    id: z.number().int().optional(),

    /**
     * The media for this thumbnail.
     * A URL or attachment reference.
     */
    media: UnfurledMediaItemSchema,

    /**
     * Alt text for the media.
     * Description of the image for accessibility.
     */
    description: z.string().optional(),

    /**
     * Whether the thumbnail should be a spoiler.
     * If true, the thumbnail will be blurred out initially.
     */
    spoiler: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Ensure the URL is not empty
      return data.media.url.trim().length > 0;
    },
    {
      message: "Thumbnail media URL cannot be empty",
      path: ["media", "url"],
    },
  ) satisfies z.ZodType<ThumbnailEntity, ThumbnailEntity>;
