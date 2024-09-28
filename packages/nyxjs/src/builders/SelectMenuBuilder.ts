import type {
    ChannelTypes,
    SelectMenuDefaultValueStructure,
    SelectMenuOptionStructure,
    SelectMenuStructure,
} from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";
import { BaseBuilder } from "./BaseBuilder";

export const SelectMenuLimits = {
    CUSTOM_ID: 100,
    OPTIONS: 25,
    PLACEHOLDER: 150,
    MIN_VALUES: {
        MIN: 0,
        MAX: 25,
    },
    MAX_VALUES: 25,
    LABEL: 100,
    VALUE: 100,
    DESCRIPTION: 100,
};

export type AllSelectMenuTypes =
    | ComponentTypes.ChannelSelect
    | ComponentTypes.MentionableSelect
    | ComponentTypes.RoleSelect
    | ComponentTypes.StringSelect
    | ComponentTypes.UserSelect;

abstract class BaseSelectBuilder<T extends SelectMenuStructure = SelectMenuStructure> extends BaseBuilder<T> {
    protected constructor(
        type: AllSelectMenuTypes,
        public data: Partial<T>
    ) {
        super();
        this.data.type = type;
    }

    public setCustomId(customId: string): this {
        this.validateLength(customId, SelectMenuLimits.CUSTOM_ID, "CustomId");
        this.data.custom_id = customId;
        return this;
    }

    public setPlaceholder(placeholder: string): this {
        this.validateLength(placeholder, SelectMenuLimits.PLACEHOLDER, "Placeholder");
        this.data.placeholder = placeholder;
        return this;
    }

    public setMinValues(minValues: number): this {
        this.validateRange(minValues, SelectMenuLimits.MIN_VALUES.MIN, SelectMenuLimits.MIN_VALUES.MAX, "Min values");
        this.data.min_values = minValues;
        return this;
    }

    public setMaxValues(maxValues: number): this {
        this.validateRange(maxValues, SelectMenuLimits.MAX_VALUES, SelectMenuLimits.MAX_VALUES, "Max values");
        this.data.max_values = maxValues;
        return this;
    }

    public setDisabled(disabled: boolean): this {
        this.data.disabled = disabled;
        return this;
    }

    public setDefaultValues(defaultValues: SelectMenuDefaultValueStructure[]): this {
        this.data.default_values = defaultValues;
        return this;
    }
}

export class ChannelSelectBuilder extends BaseSelectBuilder {
    public constructor(data: Partial<SelectMenuStructure> = {}) {
        super(ComponentTypes.ChannelSelect, data);
    }

    public setChannelTypes(types: ChannelTypes[]): this {
        this.data.channel_types = types;
        return this;
    }

    public toJSON(): SelectMenuStructure {
        return this.data as SelectMenuStructure;
    }
}

export class MentionableSelectBuilder extends BaseSelectBuilder {
    public constructor(data: Partial<SelectMenuStructure> = {}) {
        super(ComponentTypes.MentionableSelect, data);
    }

    public toJSON(): SelectMenuStructure {
        return this.data as SelectMenuStructure;
    }
}

export class RoleSelectBuilder extends BaseSelectBuilder {
    public constructor(data: Partial<SelectMenuStructure> = {}) {
        super(ComponentTypes.RoleSelect, data);
    }

    public toJSON(): SelectMenuStructure {
        return this.data as SelectMenuStructure;
    }
}

export class UserSelectBuilder extends BaseSelectBuilder {
    public constructor(data: Partial<SelectMenuStructure> = {}) {
        super(ComponentTypes.UserSelect, data);
    }

    public toJSON(): SelectMenuStructure {
        return this.data as SelectMenuStructure;
    }
}

export class StringSelectBuilder extends BaseSelectBuilder {
    public constructor(data: Partial<SelectMenuStructure> = {}) {
        super(ComponentTypes.StringSelect, data);
    }

    public toJSON(): SelectMenuStructure {
        return this.data as SelectMenuStructure;
    }

    public addOptions(options: SelectMenuOptionStructure[]): this {
        if (!this.data.options) {
            this.data.options = [];
        }

        this.validateOptions(options);

        this.data.options.push(...options);
        return this;
    }

    public setOptions(options: SelectMenuOptionStructure[]): this {
        this.validateOptions(options);
        this.data.options = options;
        return this;
    }

    private validateOptions(options: SelectMenuOptionStructure[]): void {
        this.validateLength(options.length.toString(), SelectMenuLimits.OPTIONS, "Options");
        for (const option of options) {
            this.validateLength(option.label, SelectMenuLimits.LABEL, "Label");
            this.validateLength(option.value, SelectMenuLimits.VALUE, "Value");
            if (option.description) {
                this.validateLength(option.description, SelectMenuLimits.DESCRIPTION, "Description");
            }
        }
    }
}
