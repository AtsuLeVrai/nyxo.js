import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { ChannelType } from "./channel.entity.js";
import { EmojiEntity } from "./emoji.entity.js";

/**
 * Defines the different types of components that can be used in Discord messages.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
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
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles}
 */
export enum TextInputStyle {
  /** Single-line input (1) */
  Short = 1,

  /** Multi-line input (2) */
  Paragraph = 2,
}

/**
 * Defines the visual styles of button components.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-styles}
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
 * Represents a text input component used in modals and forms.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-structure}
 */
export const TextInputEntity = z.object({
  /** The type of component - always 4 for a text input */
  type: z.literal(ComponentType.TextInput).default(ComponentType.TextInput),

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
 * Represents a default value for a select menu.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure}
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
 * Represents an option in a string select menu.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure}
 */
export const SelectMenuOptionEntity = z.object({
  /** User-facing name of the option, max 100 characters */
  label: z.string().max(100),

  /** Dev-defined value of the option, max 100 characters */
  value: z.string().max(100),

  /** Additional description of the option, max 100 characters */
  description: z.string().max(100).optional(),

  /** Emoji that will be displayed with this option */
  emoji: EmojiEntity.pick({
    id: true,
    name: true,
    animated: true,
  }).optional(),

  /** Whether this option is selected by default */
  default: z.boolean().optional(),
});

export type SelectMenuOptionEntity = z.infer<typeof SelectMenuOptionEntity>;

/**
 * Base structure for all select menu components.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export const SelectMenuBaseEntity = z.object({
  /** A developer-defined identifier for the select menu, max 100 characters */
  custom_id: z.string().max(100),

  /** Custom placeholder text if nothing is selected, max 150 characters */
  placeholder: z.string().max(150).optional(),

  /** Minimum number of items that must be chosen (defaults to 1, min 0, max 25) */
  min_values: z.number().int().min(0).max(25).default(1),

  /** Maximum number of items that can be chosen (defaults to 1, max 25) */
  max_values: z.number().int().min(1).max(25).default(1),

  /** Whether the select menu is disabled */
  disabled: z.boolean().optional(),

  /** Predefined values for auto-populated select menus */
  default_values: z.array(SelectMenuDefaultValueEntity).optional(),
});

export type SelectMenuBaseEntity = z.infer<typeof SelectMenuBaseEntity>;

/** Represents a string select menu component. */
export const StringSelectMenuEntity = SelectMenuBaseEntity.extend({
  /** The type of component - always 3 for a string select menu */
  type: z
    .literal(ComponentType.StringSelect)
    .default(ComponentType.StringSelect),

  /** Array of select options (max 25) */
  options: z.array(SelectMenuOptionEntity).min(1).max(25),
});

export type StringSelectMenuEntity = z.infer<typeof StringSelectMenuEntity>;

/**
 * Represents a channel select menu component.
 */
export const ChannelSelectMenuEntity = SelectMenuBaseEntity.extend({
  /** The type of component - always 8 for a channel select menu */
  type: z
    .literal(ComponentType.ChannelSelect)
    .default(ComponentType.ChannelSelect),

  /** Types of channels that can be selected */
  channel_types: z.array(z.nativeEnum(ChannelType)).optional(),
});

export type ChannelSelectMenuEntity = z.infer<typeof ChannelSelectMenuEntity>;

/** Represents a user select menu component. */
export const UserSelectMenuEntity = SelectMenuBaseEntity.extend({
  /** The type of component - always 5 for a user select menu */
  type: z.literal(ComponentType.UserSelect).default(ComponentType.UserSelect),
});

export type UserSelectMenuEntity = z.infer<typeof UserSelectMenuEntity>;

/** Represents a role select menu component. */
export const RoleSelectMenuEntity = SelectMenuBaseEntity.extend({
  /** The type of component - always 6 for a role select menu */
  type: z.literal(ComponentType.RoleSelect).default(ComponentType.RoleSelect),
});

