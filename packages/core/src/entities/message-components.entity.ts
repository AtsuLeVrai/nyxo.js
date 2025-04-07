import type { Snowflake } from "../managers/index.js";
import type { ChannelType } from "./channel.entity.js";
import type { EmojiEntity } from "./emoji.entity.js";

/**
 * Types of components that can be used in Discord messages.
 * Components provide interactive elements that users can engage with.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types}
 */
export enum ComponentType {
  /**
   * Container for other components.
   * Serves as a layout container that can hold buttons or select menus.
   * @value 1
   */
  ActionRow = 1,

  /**
   * Button component.
   * Interactive button that users can click to trigger an interaction.
   * @value 2
   */
  Button = 2,

  /**
   * Select menu for string values.
   * Dropdown menu where users select from predefined text options.
   * @value 3
   */
  StringSelect = 3,

  /**
   * Text input component.
   * Field that allows users to enter text in a modal.
   * @value 4
   */
  TextInput = 4,

  /**
   * Select menu for users.
   * Dropdown that allows selection of users from the server.
   * @value 5
   */
  UserSelect = 5,

  /**
   * Select menu for roles.
   * Dropdown that allows selection of roles from the server.
   * @value 6
   */
  RoleSelect = 6,

  /**
   * Select menu for mentionables (users and roles).
   * Dropdown that allows selection of either users or roles.
   * @value 7
   */
  MentionableSelect = 7,

  /**
   * Select menu for channels.
   * Dropdown that allows selection of channels from the server.
   * @value 8
   */
  ChannelSelect = 8,
}

/**
 * Visual styles of text input components.
 * Determines the appearance and behavior of text inputs in modals.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles}
 */
export enum TextInputStyle {
  /**
   * Single-line input.
   * A compact input field for shorter text entries.
   * @value 1
   */
  Short = 1,

  /**
   * Multi-line input.
   * A larger input field for paragraphs or longer text entries.
   * @value 2
   */
  Paragraph = 2,
}

/**
 * Visual styles of button components.
 * Controls the appearance and behavior of buttons.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-styles}
 */
export enum ButtonStyle {
  /**
   * Blurple button.
   * Discord's primary color button, should be used for primary actions.
   * @value 1
   */
  Primary = 1,

  /**
   * Grey button.
   * Neutral color button, suitable for secondary actions.
   * @value 2
   */
  Secondary = 2,

  /**
   * Green button.
   * Positive color button, suitable for confirming or positive actions.
   * @value 3
   */
  Success = 3,

  /**
   * Red button.
   * Negative color button, suitable for destructive or negative actions.
   * @value 4
   */
  Danger = 4,

  /**
   * URL button.
   * Grey button that navigates to a URL instead of sending an interaction.
   * @value 5
   */
  Link = 5,

  /**
   * Premium subscription button.
   * Special button used for premium purchases.
   * @value 6
   */
  Premium = 6,
}

/**
 * Text input component for modals.
 * Allows users to enter free-form text in a modal dialog.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object}
 */
export interface TextInputEntity {
  /**
   * The type of component - always 4 for a text input.
   * Identifies this component as a text input.
   */
  type: ComponentType.TextInput;

  /**
   * A developer-defined identifier for the input.
   * Used to identify this component in interaction payloads.
   * @maxLength 100
   */
  custom_id: string;

  /**
   * The Text Input Style.
   * Determines whether this is a single-line or multi-line input.
   */
  style: TextInputStyle;

  /**
   * Label for this component.
   * Text displayed above the input field.
   * @maxLength 45
   */
  label: string;

  /**
   * Minimum input length for a text input.
   * The smallest number of characters a user must enter.
   * @minimum 0
   * @maximum 4000
   * @optional
   */
  min_length?: number;

  /**
   * Maximum input length for a text input.
   * The largest number of characters a user can enter.
   * @minimum 1
   * @maximum 4000
   * @optional
   */
  max_length?: number;

  /**
   * Whether this component is required to be filled.
   * If true, users must enter a value before submitting.
   * @default true
   */
  required: boolean;

  /**
   * Pre-filled value for this component.
   * Text that appears in the input field by default.
   * @maxLength 4000
   * @optional
   */
  value?: string;

  /**
   * Custom placeholder text if the input is empty.
   * Shown when the input field is empty.
   * @maxLength 100
   * @optional
   */
  placeholder?: string;
}

/**
 * Select menu default value for auto-populated select menus.
 * Specifies which options should be pre-selected when a select menu is displayed.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure}
 */
export interface SelectMenuDefaultValueEntity {
  /**
   * ID of the default value (user, role, or channel).
   * The unique identifier of the resource to pre-select.
   */
  id: Snowflake;

  /**
   * Type of default value.
   * Indicates what kind of resource this ID represents.
   */
  type: "user" | "role" | "channel";
}

/**
 * Select menu option for string select menus.
 * Represents a choice that users can select from a dropdown menu.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure}
 */
export interface SelectMenuOptionEntity {
  /**
   * User-facing name of the option.
   * The text displayed to users in the dropdown.
   * @maxLength 100
   */
  label: string;

  /**
   * Developer-defined value of the option.
   * The value your application receives when this option is selected.
   * @maxLength 100
   */
  value: string;

  /**
   * Additional description of the option.
   * Supplementary text shown below the label.
   * @maxLength 100
   * @optional
   */
  description?: string;

  /**
   * Emoji that will be displayed with this option.
   * Small icon shown next to the option text.
   */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;

  /**
   * Whether this option is selected by default.
   * If true, this option will be pre-selected when the menu first appears.
   */
  default?: boolean;
}

/**
 * Base interface for all select menu components.
 * Defines common properties shared by all types of select menus.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object}
 */
