import type {
    ChannelTypes,
    Integer,
    SelectMenuDefaultValueStructure,
    SelectMenuOptionStructure,
    SelectMenuStructure,
    SelectMenuTypes,
    Snowflake,
} from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";

export class SelectMenuBuilder {
    public static readonly CUSTOM_ID_LIMIT = 100;

    public static readonly OPTION_LIMIT = 25;

    public static readonly PLACEHOLDER_LIMIT = 150;

    public static readonly MIN_VALUES = [0, 25];

    public static readonly MAX_VALUES = 25;

    readonly #data: SelectMenuStructure;

    readonly #DEFAULT_DATA: SelectMenuStructure = {
        custom_id: "placeholder",
        type: ComponentTypes.StringSelect,
    };

    public constructor(data?: SelectMenuStructure) {
        this.#data = this.#resolveSelectMenu(data ?? this.#DEFAULT_DATA);
    }

    public static create(data?: SelectMenuStructure): SelectMenuBuilder {
        return new SelectMenuBuilder(data);
    }

    public setType(type: SelectMenuTypes): this {
        if (
            ![
                ComponentTypes.ChannelSelect |
                    ComponentTypes.MentionableSelect |
                    ComponentTypes.RoleSelect |
                    ComponentTypes.StringSelect |
                    ComponentTypes.UserSelect,
            ].includes(type)
        ) {
            throw new Error("Invalid select menu type. Must be 5, 6, 7, 8.");
        }

        this.#data.type = type;
        return this;
    }

    public setCustomId(customId: Snowflake): this {
        if (customId.length > SelectMenuBuilder.CUSTOM_ID_LIMIT) {
            throw new Error(`Custom ID must be less than or equal to ${SelectMenuBuilder.CUSTOM_ID_LIMIT} characters`);
        }

        this.#data.custom_id = customId;
        return this;
    }

    public setOptions(options: SelectMenuOptionStructure[]): this {
        if (this.#data.type !== ComponentTypes.StringSelect) {
            throw new Error("Options can only be set for string select menus (type 3)");
        }

        if (options.length > SelectMenuBuilder.OPTION_LIMIT) {
            throw new Error(`Options must be less than or equal to ${SelectMenuBuilder.OPTION_LIMIT}`);
        }

        this.#data.options = options;
        this.#data.type = ComponentTypes.StringSelect;
        return this;
    }

    public setChannelTypes(channelTypes: ChannelTypes[]): this {
        if (this.#data.type !== ComponentTypes.ChannelSelect) {
            throw new Error("Channel types can only be set for channel select menus (type 8)");
        }

        this.#data.channel_types = channelTypes;
        this.#data.type = ComponentTypes.ChannelSelect;
        return this;
    }

    public setPlaceholder(placeholder: string): this {
        if (placeholder.length > SelectMenuBuilder.PLACEHOLDER_LIMIT) {
            throw new Error(
                `Placeholder must be less than or equal to ${SelectMenuBuilder.PLACEHOLDER_LIMIT} characters`
            );
        }

        this.#data.placeholder = placeholder;
        return this;
    }

    public setDefaultValues(defaultValues: SelectMenuDefaultValueStructure[]): this {
        if (
            ![
                ComponentTypes.ChannelSelect |
                    ComponentTypes.MentionableSelect |
                    ComponentTypes.RoleSelect |
                    ComponentTypes.StringSelect |
                    ComponentTypes.UserSelect,
            ].includes(this.#data.type)
        ) {
            throw new Error(
                "Default values can only be set for auto-populated select menu components (types 5, 6, 7, 8)"
            );
        }

        if (this.#data.min_values && defaultValues.length < this.#data.min_values) {
            throw new Error(`Number of default values must be at least ${this.#data.min_values}`);
        }

        if (this.#data.max_values && defaultValues.length > this.#data.max_values) {
            throw new Error(`Number of default values must not exceed ${this.#data.max_values}`);
        }

        this.#data.default_values = defaultValues;
        return this;
    }

    public setMinValues(minValues: Integer): this {
        if (minValues < SelectMenuBuilder.MIN_VALUES[0] || minValues > SelectMenuBuilder.MIN_VALUES[1]) {
            throw new Error(
                `Minimum values must be between ${SelectMenuBuilder.MIN_VALUES[0]} and ${SelectMenuBuilder.MIN_VALUES[1]}`
            );
        }

        this.#data.min_values = minValues;
        return this;
    }

    public setMaxValues(maxValues: Integer): this {
        if (maxValues > SelectMenuBuilder.MAX_VALUES) {
            throw new Error(`Maximum values must be less than or equal to ${SelectMenuBuilder.MAX_VALUES}`);
        }

        this.#data.max_values = maxValues;
        return this;
    }

    public setDisabled(disabled: boolean): this {
        this.#data.disabled = disabled;
        return this;
    }

    public toJSON(): Readonly<SelectMenuStructure> {
        return Object.freeze({ ...this.#data });
    }

    public toString(): string {
        return JSON.stringify(this.#data);
    }

    #resolveSelectMenu(data: SelectMenuStructure): SelectMenuStructure {
        if (
            ![
                ComponentTypes.ChannelSelect |
                    ComponentTypes.MentionableSelect |
                    ComponentTypes.RoleSelect |
                    ComponentTypes.StringSelect |
                    ComponentTypes.UserSelect,
            ].includes(data.type)
        ) {
            throw new Error("Invalid select menu type. Must be 5, 6, 7, 8.");
        }

        if (data.type === ComponentTypes.StringSelect && !data.options) {
            throw new Error("Options are required for string select menus (type 3)");
        }

        if (data.type !== ComponentTypes.StringSelect && data.options) {
            throw new Error("Options are only available for string select menus (type 3)");
        }

        if (data.type !== ComponentTypes.ChannelSelect && data.channel_types) {
            throw new Error("Channel types can only be set for channel select menus (type 8)");
        }

        if (
            ![
                ComponentTypes.ChannelSelect |
                    ComponentTypes.MentionableSelect |
                    ComponentTypes.RoleSelect |
                    ComponentTypes.StringSelect |
                    ComponentTypes.UserSelect,
            ].includes(data.type) &&
            data.default_values
        ) {
            throw new Error(
                "Default values can only be set for auto-populated select menu components (types 5, 6, 7, 8)"
            );
        }

        if (data.default_values) {
            if (data.min_values && data.default_values.length < data.min_values) {
                throw new Error(`Number of default values must be at least ${data.min_values}`);
            }

            if (data.max_values && data.default_values.length > data.max_values) {
                throw new Error(`Number of default values must not exceed ${data.max_values}`);
            }
        }

        return data;
    }
}
