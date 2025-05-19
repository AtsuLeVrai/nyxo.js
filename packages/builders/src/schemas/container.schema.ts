import { ComponentType, type ContainerEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { COMPONENT_LIMITS } from "../utils/index.js";
import { ActionRowSchema } from "./action-row.schema.js";
import { FileSchema } from "./file.schema.js";
import { MediaGallerySchema } from "./media-gallery.schema.js";
import { SectionSchema } from "./section.schema.js";
import { SeparatorSchema } from "./separator.schema.js";
import { TextDisplaySchema } from "./text-display.schema.js";

/**
 * Zod validator for container components.
 * Only specific component types are allowed in a container.
 */
export const ContainerComponentSchema = z.union([
  ActionRowSchema,
  TextDisplaySchema,
  SectionSchema,
  MediaGallerySchema,
  SeparatorSchema,
  FileSchema,
]);

/**
 * Zod validator for a container component.
 * Validates the container structure according to Discord's requirements.
 */
export const ContainerSchema = z
  .object({
    /**
     * Type of component - always 17 for a container.
     */
    type: z.literal(ComponentType.Container),

    /**
     * Optional identifier for component.
     * 32-bit integer used as an optional identifier.
     */
    id: z.number().int().optional(),

    /**
     * Components in this container.
     * Array of up to 10 supported component types.
     */
    components: z
      .array(ContainerComponentSchema)
      .min(1)
      .max(COMPONENT_LIMITS.CONTAINER_COMPONENTS),

    /**
     * Color for the accent on the container.
     * RGB color from 0x000000 to 0xFFFFFF.
     */
    accent_color: z
      .number()
      .int()
      .nonnegative()
      .max(0xffffff)
      .nullable()
      .optional(),

    /**
     * Whether the container should be a spoiler.
     * If true, the container will be blurred out initially.
     */
    spoiler: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Ensure all components are of supported types
      return data.components.every(
        (component) =>
          component.type === ComponentType.ActionRow ||
          component.type === ComponentType.TextDisplay ||
          component.type === ComponentType.Section ||
          component.type === ComponentType.MediaGallery ||
          component.type === ComponentType.Separator ||
          component.type === ComponentType.File,
      );
    },
    {
      message:
        "Container only supports ActionRow, TextDisplay, Section, MediaGallery, Separator, and File components",
      path: ["components"],
    },
  ) satisfies z.ZodType<ContainerEntity, ContainerEntity>;
