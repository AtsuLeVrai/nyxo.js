import { ComponentType, type SectionEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { COMPONENT_LIMITS } from "../utils/index.js";
import { ButtonSchema } from "./button.schema.js";
import { TextDisplaySchema } from "./text-display.schema.js";
import { ThumbnailSchema } from "./thumbnail.schema.js";

/**
 * Zod validator for section accessories.
 * Sections can have either a thumbnail or a button as an accessory.
 */
export const SectionAccessorySchema = z.union([ThumbnailSchema, ButtonSchema]);

/**
 * Zod validator for a section component.
 * Validates the section structure according to Discord's requirements.
 */
export const SectionSchema = z
  .object({
    /**
     * Type of component - always 9 for a section.
     */
    type: z.literal(ComponentType.Section),

    /**
     * Optional identifier for component.
     * 32-bit integer used as an optional identifier.
     */
    id: z.number().int().optional(),

    /**
     * Text components in this section.
     * Array of one to three text display components.
     */
    components: z
      .array(TextDisplaySchema)
      .min(1)
      .max(COMPONENT_LIMITS.SECTION_TEXT_COMPONENTS),

    /**
     * An accessory component for this section.
     * Can be a thumbnail or button component.
     */
    accessory: SectionAccessorySchema,
  })
  .refine(
    (data) => {
      // Ensure all components are text display components
      return data.components.every(
        (component) => component.type === ComponentType.TextDisplay,
      );
    },
    {
      message: "All section components must be TextDisplay components",
      path: ["components"],
    },
  )
  .refine(
    (data) => {
      // Ensure accessory is either a thumbnail or a button
      return (
        data.accessory.type === ComponentType.Thumbnail ||
        data.accessory.type === ComponentType.Button
      );
    },
    {
      message: "Section accessory must be a Thumbnail or Button component",
      path: ["accessory"],
    },
  ) satisfies z.ZodType<SectionEntity, SectionEntity>;
