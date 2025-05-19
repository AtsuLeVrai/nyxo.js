import { ComponentType, type SeparatorEntity } from "@nyxojs/core";
import { z } from "zod/v4";

/**
 * Zod validator for a separator component.
 * Validates the separator structure according to Discord's requirements.
 */
export const SeparatorSchema = z.object({
  /**
   * Type of component - always 14 for a separator.
   */
  type: z.literal(ComponentType.Separator),

  /**
   * Optional identifier for component.
   * 32-bit integer used as an optional identifier.
   */
  id: z.number().int().optional(),

  /**
   * Whether a visual divider should be displayed.
   * If true, a horizontal line will be shown as part of the separator.
   */
  divider: z.boolean().default(true),

  /**
   * Size of separator padding.
   * Controls the amount of vertical space the separator adds.
   */
  spacing: z.union([z.literal(1), z.literal(2)]).default(1),
}) satisfies z.ZodType<SeparatorEntity, SeparatorEntity>;
