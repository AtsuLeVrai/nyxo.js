import type { Snowflake } from "../markdown/index.js";
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
   */
  ActionRow = 1,

  /**
   * Button component.
   * Interactive button that users can click to trigger an interaction.
   */
  Button = 2,

  /**
   * Select menu for string values.
   * Dropdown menu where users select from predefined text options.
   */
  StringSelect = 3,

  /**
   * Text input component.
   * Field that allows users to enter text in a modal.
   */
  TextInput = 4,

  /**
   * Select menu for users.
   * Dropdown that allows selection of users from the server.
   */
  UserSelect = 5,

  /**
   * Select menu for roles.
   * Dropdown that allows selection of roles from the server.
   */
  RoleSelect = 6,

  /**
   * Select menu for mentionables (users and roles).
   * Dropdown that allows selection of either users or roles.
   */
  MentionableSelect = 7,

  /**
   * Select menu for channels.
   * Dropdown that allows selection of channels from the server.
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
   */
  Short = 1,

  /**
   * Multi-line input.
   * A larger input field for paragraphs or longer text entries.
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
   */
  Primary = 1,

  /**
   * Grey button.
   * Neutral color button, suitable for secondary actions.
   */
  Secondary = 2,

  /**
   * Green button.
   * Positive color button, suitable for confirming or positive actions.
   */
  Success = 3,

  /**
   * Red button.
   * Negative color button, suitable for destructive or negative actions.
   */
  Danger = 4,

  /**
   * URL button.
   * Grey button that navigates to a URL instead of sending an interaction.
   */
  Link = 5,

  /**
   * Premium subscription button.
   * Special button used for premium purchases.
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
   */
  label: string;

  /**
   * Minimum input length for a text input.
   * The smallest number of characters a user must enter.
   */
  min_length?: number;

  /**
   * Maximum input length for a text input.
   * The largest number of characters a user can enter.
   */
  max_length?: number;

  /**
   * Whether this component is required to be filled.
   * If true, users must enter a value before submitting.
   */
  required?: boolean;

  /**
   * Pre-filled value for this component.
   * Text that appears in the input field by default.
   */
  value?: string;

  /**
   * Custom placeholder text if the input is empty.
   * Shown when the input field is empty.
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
   */
  label: string;

  /**
   * Developer-defined value of the option.
   * The value your application receives when this option is selected.
   */
  value: string;

  /**
   * Additional description of the option.
   * Supplementary text shown below the label.
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
 * Base select menu schema with all possible properties for any select menu type.
 * Contains all fields that may appear in any kind of select menu.
 * Many fields are optional as they only apply to specific select menu types.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object}
 */
export interface SelectMenuEntity {
  /**
   * The type of component.
   * Determines which kind of select menu this is.
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
   */
  custom_id: string;

  /**
   * Array of select options.
   * The choices that will appear in the dropdown menu.
   * Only applicable to string select menus.
   */
  options?: SelectMenuOptionEntity[];

  /**
   * Types of channels that can be selected.
   * Filters which channel types are available in a channel select menu.
   * Only applicable to channel select menus.
   */
  channel_types?: ChannelType[];

  /**
   * Custom placeholder text if nothing is selected.
   * Text shown when no option is selected.
   */
  placeholder?: string;

  /**
   * Minimum number of items that must be chosen.
   * The smallest number of options a user must select.
   */
  min_values?: number;

  /**
   * Maximum number of items that can be chosen.
   * The largest number of options a user can select.
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
 * Dropdown that allows users to select from predefined options.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface StringSelectMenuEntity
  extends Omit<SelectMenuEntity, "channel_types"> {
  /**
   * The type of component - always 3 for a string select.
   * Identifies this component as a string select menu.
   */
  type: ComponentType.StringSelect;

  /**
   * Array of select options.
   * The choices that will appear in the dropdown menu.
   */
  options: SelectMenuOptionEntity[];
}

/**
 * User select menu component.
 * Dropdown that allows users to select users from the server.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface UserSelectMenuEntity
  extends Omit<SelectMenuEntity, "options" | "channel_types"> {
  /**
   * The type of component - always 5 for a user select.
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
  extends Omit<SelectMenuEntity, "options" | "channel_types"> {
  /**
   * The type of component - always 6 for a role select.
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
  extends Omit<SelectMenuEntity, "options" | "channel_types"> {
  /**
   * The type of component - always 7 for a mentionable select.
   * Identifies this component as a mentionable select menu.
   */
  type: ComponentType.MentionableSelect;
}

/**
 * Channel select menu component.
 * Dropdown that allows users to select channels from the server.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure}
 */
export interface ChannelSelectMenuEntity
  extends Omit<SelectMenuEntity, "options"> {
  /**
   * The type of component - always 8 for a channel select.
   * Identifies this component as a channel select menu.
   */
  type: ComponentType.ChannelSelect;

  /**
   * Types of channels that can be selected.
   * Filters which channel types are available in the dropdown.
   */
  channel_types?: ChannelType[];
}

/**
 * Union type representing any select menu component.
 * Can be any of the specialized select menu types.
 */
export type AnySelectMenuEntity =
  | StringSelectMenuEntity
  | UserSelectMenuEntity
  | RoleSelectMenuEntity
  | MentionableSelectMenuEntity
  | ChannelSelectMenuEntity;

/**
 * Button component.
 * Interactive element that users can click to trigger an action.
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object}
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
   */
  components: AnyComponentEntity[];
}
