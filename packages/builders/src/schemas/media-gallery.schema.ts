import {
  ComponentType,
  type MediaGalleryEntity,
  type MediaGalleryItemEntity,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { COMPONENT_LIMITS } from "../utils/index.js";
import { UnfurledMediaItemSchema } from "./thumbnail.schema.js";

/**
 * Zod validator for a media gallery item.
 * Validates the gallery item structure according to Discord's requirements.
 */
export const MediaGalleryItemSchema = z.object({
  /**
   * The media for this gallery item.
   * A URL or attachment reference.
   */
  media: UnfurledMediaItemSchema,

  /**
   * Alt text for the media.
   * Description of the image for accessibility.
   */
  description: z.string().optional(),

  /**
   * Whether the media should be a spoiler.
   * If true, the media will be blurred out initially.
   */
  spoiler: z.boolean().default(false),
}) satisfies z.ZodType<MediaGalleryItemEntity, MediaGalleryItemEntity>;

/**
 * Zod validator for a media gallery component.
 * Validates the media gallery structure according to Discord's requirements.
 */
export const MediaGallerySchema = z.object({
  /**
   * Type of component - always 12 for a media gallery.
   */
  type: z.literal(ComponentType.MediaGallery),

  /**
   * Optional identifier for component.
   * 32-bit integer used as an optional identifier.
   */
  id: z.number().int().optional(),

  /**
   * Items in this gallery.
   * Array of 1 to 10 media gallery items.
   */
  items: z
    .array(MediaGalleryItemSchema)
    .min(1)
    .max(COMPONENT_LIMITS.GALLERY_ITEMS),
}) satisfies z.ZodType<MediaGalleryEntity, MediaGalleryEntity>;