export type RoleSelectMenuEntity = z.infer<typeof RoleSelectMenuEntity>;

/** Represents a mentionable (user or role) select menu component. */
export const MentionableSelectMenuEntity = SelectMenuBaseEntity.extend({
  /** The type of component - always 7 for a mentionable select menu */
  type: z
    .literal(ComponentType.MentionableSelect)
    .default(ComponentType.MentionableSelect),
});

export type MentionableSelectMenuEntity = z.infer<
  typeof MentionableSelectMenuEntity
>;

/** Union type for all select menu components. */
export const SelectMenuEntity = z.discriminatedUnion("type", [
  StringSelectMenuEntity,
  ChannelSelectMenuEntity,
  UserSelectMenuEntity,
  RoleSelectMenuEntity,
  MentionableSelectMenuEntity,
]);

export type SelectMenuEntity = z.infer<typeof SelectMenuEntity>;

/**
 * Represents a button component in a message.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
export const ButtonEntity = z
  .object({
    /** The type of component - always 2 for a button */
    type: z.literal(ComponentType.Button).default(ComponentType.Button),

    /** The style of the button */
    style: z.nativeEnum(ButtonStyle).default(ButtonStyle.Primary),

    /** Text that appears on the button, max 80 characters */
    label: z.string().max(80).optional(),

    /** Emoji that appears on the button */
    emoji: z
      .lazy(() =>
        EmojiEntity.pick({
          name: true,
          id: true,
          animated: true,
        }),
      )
      .optional(),

    /** A developer-defined identifier for the button, max 100 characters */
    custom_id: z.string().max(100).optional(),

    /** The ID of the SKU for premium purchase buttons */
    sku_id: z.string().optional(),

    /** URL for link buttons */
    url: z.string().url().optional(),

    /** Whether the button is disabled */
    disabled: z.boolean().default(false),
  })
  .superRefine((button, ctx) => {
    if (button.style === ButtonStyle.Link && !button.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link buttons must have a url",
      });
    } else if (button.style === ButtonStyle.Link && button.custom_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Link buttons cannot have a custom_id",
      });
    } else if (button.style === ButtonStyle.Premium && !button.sku_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Premium buttons must have a sku_id",
      });
    } else if (button.style !== ButtonStyle.Link && !button.custom_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Non-link buttons must have a custom_id",
      });
    }

    if (!(button.label || button.emoji)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Buttons must have either a label or an emoji",
      });
    }
  });

export type ButtonEntity = z.infer<typeof ButtonEntity>;

/** Union type for all possible component types. */
export const ComponentEntity = z.discriminatedUnion("type", [
  ButtonEntity.sourceType(),
  TextInputEntity,
  ...SelectMenuEntity.options,
]);

export type ComponentEntity = z.infer<typeof ComponentEntity>;

/**
 * Represents a container for components in a message.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 */
export const ActionRowEntity = z
  .object({
    /** The type of component - always 1 for an action row */
    type: z.literal(ComponentType.ActionRow).default(ComponentType.ActionRow),

    /** Components in this action row (max 5) */
    components: z.array(ComponentEntity).max(5),
  })
  .superRefine((row, ctx) => {
    const hasButton = row.components.some((c) => "style" in c);
    const hasSelectMenu = row.components.some(
      (c) => "options" in c || "channel_types" in c,
    );
    const hasTextInput = row.components.some(
      (c) => c.type === ComponentType.TextInput,
    );

    if (hasTextInput) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action rows in messages cannot contain text inputs",
      });
    }

    if (hasButton && hasSelectMenu) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action rows cannot contain both buttons and select menus",
      });
    }

    if (hasSelectMenu && row.components.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action rows can only contain one select menu",
      });
    }

    if (hasButton && row.components.length > 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Action rows can only contain up to 5 buttons",
      });
    }
  });

export type ActionRowEntity = z.infer<typeof ActionRowEntity>;
