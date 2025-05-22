import { type ActionRowEntity, ComponentType } from "@nyxojs/core";
import { z } from "zod/v4";
import { COMPONENT_LIMITS } from "../utils/index.js";
import { ButtonSchema } from "./button.schema.js";
import {
  ChannelSelectMenuSchema,
  MentionableSelectMenuSchema,
  RoleSelectMenuSchema,
  StringSelectMenuSchema,
  UserSelectMenuSchema,
} from "./select-menu.schema.js";
import { TextInputSchema } from "./text-input.schema.js";

/**
 * Checks if the given component type is a select menu component.
 */
export function isSelectMenuComponent(type: ComponentType): boolean {
  return [
    ComponentType.StringSelect,
    ComponentType.UserSelect,
    ComponentType.RoleSelect,
    ComponentType.MentionableSelect,
    ComponentType.ChannelSelect,
  ].includes(type);
}

/**
 * Zod validator for components that can be placed in an action row.
 * Discriminates based on the component type.
 */
export const ActionRowComponentSchema = z.discriminatedUnion("type", [
  ButtonSchema,
  StringSelectMenuSchema,
  UserSelectMenuSchema,
  RoleSelectMenuSchema,
  MentionableSelectMenuSchema,
  ChannelSelectMenuSchema,
  TextInputSchema,
]);

/**
 * Zod validator for an action row component.
 * Validates the action row structure according to Discord's requirements.
 */
export const ActionRowSchema = z
  .object({
    /**
     * Type of component - always 1 for an action row.
     */
    type: z.literal(ComponentType.ActionRow),

    /**
     * Optional identifier for component.
     * 32-bit integer used as an optional identifier.
     */
    id: z.number().int().optional(),

    /**
     * Components in this action row.
     * Array of components that this action row contains.
     */
    components: z
      .array(ActionRowComponentSchema)
      .max(COMPONENT_LIMITS.ACTION_ROW_COMPONENTS),
  })
  .refine(
    (data) => {
      // Action row must have at least one component
      return data.components.length > 0;
    },
    {
      message: "Action row must have at least one component",
      path: ["components"],
    },
  )
  .refine(
    (data) => {
      // Check if components are compatible with each other
      if (data.components.length === 0) {
        return true;
      }

      const firstComponent = data.components[0] as z.infer<
        typeof ActionRowComponentSchema
      >;

      // Text inputs must be the only component in an action row
      if (firstComponent.type === ComponentType.TextInput) {
        return data.components.length === 1;
      }

      // Select menus must be the only component in an action row and all of the same type
      if (isSelectMenuComponent(firstComponent.type)) {
        return data.components.length === 1;
      }

      // For buttons, ensure no select menus or text inputs are mixed in
      return data.components.every((c) => c.type === ComponentType.Button);
    },
    {
      message:
        "Incompatible component types in action row. Action rows can contain either: " +
        "1) Up to 5 Buttons, 2) A single Select Menu, or 3) A single Text Input",
      path: ["components"],
    },
  ) satisfies z.ZodType<ActionRowEntity, ActionRowEntity>;
