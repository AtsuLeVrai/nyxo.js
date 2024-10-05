import type { Integer, Snowflake } from "../markdown";
import type { ChannelTypes } from "./channels";
import type { EmojiStructure } from "./emojis";

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#component-object-component-types|Component Types}
 */
export enum ComponentTypes {
    ActionRow = 1,
    Button = 2,
    StringSelect = 3,
    TextInput = 4,
    UserSelect = 5,
    RoleSelect = 6,
    MentionableSelect = 7,
    ChannelSelect = 8,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-styles|Text Input Styles}
 */
export enum TextInputStyles {
    /**
     * Single-line input
     */
    Short = 1,
    /**
     * Multi-line input
     */
    Paragraph = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#text-input-object-text-input-structure|Text Input Structure}
 */
export type TextInputStructure = {
    /**
     * Developer-defined identifier for the input; max 100 characters
     */
    custom_id: string;
    /**
     * Label for this component; max 45 characters
     */
    label: string;
    /**
     * Maximum input length for a text input; min 1, max 4000
     */
    max_length?: Integer;
    /**
     * Minimum input length for a text input; min 0, max 4000
     */
    min_length?: Integer;
    /**
     * Custom placeholder text if the input is empty; max 100 characters
     */
    placeholder?: string;
    /**
     * Whether this component is required to be filled (defaults to true)
     */
    required?: boolean;
    /**
     * The Text Input Style
     */
    style: TextInputStyles;
    /**
     * 4 for a text input
     */
    type: ComponentTypes.TextInput;
    /**
     * Pre-filled value for this component; max 4000 characters
     */
    value?: string;
};

/**
 * Type representing the types of default values for select menus.
 */
export type SelectMenuDefaultTypes = "channel" | "role" | "user";

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-default-value-structure|Select Default Value Structure}
 */
export type SelectMenuDefaultValueStructure = {
    /**
     * ID of a user, role, or channel
     */
    id: Snowflake;
    /**
     * Type of value that id represents. Either "user", "role", or "channel"
     */
    type: SelectMenuDefaultTypes;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-option-structure|Select Option Structure}
 */
export type SelectMenuOptionStructure = {
    /**
     * Will show this option as selected by default
     */
    default?: boolean;
    /**
     * Additional description of the option; max 100 characters
     */
    description?: string;
    /**
     * Partial emoji object
     */
    emoji?: Pick<EmojiStructure, "animated" | "id" | "name">;
    /**
     * User-facing name of the option; max 100 characters
     */
    label: string;
    /**
     * Dev-defined value of the option; max 100 characters
     */
    value: string;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#select-menu-object-select-menu-structure|Select Menu Structure}
 */
export type SelectMenuStructure = {
    /**
     * List of channel types to include in the channel select component (type 8)
     */
    channel_types?: ChannelTypes[];
    /**
     * ID for the select menu; max 100 characters
     */
    custom_id: string;
    /**
     * List of default values for auto-populated select menu components; number of default values must be in the range defined by min_values and max_values
     */
    default_values?: SelectMenuDefaultValueStructure[];
    /**
     * Whether select menu is disabled (defaults to false)
     */
    disabled?: boolean;
    /**
     * Maximum number of items that can be chosen (defaults to 1); max 25
     */
    max_values?: Integer;
    /**
     * Minimum number of items that must be chosen (defaults to 1); min 0, max 25
     */
    min_values?: Integer;
    /**
     * Specified choices in a select menu (only required and available for string selects (type 3); max 25
     */
    options?: SelectMenuOptionStructure[];
    /**
     * Placeholder text if nothing is selected; max 150 characters
     */
    placeholder?: string;
    /**
     * Type of select menu component (text: 3, user: 5, role: 6, mentionable: 7, channels: 8)
     */
    type:
        | ComponentTypes.ChannelSelect
        | ComponentTypes.MentionableSelect
        | ComponentTypes.RoleSelect
        | ComponentTypes.StringSelect
        | ComponentTypes.UserSelect;
};

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-styles|Button Styles}
 */
export enum ButtonStyles {
    Primary = 1,
    Secondary = 2,
    Success = 3,
    Danger = 4,
    Link = 5,
    Premium = 6,
}

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#button-object-button-structure|Button Structure}
 */
export type ButtonStructure = {
    /**
     * Developer-defined identifier for the button; max 100 characters
     */
    custom_id?: string;
    /**
     * Whether the button is disabled (defaults to false)
     */
    disabled?: boolean;
    /**
     * Partial emoji object
     */
    emoji?: Pick<EmojiStructure, "animated" | "id" | "name">;
    /**
     * Text that appears on the button; max 80 characters
     */
    label?: string;
    /**
     * Identifier for a purchasable SKU, only available when using premium-style buttons
     */
    sku_id?: Snowflake;
    /**
     * A button style
     */
    style: ButtonStyles;
    /**
     * 2 for a button
     */
    type: ComponentTypes.Button;
    /**
     * URL for link-style buttons
     */
    url?: string;
};

/**
 * Resolvable component types
 */
export type ComponentResolvableStructure = ButtonStructure | SelectMenuStructure | TextInputStructure;

/**
 * @see {@link https://discord.com/developers/docs/interactions/message-components#action-rows|Action Rows}
 */
export type ActionRowStructure<T extends ComponentResolvableStructure = ComponentResolvableStructure> = {
    /**
     * The components in this action row
     */
    components: T[];
    /**
     * 1 for an action row
     */
    type: ComponentTypes.ActionRow;
};
