import {
  type AnySelectMenuEntity,
  type ChannelSelectMenuEntity,
  ChannelType,
  ComponentType,
  type MentionableSelectMenuEntity,
  type RoleSelectMenuEntity,
  type SelectMenuDefaultValueEntity,
  type SelectMenuEntity,
  type SelectMenuOptionEntity,
  type StringSelectMenuEntity,
  type UserSelectMenuEntity,
} from "@nyxojs/core";
import type { EmojiEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Zod validator for emoji structures used in select menu options.
 * Validates the emoji object according to Discord's requirements.
 */
export const SelectMenuEmojiSchema = z.object({
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
 * Zod validator for select menu options used in string select menus.
 * Validates the option structure according to Discord's requirements.
 */
export const SelectMenuOptionSchema = z.object({
  /**
   * User-facing name of the option.
   * Text displayed to users in the dropdown.
   */
  label: z.string().max(COMPONENT_LIMITS.SELECT_OPTION_LABEL),

  /**
   * Developer-defined value of the option.
   * Value sent to your application when this option is selected.
   */
  value: z.string().max(COMPONENT_LIMITS.SELECT_OPTION_VALUE),

  /**
   * Additional description of the option.
   * Text displayed below the option label.
   */
  description: z
    .string()
    .max(COMPONENT_LIMITS.SELECT_OPTION_DESCRIPTION)
    .optional(),

  /**
   * Emoji that will be displayed with this option.
   */
  emoji: SelectMenuEmojiSchema.optional(),

  /**
   * Whether this option is selected by default.
   */
  default: z.boolean().default(false),
}) satisfies z.ZodType<SelectMenuOptionEntity, SelectMenuOptionEntity>;

/**
 * Zod validator for select menu default values.
 * Validates default value structure according to Discord's requirements.
 */
export const SelectMenuDefaultValueSchema = z.object({
  /**
   * ID of the default value (user, role, or channel).
   */
  id: z.string(),

  /**
   * Type of default value.
   */
  type: z.enum(["user", "role", "channel"]),
}) satisfies z.ZodType<
  SelectMenuDefaultValueEntity,
  SelectMenuDefaultValueEntity
>;

/**
 * Base schema for all select menu types.
 * Contains common fields shared by all select menu variants.
 */
export const BaseSelectMenuSchema = z
  .object({
    /**
     * A developer-defined identifier for the select menu.
     */
    custom_id: z.string().max(COMPONENT_LIMITS.CUSTOM_ID),

    /**
     * Custom placeholder text if nothing is selected.
     */
    placeholder: z.string().max(COMPONENT_LIMITS.SELECT_PLACEHOLDER).optional(),

    /**
     * Minimum number of items that must be chosen.
     */
    min_values: z
      .number()
      .int()
      .min(0)
      .max(COMPONENT_LIMITS.SELECT_OPTIONS)
      .optional(),

    /**
     * Maximum number of items that can be chosen.
     */
    max_values: z
      .number()
      .int()
      .min(1)
      .max(COMPONENT_LIMITS.SELECT_OPTIONS)
      .optional(),

    /**
     * Whether the select menu is disabled.
     */
    disabled: z.boolean().default(false),

    /**
     * Optional identifier for component.
     */
    id: z.number().int().optional(),
  })
  .refine(
    (data) => {
      if (data.min_values !== undefined && data.max_values !== undefined) {
        return data.min_values <= data.max_values;
      }
      return true;
    },
    {
      message: "Minimum values cannot be greater than maximum values",
      path: ["min_values"],
    },
  ) satisfies z.ZodType<
  Omit<SelectMenuEntity, "type">,
  Omit<SelectMenuEntity, "type">
>;

/**
 * Schema for string select menu components.
 * Validates the string select menu structure according to Discord's requirements.
 */
export const StringSelectMenuSchema = BaseSelectMenuSchema.extend({
  /**
   * Type of component - always 3 for string select.
   */
  type: z.literal(ComponentType.StringSelect),

  /**
   * Array of select options.
   */
  options: z
    .array(SelectMenuOptionSchema)
    .min(1)
    .max(COMPONENT_LIMITS.SELECT_OPTIONS),
}) satisfies z.ZodType<StringSelectMenuEntity, StringSelectMenuEntity>;

/**
 * Schema for user select menu components.
 * Validates the user select menu structure according to Discord's requirements.
 */
export const UserSelectMenuSchema = BaseSelectMenuSchema.extend({
  /**
   * Type of component - always 5 for user select.
   */
  type: z.literal(ComponentType.UserSelect),

  /**
   * Array of default values for the select menu.
   */
  default_values: z
    .array(
      SelectMenuDefaultValueSchema.refine((data) => data.type === "user", {
        message: "User select menu can only have user default values",
        path: ["type"],
      }),
    )
    .optional(),
}) satisfies z.ZodType<UserSelectMenuEntity, UserSelectMenuEntity>;

/**
 * Schema for role select menu components.
 * Validates the role select menu structure according to Discord's requirements.
 */
export const RoleSelectMenuSchema = BaseSelectMenuSchema.extend({
  /**
   * Type of component - always 6 for role select.
   */
  type: z.literal(ComponentType.RoleSelect),

  /**
   * Array of default values for the select menu.
   */
  default_values: z
    .array(
      SelectMenuDefaultValueSchema.refine((data) => data.type === "role", {
        message: "Role select menu can only have role default values",
        path: ["type"],
      }),
    )
    .optional(),
}) satisfies z.ZodType<RoleSelectMenuEntity, RoleSelectMenuEntity>;

/**
 * Schema for mentionable select menu components.
 * Validates the mentionable select menu structure according to Discord's requirements.
 */
export const MentionableSelectMenuSchema = BaseSelectMenuSchema.extend({
  /**
   * Type of component - always 7 for mentionable select.
   */
  type: z.literal(ComponentType.MentionableSelect),

  /**
   * Array of default values for the select menu.
   */
  default_values: z
    .array(
      SelectMenuDefaultValueSchema.refine(
        (data) => data.type === "user" || data.type === "role",
        {
          message:
            "Mentionable select menu can only have user or role default values",
          path: ["type"],
        },
      ),
    )
    .optional(),
}) satisfies z.ZodType<
  MentionableSelectMenuEntity,
  MentionableSelectMenuEntity
>;

/**
 * Schema for channel select menu components.
 * Validates the channel select menu structure according to Discord's requirements.
 */
export const ChannelSelectMenuSchema = BaseSelectMenuSchema.extend({
  /**
   * Type of component - always 8 for channel select.
   */
  type: z.literal(ComponentType.ChannelSelect),

  /**
   * Types of channels that can be selected.
   */
  channel_types: z.array(z.enum(ChannelType)).optional(),

  /**
   * Array of default values for the select menu.
   */
  default_values: z
    .array(
      SelectMenuDefaultValueSchema.refine((data) => data.type === "channel", {
        message: "Channel select menu can only have channel default values",
        path: ["type"],
      }),
    )
    .optional(),
}) satisfies z.ZodType<ChannelSelectMenuEntity, ChannelSelectMenuEntity>;

/**
 * Union of all select menu schemas.
 */
export const SelectMenuSchema = z.discriminatedUnion("type", [
  StringSelectMenuSchema,
  UserSelectMenuSchema,
  RoleSelectMenuSchema,
  MentionableSelectMenuSchema,
  ChannelSelectMenuSchema,
]) satisfies z.ZodType<AnySelectMenuEntity, AnySelectMenuEntity>;
