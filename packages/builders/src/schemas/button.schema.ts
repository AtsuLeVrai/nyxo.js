import { type ButtonEntity, ButtonStyle, ComponentType } from "@nyxojs/core";
import type { EmojiEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Zod validator for emoji structures used in buttons.
 * Validates the emoji object according to Discord's requirements.
 */
export const ButtonEmojiSchema = z.object({
  /**
   * ID of the emoji.
   * Required for custom emoji.
   */
  id: z.string().nullable(),

  /**
   * Name of the emoji.
   * Required for standard emoji.
   */
  name: z.string().nullable(),

  /**
   * Whether the emoji is animated.
   * Only applicable to custom emoji.
   */
  animated: z.boolean().optional(),
}) satisfies z.ZodType<
  Pick<EmojiEntity, "id" | "name" | "animated">,
  Pick<EmojiEntity, "id" | "name" | "animated">
>;

/**
 * Zod validator for a button component.
 * Validates the button structure according to Discord's requirements.
 */
export const ButtonSchema = z
  .object({
    /**
     * Type of component - always 2 for a button.
     */
    type: z.literal(ComponentType.Button),

    /**
     * Style of the button.
     * Defines the visual style and behavior.
     */
    style: z.enum(ButtonStyle),

    /**
     * Text displayed on the button.
     * Maximum 80 characters.
     */
    label: z.string().max(COMPONENT_LIMITS.BUTTON_LABEL).optional(),

    /**
     * Emoji displayed on the button.
     */
    emoji: ButtonEmojiSchema.optional(),

    /**
     * Developer-defined identifier for the button.
     * Used to identify this component in interaction payloads.
     * Maximum 100 characters. Required for non-link and non-premium buttons.
     */
    custom_id: z.string().max(COMPONENT_LIMITS.CUSTOM_ID).optional(),

    /**
     * URL for link-style buttons.
     * Required for link buttons (style 5).
     */
    url: z.url().optional(),

    /**
     * Identifier for a purchasable SKU for premium buttons.
     * Required for premium buttons (style 6).
     */
    sku_id: z.string().optional(),

    /**
     * Whether the button is disabled.
     * Disabled buttons cannot be clicked.
     */
    disabled: z.boolean().default(false),

    /**
     * Optional identifier for component.
     * 32-bit integer used as an optional identifier.
     */
    id: z.number().int().optional(),
  })
  .refine(
    (data) => {
      // At least a label or an emoji is required (except for Premium buttons)
      if (data.style !== ButtonStyle.Premium) {
        return data.label !== undefined || data.emoji !== undefined;
      }
      return true;
    },
    {
      message: "Button must have either a label or an emoji (or both)",
      path: ["_all"],
    },
  )
  .refine(
    (data) => {
      // Link buttons require URL and shouldn't have custom_id or sku_id
      if (data.style === ButtonStyle.Link) {
        return (
          data.url !== undefined &&
          data.custom_id === undefined &&
          data.sku_id === undefined
        );
      }
      // Premium buttons require sku_id and shouldn't have custom_id, url, label, or emoji
      if (data.style === ButtonStyle.Premium) {
        return (
          data.sku_id !== undefined &&
          data.custom_id === undefined &&
          data.url === undefined &&
          data.label === undefined &&
          data.emoji === undefined
        );
      }
      // Other button styles require custom_id and shouldn't have url or sku_id
      return (
        data.custom_id !== undefined &&
        data.url === undefined &&
        data.sku_id === undefined
      );
    },
    {
      message: "Button configuration is invalid for the selected style",
      path: ["style"],
    },
  ) satisfies z.ZodType<ButtonEntity, ButtonEntity>;
