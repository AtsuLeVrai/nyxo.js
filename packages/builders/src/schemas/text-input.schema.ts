import {
  ComponentType,
  type TextInputEntity,
  TextInputStyle,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Zod validator for a text input component.
 * Validates the text input structure according to Discord's requirements.
 */
export const TextInputSchema = z
  .object({
    /**
     * Type of component - always 4 for a text input.
     */
    type: z.literal(ComponentType.TextInput),

    /**
     * A developer-defined identifier for the input.
     * Used to identify this component in interaction payloads.
     */
    custom_id: z.string().max(COMPONENT_LIMITS.CUSTOM_ID),

    /**
     * The Text Input Style.
     * Determines whether this is a single-line or multi-line input.
     */
    style: z.enum(TextInputStyle),

    /**
     * Label for this component.
     * Text displayed above the input field.
     */
    label: z.string().max(COMPONENT_LIMITS.TEXT_INPUT_LABEL),

    /**
     * Minimum input length for a text input.
     * The smallest number of characters a user must enter.
     */
    min_length: z
      .number()
      .int()
      .min(0)
      .max(COMPONENT_LIMITS.TEXT_INPUT_VALUE)
      .optional(),

    /**
     * Maximum input length for a text input.
     * The largest number of characters a user can enter.
     */
    max_length: z
      .number()
      .int()
      .min(1)
      .max(COMPONENT_LIMITS.TEXT_INPUT_VALUE)
      .optional(),

    /**
     * Whether this component is required to be filled.
     * If true, users must enter a value before submitting.
     */
    required: z.boolean().default(true),

    /**
     * Pre-filled value for this component.
     * Text that appears in the input field by default.
     */
    value: z.string().max(COMPONENT_LIMITS.TEXT_INPUT_VALUE).optional(),

    /**
     * Custom placeholder text if the input is empty.
     * Shown when the input field is empty.
     */
    placeholder: z
      .string()
      .max(COMPONENT_LIMITS.TEXT_INPUT_PLACEHOLDER)
      .optional(),

    /**
     * Optional identifier for component.
     * 32-bit integer used as an optional identifier.
     */
    id: z.number().int().optional(),
  })
  .refine(
    (data) => {
      // Ensure min_length is not greater than max_length if both are defined
      if (data.min_length !== undefined && data.max_length !== undefined) {
        return data.min_length <= data.max_length;
      }
      return true;
    },
    {
      message: "Minimum length cannot be greater than maximum length",
      path: ["min_length"],
    },
  )
  .refine(
    (data) => {
      // If a value is provided, ensure it meets min_length if defined
      if (data.value !== undefined && data.min_length !== undefined) {
        return data.value.length >= data.min_length;
      }
      return true;
    },
    {
      message: "Value length is less than minimum length",
      path: ["value"],
    },
  )
  .refine(
    (data) => {
      // If a value is provided, ensure it meets max_length if defined
      if (data.value !== undefined && data.max_length !== undefined) {
        return data.value.length <= data.max_length;
      }
      return true;
    },
    {
      message: "Value length exceeds maximum length",
      path: ["value"],
    },
  ) satisfies z.ZodType<TextInputEntity, TextInputEntity>;