export interface SelectMenuEntity {
  /**
   * Type of select menu component.
   * Determines what kind of select menu this is and what can be selected.
   */
  type:
    | ComponentType.StringSelect
    | ComponentType.UserSelect
    | ComponentType.RoleSelect
    | ComponentType.MentionableSelect
    | ComponentType.ChannelSelect;

  /**
   * A developer-defined identifier for the select menu.
   * Used to identify this component in interaction payloads.
   * @maxLength 100
   */
  custom_id: string;

  /**
   * Array of select options.
   * The choices that will appear in a string select menu.
   * @minItems 1
   * @maxItems 25
   * @optional
   */
  options?: SelectMenuOptionEntity[];

  /**
   * Types of channels that can be selected.
   * Filters which channel types are available in a channel select menu.
   */
  channel_types?: ChannelType[];

  /**
   * Custom placeholder text if nothing is selected.
   * Text shown when no option is selected.
   * @maxLength 150
   * @optional
   */
  placeholder?: string;

  /**
   * Minimum number of items that must be chosen.
   * The smallest number of options a user must select.
   * @minimum 0
   * @maximum 25
   * @default 1
   */
  min_values?: number;

  /**
   * Maximum number of items that can be chosen.
   * The largest number of options a user can select.
   * @minimum 1
   * @maximum 25
   * @default 1
   */
  max_values?: number;

  /**
   * Whether the select menu is disabled.
   * If true, the select menu cannot be interacted with.
   */
  disabled?: boolean;

  /**
   * Predefined values for auto-populated select menus.
   * Resources that should be pre-selected when the menu is displayed.
   */
  default_values?: SelectMenuDefaultValueEntity[];
}

/**
 * String select menu component.
 * Dropdown that allows users to select from custom text options.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface StringSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "channel_types" | "options"> {
  /**
   * The type of component - always 3 for a string select menu.
   * Identifies this component as a string select menu.
   */
  type: ComponentType.StringSelect;

  /**
   * Array of select options.
   * The choices that will appear in the dropdown menu.
   * @minItems 1
   * @maxItems 25
   */
  options: SelectMenuOptionEntity[];
}

/**
 * Channel select menu component.
 * Dropdown that allows users to select channels from the server.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface ChannelSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "options"> {
  /**
   * The type of component - always 8 for a channel select menu.
   * Identifies this component as a channel select menu.
   */
  type: ComponentType.ChannelSelect;
}

/**
 * User select menu component.
 * Dropdown that allows users to select members of the server.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface UserSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "options" | "channel_types"> {
  /**
   * The type of component - always 5 for a user select menu.
   * Identifies this component as a user select menu.
   */
  type: ComponentType.UserSelect;
}

/**
 * Role select menu component.
 * Dropdown that allows users to select roles from the server.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface RoleSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "options" | "channel_types"> {
  /**
   * The type of component - always 6 for a role select menu.
   * Identifies this component as a role select menu.
   */
  type: ComponentType.RoleSelect;
}

/**
 * Mentionable select menu component.
 * Dropdown that allows users to select either users or roles.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface MentionableSelectMenuEntity
  extends Omit<SelectMenuEntity, "type" | "options" | "channel_types"> {
  /**
   * The type of component - always 7 for a mentionable select menu.
   * Identifies this component as a mentionable select menu.
   */
  type: ComponentType.MentionableSelect;
}

/**
 * Union type representing any select menu component.
 * Can be any of the specialized select menu types.
 */
export type AnySelectMenuEntity =
  | StringSelectMenuEntity
  | ChannelSelectMenuEntity
  | UserSelectMenuEntity
  | RoleSelectMenuEntity
  | MentionableSelectMenuEntity;

/**
 * Button component.
 * Interactive element that users can click to trigger an action.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object}
 * @validate Button configuration is invalid. Link buttons must have URL, Premium buttons must have sku_id, others must have custom_id
 */
export interface ButtonEntity {
  /**
   * The type of component - always 2 for a button.
   * Identifies this component as a button.
   */
  type: ComponentType.Button;

  /**
   * The style of the button.
   * Controls the appearance and behavior of the button.
   */
  style: ButtonStyle;

  /**
   * Text that appears on the button.
   * The label displayed inside the button.
   * @maxLength 80
   * @optional
   */
  label?: string;

  /**
   * Emoji that appears on the button.
   * Small icon displayed inside or next to the button.
   */
  emoji?: Pick<EmojiEntity, "id" | "name" | "animated">;

  /**
   * A developer-defined identifier for the button.
   * Used to identify this component in interaction payloads.
   * @maxLength 100
   * @optional
   */
  custom_id?: string;

  /**
   * The ID of the SKU for premium purchase buttons.
   * Used to associate a premium button with a purchasable product.
   */
  sku_id?: Snowflake;

  /**
   * URL for link buttons.
   * The destination that users will be sent to when clicking a Link-style button.
   * @format url
   * @optional
   */
  url?: string;

  /**
   * Whether the button is disabled.
   * If true, the button cannot be clicked.
   */
  disabled?: boolean;
}

/**
 * Union type representing any component type.
 * Can be a button, text input, or any select menu.
 */
export type AnyComponentEntity =
  | ButtonEntity
  | TextInputEntity
  | AnySelectMenuEntity;

/**
 * Action row component.
 * Container for organizing other interactive components in a message.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows}
 * @validate An Action Row cannot contain both a select menu and buttons, and can only contain one select menu
 */
export interface ActionRowEntity {
  /**
   * The type of component - always 1 for an action row.
   * Identifies this component as an action row container.
   */
  type: ComponentType.ActionRow;

  /**
   * Components in this action row.
   * The interactive elements displayed within this container.
   * @maxItems 5
   */
  components: AnyComponentEntity[];
}
