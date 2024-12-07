import type { Integer } from "../formatting/index.js";
import type { Snowflake } from "../utils/index.js";
import type { ChannelType } from "./channel.js";
import type { EmojiEntity } from "./emoji.js";

/**
 * Represents the available styles for text input components.
 *
 * @remarks
 * Determines whether the text input is single-line or multi-line.
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles}
 */
export enum TextInputStyle {
  /** Single-line input */
  Short = 1,
  /** Multi-line input */
  Paragraph = 2,
}

/**
 * Represents a text input component that can be used in modals.
 *
 * @remarks
 * Text inputs are interactive components that render in modals and can be used
 * to collect short-form or long-form text from users.
 *
 * @example
 * ```typescript
 * const textInput: TextInputEntity = {
 *   type: ComponentType.TextInput,
 *   custom_id: "my_input",
 *   style: TextInputStyle.Short,
 *   label: "Your name",
 *   min_length: 1,
 *   max_length: 100,
 *   required: true,
 *   placeholder: "Enter your name here"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-structure}
 */
export interface TextInputEntity {
  /** Type of component - should be TextInput (4) */
  type: ComponentType.TextInput;
  /** Developer-defined identifier for the input; max 100 characters */
  custom_id: string;
  /** The Text Input Style */
  style: TextInputStyle;
  /** Label for this component; max 45 characters */
  label: string;
  /** Minimum input length for a text input; min 0, max 4000 */
  min_length?: Integer;
  /** Maximum input length for a text input; min 1, max 4000 */
  max_length?: Integer;
  /** Whether this component is required to be filled (defaults to true) */
  required?: boolean;
  /** Pre-filled value for this component; max 4000 characters */
  value?: string;
  /** Custom placeholder text if the input is empty; max 100 characters */
  placeholder?: string;
}

/**
 * Represents a default value for a select menu component.
 *
 * @remarks
 * Used to specify pre-selected values in auto-populated select menus.
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure}
 */
export interface SelectMenuDefaultValue {
  /** ID of a user, role, or channel */
  id: Snowflake;
  /** Type of value that id represents */
  type: "user" | "role" | "channel";
}

/**
 * Represents an option in a string select menu component.
 *
 * @remarks
 * Contains the label, value, and optional description and emoji for a select menu option.
 *
 * @example
 * ```typescript
 * const option: SelectMenuOption = {
 *   label: "Option 1",
 *   value: "option_1",
 *   description: "This is the first option",
 *   emoji: { name: "👋" }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure}
 */
export interface SelectMenuOption {
  /** User-facing name of the option; max 100 characters */
  label: string;
  /** Dev-defined value of the option; max 100 characters */
  value: string;
  /** Additional description of the option; max 100 characters */
  description?: string;
  /** Emoji to display with the option */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;
  /** Whether this option should be pre-selected */
  default?: boolean;
}

/**
 * Represents a select menu component.
 *
 * @remarks
 * Select menus are interactive components that allow users to select one or more options
 * from a dropdown list. There are different types of select menus: string, user, role,
 * mentionable, and channel select menus.
 *
 * @example
 * ```typescript
 * const selectMenu: SelectMenuEntity = {
 *   type: ComponentType.StringSelect,
 *   custom_id: "class_select",
 *   options: [
 *     { label: "Rogue", value: "rogue" },
 *     { label: "Mage", value: "mage" },
 *     { label: "Priest", value: "priest" }
 *   ],
 *   placeholder: "Choose your class",
 *   min_values: 1,
 *   max_values: 1
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface SelectMenuEntity {
  /** Type of select menu component */
  type:
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;
  /** ID for the select menu; max 100 characters */
  custom_id: string;
  /** Choices in the select menu (only for string select) */
  options?: SelectMenuOption[];
  /** Types of channels that can be selected (only for channel select) */
  channel_types?: ChannelType[];
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Default values for the select menu */
  default_values?: SelectMenuDefaultValue[];
  /** Minimum number of items that must be chosen */
  min_values?: Integer;
  /** Maximum number of items that can be chosen */
  max_values?: Integer;
  /** Whether the select menu is disabled */
  disabled?: boolean;
}

/**
 * Represents the available styles for button components.
 *
 * @remarks
 * Different styles have different colors and behaviors.
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-styles}
 */
export enum ButtonStyle {
  /** Blurple button */
  Primary = 1,
  /** Grey button */
  Secondary = 2,
  /** Green button */
  Success = 3,
  /** Red button */
  Danger = 4,
  /** Grey button that navigates to a URL */
  Link = 5,
  /** Blurple button that links to premium purchase */
  Premium = 6,
}

/**
 * Represents a button component.
 *
 * @remarks
 * Buttons are interactive components that render in messages. They can be clicked by users,
 * and send an interaction to your application when clicked. Link buttons navigate to URLs
 * instead of sending interactions.
 *
 * @example
 * ```typescript
 * const button: ButtonEntity = {
 *   type: ComponentType.Button,
 *   style: ButtonStyle.Primary,
 *   label: "Click me!",
 *   custom_id: "click_one",
 *   emoji: { name: "👋" }
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure}
 */
export interface ButtonEntity {
  /** Type of component - should be Button (2) */
  type: ComponentType.Button;
  /** Style of the button */
  style: ButtonStyle;
  /** Text that appears on the button; max 80 characters */
  label?: string;
  /** Emoji to display on the button */
  emoji?: Pick<EmojiEntity, "name" | "id" | "animated">;
  /** Developer-defined identifier for the button */
  custom_id?: string;
  /** ID of purchasable SKU (only for premium buttons) */
  sku_id?: Snowflake;
  /** URL for link buttons */
  url?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/** Union type of all possible component types */
export type ComponentEntity = ButtonEntity | SelectMenuEntity | TextInputEntity;

/**
 * Represents an Action Row component.
 *
 * @remarks
 * Action Rows are non-interactive container components for other types of components.
 * They can contain up to 5 components, and messages can have up to 5 Action Rows.
 *
 * @example
 * ```typescript
 * const actionRow: ActionRowEntity = {
 *   type: ComponentType.ActionRow,
 *   components: [
 *     {
 *       type: ComponentType.Button,
 *       style: ButtonStyle.Primary,
 *       label: "Click me!",
 *       custom_id: "click_one"
 *     }
 *   ]
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 */
export interface ActionRowEntity {
  /** Type of component - should be ActionRow (1) */
  type: ComponentType.ActionRow;
  /** Components to display in this Action Row */
  components: ComponentEntity[];
}

/**
 * Represents the different types of components that can be used in messages.
 *
 * @remarks
 * Different types of components have different purposes and behaviors.
 *
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
 */
export enum ComponentType {
  /** Container for other components */
  ActionRow = 1,
  /** Button component */
  Button = 2,
  /** Select menu for string options */
  StringSelect = 3,
  /** Text input component */
  TextInput = 4,
  /** Select menu for users */
  UserSelect = 5,
  /** Select menu for roles */
  RoleSelect = 6,
  /** Select menu for mentionable entities */
  MentionableSelect = 7,
  /** Select menu for channels */
  ChannelSelect = 8,
}
