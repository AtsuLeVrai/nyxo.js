import {
    type ChannelTypes,
    ComponentTypes,
    type Integer,
    type SelectMenuDefaultValueStructure,
    type SelectMenuOptionStructure,
    type SelectMenuStructure,
} from "@nyxjs/core";

type BaseSelectMenuSchema<
    T extends
        | ComponentTypes.ChannelSelect
        | ComponentTypes.MentionableSelect
        | ComponentTypes.RoleSelect
        | ComponentTypes.StringSelect
        | ComponentTypes.UserSelect,
> = {
    setCustomId(customId: string): BaseSelectMenuSchema<T>;
    setDisabled(disabled: boolean): BaseSelectMenuSchema<T>;
    setMaxValues(max: Integer): BaseSelectMenuSchema<T>;
    setMinValues(min: Integer): BaseSelectMenuSchema<T>;
    setPlaceholder(placeholder: string): BaseSelectMenuSchema<T>;
    toJSON(): Readonly<Partial<SelectMenuStructure>>;
    toString(): string;
};

type StringSelectMenuSchema = BaseSelectMenuSchema<ComponentTypes.StringSelect> & {
    setOptions(options: SelectMenuOptionStructure[]): StringSelectMenuSchema;
};

type ChannelSelectMenuSchema = BaseSelectMenuSchema<ComponentTypes.ChannelSelect> & {
    setChannelTypes(types: ChannelTypes[]): ChannelSelectMenuSchema;
    setDefaultValues(values: SelectMenuDefaultValueStructure[]): ChannelSelectMenuSchema;
};

type UserSelectMenuSchema = BaseSelectMenuSchema<ComponentTypes.UserSelect> & {
    setDefaultValues(values: SelectMenuDefaultValueStructure[]): UserSelectMenuSchema;
};

type RoleSelectMenuSchema = BaseSelectMenuSchema<ComponentTypes.RoleSelect> & {
    setDefaultValues(values: SelectMenuDefaultValueStructure[]): RoleSelectMenuSchema;
};

type MentionableSelectMenuSchema = BaseSelectMenuSchema<ComponentTypes.MentionableSelect> & {
    setDefaultValues(values: SelectMenuDefaultValueStructure[]): MentionableSelectMenuSchema;
};

abstract class BaseSelectMenu<
    T extends
        | ComponentTypes.ChannelSelect
        | ComponentTypes.MentionableSelect
        | ComponentTypes.RoleSelect
        | ComponentTypes.StringSelect
        | ComponentTypes.UserSelect,
> implements BaseSelectMenuSchema<T>
{
    static readonly CUSTOM_ID_LIMIT = 100;

    static readonly OPTION_LIMIT = 25;

    static readonly PLACEHOLDER_LIMIT = 150;

    static readonly MIN_VALUES: [min: Integer, max: Integer] = [0, 25];

    static readonly MAX_VALUES = 25;

    protected data: Partial<SelectMenuStructure>;

    protected constructor(data: Partial<SelectMenuStructure> = {}) {
        this.data = data;
    }

    setCustomId(customId: string): this {
        this.data.custom_id = customId;
        return this;
    }

    setDisabled(disabled: boolean): this {
        this.data.disabled = disabled;
        return this;
    }

    setMaxValues(max: Integer): this {
        this.data.max_values = max;
        return this;
    }

    setMinValues(min: Integer): this {
        this.data.min_values = min;
        return this;
    }

    setPlaceholder(placeholder: string): this {
        this.data.placeholder = placeholder;
        return this;
    }

    toJSON(): Readonly<Partial<SelectMenuStructure>> {
        if (!this.#validate()) {
            return Object.freeze({});
        }

        return Object.freeze({ ...this.data });
    }

    toString(): string {
        return JSON.stringify(this.toJSON());
    }

    #validate(): boolean {
        try {
            if (this.data.custom_id && this.data.custom_id.length > BaseSelectMenu.CUSTOM_ID_LIMIT) {
                throw new Error(`Custom ID exceeds ${BaseSelectMenu.CUSTOM_ID_LIMIT} characters`);
            }

            if (this.data.placeholder && this.data.placeholder.length > BaseSelectMenu.PLACEHOLDER_LIMIT) {
                throw new Error(`Placeholder exceeds ${BaseSelectMenu.PLACEHOLDER_LIMIT} characters`);
            }

            if (this.data.options && this.data.options.length > BaseSelectMenu.OPTION_LIMIT) {
                throw new Error(`Options exceed ${BaseSelectMenu.OPTION_LIMIT}`);
            }

            if (
                this.data.min_values &&
                (this.data.min_values < BaseSelectMenu.MIN_VALUES[0] ||
                    this.data.min_values > BaseSelectMenu.MIN_VALUES[1])
            ) {
                throw new Error(
                    `Min values must be between ${BaseSelectMenu.MIN_VALUES[0]} and ${BaseSelectMenu.MIN_VALUES[1]}`
                );
            }

            if (this.data.max_values && this.data.max_values > BaseSelectMenu.MAX_VALUES) {
                throw new Error(`Max values must be less than or equal to ${BaseSelectMenu.MAX_VALUES}`);
            }

            return true;
        } catch {
            return false;
        }
    }
}

export class StringSelectMenuBuilder
    extends BaseSelectMenu<ComponentTypes.StringSelect>
    implements StringSelectMenuSchema
{
    constructor() {
        super({ type: ComponentTypes.StringSelect });
    }

    setOptions(options: SelectMenuOptionStructure[]): this {
        this.data.options = options;
        return this;
    }
}

export class ChannelSelectMenuBuilder
    extends BaseSelectMenu<ComponentTypes.ChannelSelect>
    implements ChannelSelectMenuSchema
{
    constructor() {
        super({ type: ComponentTypes.ChannelSelect });
    }

    setChannelTypes(types: ChannelTypes[]): this {
        this.data.channel_types = types;
        return this;
    }

    setDefaultValues(values: SelectMenuDefaultValueStructure[]): this {
        this.data.default_values = values;
        return this;
    }
}

export class UserSelectMenuBuilder extends BaseSelectMenu<ComponentTypes.UserSelect> implements UserSelectMenuSchema {
    constructor() {
        super({ type: ComponentTypes.UserSelect });
    }

    setDefaultValues(values: SelectMenuDefaultValueStructure[]): this {
        this.data.default_values = values;
        return this;
    }
}

export class RoleSelectMenuBuilder extends BaseSelectMenu<ComponentTypes.RoleSelect> implements RoleSelectMenuSchema {
    constructor() {
        super({ type: ComponentTypes.RoleSelect });
    }

    setDefaultValues(values: SelectMenuDefaultValueStructure[]): this {
        this.data.default_values = values;
        return this;
    }
}

export class MentionableSelectMenuBuilder
    extends BaseSelectMenu<ComponentTypes.MentionableSelect>
    implements MentionableSelectMenuSchema
{
    constructor() {
        super({ type: ComponentTypes.MentionableSelect });
    }

    setDefaultValues(values: SelectMenuDefaultValueStructure[]): this {
        this.data.default_values = values;
        return this;
    }
}

export type SelectMenuResolvable =
    | StringSelectMenuBuilder
    | ChannelSelectMenuBuilder
    | UserSelectMenuBuilder
    | RoleSelectMenuBuilder
    | MentionableSelectMenuBuilder;
