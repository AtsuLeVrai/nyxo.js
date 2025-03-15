import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { ChannelType } from "./channel.entity.js";
import { EmojiEntity } from "./emoji.entity.js";

/**
 * Defines the different types of components that can be used in Discord messages.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#component-object-component-types}
 */
export enum ComponentType {
  /** Container for other components (1) */
  ActionRow = 1,

  /** Button component (2) */
  Button = 2,

  /** Select menu for string values (3) */
  StringSelect = 3,

  /** Text input component (4) */
  TextInput = 4,

  /** Select menu for users (5) */
  UserSelect = 5,

  /** Select menu for roles (6) */
  RoleSelect = 6,

  /** Select menu for mentionables (users and roles) (7) */
  MentionableSelect = 7,

  /** Select menu for channels (8) */
  ChannelSelect = 8,
}

/**
 * Defines the visual styles of text input components.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#text-input-styles}
 */
export enum TextInputStyle {
  /** Single-line input (1) */
  Short = 1,

  /** Multi-line input (2) */
  Paragraph = 2,
}

/**
 * Defines the visual styles of button components.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#button-styles}
 */
export enum ButtonStyle {
  /** Blurple button (1) */
  Primary = 1,

  /** Grey button (2) */
  Secondary = 2,

  /** Green button (3) */
  Success = 3,

  /** Red button (4) */
  Danger = 4,

  /** URL button (5) */
  Link = 5,

  /** Premium subscription button (6) */
  Premium = 6,
}

/**
 * Zod schema for text input component
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#text-input-object}
 */
export const TextInputEntity = z.object({
  /** The type of component - always 4 for a text input */
  type: z.literal(ComponentType.TextInput),

  /** A developer-defined identifier for the input, max 100 characters */
  custom_id: z.string().max(100),

  /** The Text Input Style */
  style: z.nativeEnum(TextInputStyle),

  /** Label for this component, max 45 characters */
  label: z.string().max(45),

  /** Minimum input length for a text input, min 0, max 4000 */
  min_length: z.number().int().min(0).max(4000).optional(),

  /** Maximum input length for a text input, min 1, max 4000 */
  max_length: z.number().int().min(1).max(4000).optional(),

  /** Whether this component is required to be filled, default true */
  required: z.boolean().default(true),

  /** Pre-filled value for this component, max 4000 characters */
  value: z.string().max(4000).optional(),

  /** Custom placeholder text if the input is empty, max 100 characters */
  placeholder: z.string().max(100).optional(),
});

export type TextInputEntity = z.infer<typeof TextInputEntity>;

/**
 * Zod schema for select menu default value
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#select-default-value-structure}
 */
export const SelectMenuDefaultValueEntity = z.object({
  /** ID of the default value (user, role, or channel) */
  id: Snowflake,

  /** Type of default value - "user", "role", or "channel" */
  type: z.enum(["user", "role", "channel"]),
});

export type SelectMenuDefaultValueEntity = z.infer<
  typeof SelectMenuDefaultValueEntity
>;

/**
 * Zod schema for select menu option
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#select-option-structure}
 */
export const SelectMenuOptionEntity = z.object({
  /** User-facing name of the option, max 100 characters */
  label: z.string().max(100),

  /** Dev-defined value of the option, max 100 characters */
  value: z.string().max(100),

  /** Additional description of the option, max 100 characters */
  description: z.string().max(100).optional(),

  /** Emoji that will be displayed with this option */
  emoji: EmojiEntity.pick({ id: true, name: true, animated: true }).optional(),

  /** Whether this option is selected by default */
  default: z.boolean().optional(),
});

export type SelectMenuOptionEntity = z.infer<typeof SelectMenuOptionEntity>;

/**
 * Zod schema for base select menu properties
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#select-menu-object}
 */
export const BaseSelectMenuEntity = z.object({
  /** A developer-defined identifier for the select menu, max 100 characters */
  custom_id: z.string().max(100),

  /** Custom placeholder text if nothing is selected, max 150 characters */
  placeholder: z.string().max(150).optional(),

  /** Minimum number of items that must be chosen (defaults to 1, min 0, max 25) */
  min_values: z.number().int().min(0).max(25).optional().default(1),

  /** Maximum number of items that can be chosen (defaults to 1, max 25) */
  max_values: z.number().int().min(1).max(25).optional().default(1),

  /** Whether the select menu is disabled */
  disabled: z.boolean().optional(),

  /** Predefined values for auto-populated select menus */
  default_values: z.array(SelectMenuDefaultValueEntity).optional(),
});

/**
 * Zod schema for string select menu
 */
export const StringSelectMenuEntity = BaseSelectMenuEntity.extend({
  /** The type of component - always 3 for a string select menu */
  type: z.literal(ComponentType.StringSelect),

  /** Array of select options (max 25) */
  options: z.array(SelectMenuOptionEntity).min(1).max(25),
});

export type StringSelectMenuEntity = z.infer<typeof StringSelectMenuEntity>;

/**
 * Zod schema for channel select menu
 */
