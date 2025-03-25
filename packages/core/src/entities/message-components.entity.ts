import type { Snowflake } from "../managers/index.js";
import type { ChannelType } from "./channel.entity.js";
import type { EmojiEntity } from "./emoji.entity.js";

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
 * Interface for text input component
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#text-input-object}
 */
export interface TextInputEntity {
  /** The type of component - always 4 for a text input */
  type: ComponentType.TextInput;

  /**
   * A developer-defined identifier for the input
   * @maxLength 100
   */
  custom_id: string;

  /** The Text Input Style */
  style: TextInputStyle;

  /**
   * Label for this component
   * @maxLength 45
   */
  label: string;

  /**
   * Minimum input length for a text input
   * @minimum 0
   * @maximum 4000
   * @optional
   */
  min_length?: number;

  /**
   * Maximum input length for a text input
   * @minimum 1
   * @maximum 4000
   * @optional
   */
  max_length?: number;

  /**
   * Whether this component is required to be filled
   * @default true
   */
  required: boolean;

  /**
   * Pre-filled value for this component
   * @maxLength 4000
   * @optional
   */
  value?: string;

  /**
   * Custom placeholder text if the input is empty
   * @maxLength 100
   * @optional
   */
  placeholder?: string;
}

/**
 * Interface for select menu default value
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#select-default-value-structure}
 */
export interface SelectMenuDefaultValueEntity {
  /** ID of the default value (user, role, or channel) */
  id: Snowflake;

  /** Type of default value - "user", "role", or "channel" */
  type: "user" | "role" | "channel";
}

/**
 * Interface for select menu option
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#select-option-structure}
 */
export interface SelectMenuOptionEntity {
  /**
   * User-facing name of the option
   * @maxLength 100
   */
  label: string;

  /**
   * Dev-defined value of the option
   * @maxLength 100
   */
  value: string;

  /**
   * Additional description of the option
   * @maxLength 100
   * @optional
   */
  description?: string;

  /** Emoji that will be displayed with this option */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;

  /** Whether this option is selected by default */
  default?: boolean;
}

/**
 * Base interface for all select menu components
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#select-menu-object}
 */
export interface SelectMenuEntity {
  /** Type of select menu component */
  type:
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;

  /**
   * A developer-defined identifier for the select menu
   * @maxLength 100
   */
  custom_id: string;

  /**
   * Array of select options (max 25) - only for string select
   * @minItems 1
   * @maxItems 25
   * @optional
   */
  options?: SelectMenuOptionEntity[];

  /** Types of channels that can be selected - only for channel select */
  channel_types?: ChannelType[];

  /**
   * Custom placeholder text if nothing is selected
   * @maxLength 150
   * @optional
   */
  placeholder?: string;

  /**
   * Minimum number of items that must be chosen
   * @minimum 0
   * @maximum 25
   * @default 1
   */
  min_values?: number;

  /**
   * Maximum number of items that can be chosen
   * @minimum 1
   * @maximum 25
   * @default 1
   */
  max_values?: number;

  /** Whether the select menu is disabled */
  disabled?: boolean;

  /** Predefined values for auto-populated select menus */
  default_values?: SelectMenuDefaultValueEntity[];
}

/**
 * Interface for string select menu
 */
export interface StringSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "channel_types" | "options"> {
  /** The type of component - always 3 for a string select menu */
  type: ComponentType.StringSelect;

  /**
   * Array of select options (max 25)
   * @minItems 1
   * @maxItems 25
   */
  options: SelectMenuOptionEntity[];
}

/**
 * Interface for channel select menu
 */
export interface ChannelSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "options"> {
  /** The type of component - always 8 for a channel select menu */
  type: ComponentType.ChannelSelect;
}

/**
 * Interface for user select menu
 */
export interface UserSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "options" | "channel_types"> {
  /** The type of component - always 5 for a user select menu */
  type: ComponentType.UserSelect;
}

/**
 * Interface for role select menu
 */
export interface RoleSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "options" | "channel_types"> {
  /** The type of component - always 6 for a role select menu */
  type: ComponentType.RoleSelect;
}

/**
 * Interface for mentionable select menu
 */
export interface MentionableSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "options" | "channel_types"> {
  /** The type of component - always 7 for a mentionable select menu */
  type: ComponentType.MentionableSelect;
}

/**
 * Type representing any select menu component
 */
export type AnySelectMenuEntity =
  | StringSelectMenuEntity
  | ChannelSelectMenuEntity
  | UserSelectMenuEntity
  | RoleSelectMenuEntity
  | MentionableSelectMenuEntity;

/**
 * Interface for button component
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#button-object}
 * @validate Button configuration is invalid. Link buttons must have URL, Premium buttons must have sku_id, others must have custom_id
 */
export interface ButtonEntity {
  /** The type of component - always 2 for a button */
  type: ComponentType.Button;

  /** The style of the button */
  style: ButtonStyle;

  /**
   * Text that appears on the button
   * @maxLength 80
   * @optional
   */
  label?: string;

  /** Emoji that appears on the button */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;

  /**
   * A developer-defined identifier for the button
   * @maxLength 100
   * @optional
   */
  custom_id?: string;

  /** The ID of the SKU for premium purchase buttons */
  sku_id?: Snowflake;

  /**
   * URL for link buttons
   * @format url
   * @optional
   */
  url?: string;

  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * Type representing any component type
 */
export type AnyComponentEntity =
  | ButtonEntity
  | TextInputEntity
  | AnySelectMenuEntity;

/**
 * Interface for action row component
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/interactions/message_components.md#action-rows}
 * @validate An Action Row cannot contain both a select menu and buttons, and can only contain one select menu
 */
export interface ActionRowEntity {
  /** The type of component - always 1 for an action row */
  type: ComponentType.ActionRow;

  /**
   * Components in this action row
   * @maxItems 5
   */
  components: AnyComponentEntity[];
}
