import type { Snowflake } from "../managers/index.js";
import type { ChannelType } from "./channel.entity.js";
import type { EmojiEntity } from "./emoji.entity.js";

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
export interface TextInputEntity {
  /** The type of component - always 4 for a text input */
  type: ComponentType.TextInput;

  /** A developer-defined identifier for the input, max 100 characters */
  custom_id: string;

  /** The Text Input Style */
  style: TextInputStyle;

  /** Label for this component, max 45 characters */
  label: string;

  /** Minimum input length for a text input, min 0, max 4000 */
  min_length?: number;

  /** Maximum input length for a text input, min 1, max 4000 */
  max_length?: number;

  /** Whether this component is required to be filled, default true */
  required?: boolean;

  /** Pre-filled value for this component, max 4000 characters */
  value?: string;

  /** Custom placeholder text if the input is empty, max 100 characters */
  placeholder?: string;
}

/**
 * Represents a default value for a select menu.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure}
 */
export interface SelectMenuDefaultValueEntity {
  /** ID of the default value (user, role, or channel) */
  id: Snowflake;

  /** Type of default value - "user", "role", or "channel" */
  type: "user" | "role" | "channel";
}

/**
 * Represents an option in a string select menu.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure}
 */
export interface SelectMenuOptionEntity {
  /** User-facing name of the option, max 100 characters */
  label: string;

  /** Dev-defined value of the option, max 100 characters */
  value: string;

  /** Additional description of the option, max 100 characters */
  description?: string;

  /** Emoji that will be displayed with this option */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;

  /** Whether this option is selected by default */
  default?: boolean;
}

/**
 * Base structure for all select menu components.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface SelectMenuBaseEntity {
  /** A developer-defined identifier for the select menu, max 100 characters */
  custom_id: string;

  /** Custom placeholder text if nothing is selected, max 150 characters */
  placeholder?: string;

  /** Minimum number of items that must be chosen (defaults to 1, min 0, max 25) */
  min_values?: number;

  /** Maximum number of items that can be chosen (defaults to 1, max 25) */
  max_values?: number;

  /** Whether the select menu is disabled */
  disabled?: boolean;

  /** Predefined values for auto-populated select menus */
  default_values?: SelectMenuDefaultValueEntity[];
}

/** Represents a string select menu component. */
export interface StringSelectMenuEntity extends SelectMenuBaseEntity {
  /** The type of component - always 3 for a string select menu */
  type: ComponentType.StringSelect;

  /** Array of select options (max 25) */
  options: SelectMenuOptionEntity[];
}

/**
 * Represents a channel select menu component.
 */
export interface ChannelSelectMenuEntity extends SelectMenuBaseEntity {
  /** The type of component - always 8 for a channel select menu */
  type: ComponentType.ChannelSelect;

  /** Types of channels that can be selected */
  channel_types?: ChannelType[];
}

/** Represents a user select menu component. */
export interface UserSelectMenuEntity extends SelectMenuBaseEntity {
  /** The type of component - always 5 for a user select menu */
  type: ComponentType.UserSelect;
}

/** Represents a role select menu component. */
export interface RoleSelectMenuEntity extends SelectMenuBaseEntity {
  /** The type of component - always 6 for a role select menu */
  type: ComponentType.RoleSelect;
}

/** Represents a mentionable (user or role) select menu component. */
export interface MentionableSelectMenuEntity extends SelectMenuBaseEntity {
  /** The type of component - always 7 for a mentionable select menu */
  type: ComponentType.MentionableSelect;
}

/** Union type for all select menu components. */
export type AnySelectMenuEntity =
  | StringSelectMenuEntity
  | ChannelSelectMenuEntity
  | UserSelectMenuEntity
  | RoleSelectMenuEntity
  | MentionableSelectMenuEntity;

/**
 * Represents a button component in a message.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
export interface ButtonEntity {
  /** The type of component - always 2 for a button */
  type: ComponentType.Button;

  /** The style of the button */
  style: ButtonStyle;

  /** Text that appears on the button, max 80 characters */
  label?: string;

  /** Emoji that appears on the button */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;

  /** A developer-defined identifier for the button, max 100 characters */
  custom_id?: string;

  /** The ID of the SKU for premium purchase buttons */
  sku_id?: string;

  /** URL for link buttons */
  url?: string;

  /** Whether the button is disabled */
  disabled?: boolean;
}

/** Union type for all possible component types. */
export type AnyComponentEntity =
  | ButtonEntity
  | TextInputEntity
  | AnySelectMenuEntity;

/**
 * Represents a container for components in a message.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 */
export interface ActionRowEntity {
  /** The type of component - always 1 for an action row */
  type: ComponentType.ActionRow;

  /** Components in this action row (max 5) */
  components: AnyComponentEntity[];
}
