import { ComponentType, type TextDisplayEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Zod validator for a text display component.
 * Validates the text display structure according to Discord's requirements.
 */
export const TextDisplaySchema = z.object({
  /**
   * Type of component - always 10 for a text display.
   */
  type: z.literal(ComponentType.TextDisplay),

  /**
   * Optional identifier for component.
   * 32-bit integer used as an optional identifier.
   */
  id: z.number().int().optional(),

  /**
   * Text content to display.
   * Supports markdown formatting.
   */
  content: z.string().min(1).max(COMPONENT_LIMITS.TEXT_DISPLAY_LENGTH),
}) satisfies z.ZodType<TextDisplayEntity, TextDisplayEntity>;