export const ChannelSelectMenuEntity = BaseSelectMenuEntity.extend({
  /** The type of component - always 8 for a channel select menu */
  type: z.literal(ComponentType.ChannelSelect),

  /** Types of channels that can be selected */
  channel_types: z.array(z.nativeEnum(ChannelType)).optional(),
});

export type ChannelSelectMenuEntity = z.infer<typeof ChannelSelectMenuEntity>;

/**
 * Zod schema for user select menu
 */
export const UserSelectMenuEntity = BaseSelectMenuEntity.extend({
  /** The type of component - always 5 for a user select menu */
  type: z.literal(ComponentType.UserSelect),
});

export type UserSelectMenuEntity = z.infer<typeof UserSelectMenuEntity>;

/**
 * Zod schema for role select menu
 */
export const RoleSelectMenuEntity = BaseSelectMenuEntity.extend({
  /** The type of component - always 6 for a role select menu */
  type: z.literal(ComponentType.RoleSelect),
});

export type RoleSelectMenuEntity = z.infer<typeof RoleSelectMenuEntity>;

/**
 * Zod schema for mentionable select menu
 */
export const MentionableSelectMenuEntity = BaseSelectMenuEntity.extend({
  /** The type of component - always 7 for a mentionable select menu */
  type: z.literal(ComponentType.MentionableSelect),
});

export type MentionableSelectMenuEntity = z.infer<
  typeof MentionableSelectMenuEntity
>;

/**
 * Zod schema for any select menu component
 */
export const AnySelectMenuEntity = z.discriminatedUnion("type", [
  StringSelectMenuEntity,
  ChannelSelectMenuEntity,
  UserSelectMenuEntity,
  RoleSelectMenuEntity,
  MentionableSelectMenuEntity,
]);

export type AnySelectMenuEntity = z.infer<typeof AnySelectMenuEntity>;

/**
 * Zod schema for button component
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#button-object}
 */
export const ButtonEntity = z
  .object({
    /** The type of component - always 2 for a button */
    type: z.literal(ComponentType.Button),

    /** The style of the button */
    style: z.nativeEnum(ButtonStyle),

    /** Text that appears on the button, max 80 characters */
    label: z.string().max(80).optional(),

    /** Emoji that appears on the button */
    emoji: EmojiEntity.pick({
      id: true,
      name: true,
      animated: true,
    }).optional(),

    /** A developer-defined identifier for the button, max 100 characters */
    custom_id: z.string().max(100).optional(),

    /** The ID of the SKU for premium purchase buttons */
    sku_id: z.string().optional() as z.ZodOptional<z.ZodType<Snowflake>>,

    /** URL for link buttons */
    url: z.string().url().optional(),

    /** Whether the button is disabled */
    disabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // Link style buttons must have a URL and not a custom_id
      if (data.style === ButtonStyle.Link) {
        return (
          data.url !== undefined &&
          data.custom_id === undefined &&
          data.sku_id === undefined
        );
      }

      // Premium style buttons must have a sku_id and not a custom_id or url
      if (data.style === ButtonStyle.Premium) {
        return (
          data.sku_id !== undefined &&
          data.custom_id === undefined &&
          data.url === undefined
        );
      }

      // All other buttons must have a custom_id and not a URL
      return (
        data.custom_id !== undefined &&
        data.url === undefined &&
        data.sku_id === undefined
      );
    },
    {
      message:
        "Button configuration is invalid. Link buttons must have URL, Premium buttons must have sku_id, others must have custom_id",
    },
  )
  .innerType();

export type ButtonEntity = z.infer<typeof ButtonEntity>;

/**
 * Zod schema for any component type
 */
export const AnyComponentEntity = z.discriminatedUnion("type", [
  ButtonEntity,
  TextInputEntity,
  ...AnySelectMenuEntity.options,
]);

export type AnyComponentEntity = z.infer<typeof AnyComponentEntity>;

/**
 * Zod schema for action row component
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#action-rows}
 */
export const ActionRowEntity = z
  .object({
    /** The type of component - always 1 for an action row */
    type: z.literal(ComponentType.ActionRow),

    /** Components in this action row (max 5) */
    components: z.array(AnyComponentEntity).max(5),
  })
  .refine(
    (data) => {
      // Check if there's at most one select menu in the action row
      const selectMenuCount = data.components.filter(
        (comp) =>
          comp.type === ComponentType.StringSelect ||
          comp.type === ComponentType.UserSelect ||
          comp.type === ComponentType.RoleSelect ||
          comp.type === ComponentType.MentionableSelect ||
          comp.type === ComponentType.ChannelSelect,
      ).length;

      // If there's a select menu, there shouldn't be any buttons
      if (selectMenuCount > 0) {
        const buttonCount = data.components.filter(
          (comp) => comp.type === ComponentType.Button,
        ).length;
        return selectMenuCount === 1 && buttonCount === 0;
      }

      return true;
    },
    {
      message:
        "An Action Row cannot contain both a select menu and buttons, and can only contain one select menu",
    },
  );

export type ActionRowEntity = z.infer<typeof ActionRowEntity>;
