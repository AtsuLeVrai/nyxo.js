import type {
    ChannelTypes,
    SelectMenuDefaultValueStructure,
    SelectMenuOptionStructure,
    SelectMenuStructure,
} from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";
import { SelectMenuLimits, SelectOptionLimits } from "../libs/Limits";

abstract class BaseSelectBuilder<T extends SelectMenuStructure> {
    protected constructor(public data: T) {}

    public abstract toJSON(): T;

    public setCustomId(customId: string): this {
        this.validateLength(customId, SelectMenuLimits.CustomId, "CustomId");
        this.data.custom_id = customId;
        return this;
    }

    public setPlaceholder(placeholder: string): this {
        this.validateLength(placeholder, SelectMenuLimits.Placeholder, "Placeholder");
        this.data.placeholder = placeholder;
        return this;
    }

    public setMinValues(minValues: number): this {
        this.validateRange(minValues, SelectMenuLimits.MinValues.Min, SelectMenuLimits.MinValues.Max, "Min values");
        this.data.min_values = minValues;
        return this;
    }

    public setMaxValues(maxValues: number): this {
        this.validateRange(maxValues, SelectMenuLimits.MaxValues.Min, SelectMenuLimits.MaxValues.Max, "Max values");
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

    protected validateLength(value: string, limit: number, fieldName: string): void {
        if (value.length > limit) {
            throw new Error(`${fieldName} exceeds the maximum length of ${limit}`);
        }
    }

    private validateRange(value: number, min: number, max: number, fieldName: string): void {
        if (value < min || value > max) {
            throw new Error(`${fieldName} must be between ${min} and ${max}`);
        }
    }
}

class SelectBuilderFactory<T extends SelectMenuStructure> extends BaseSelectBuilder<T> {
    public constructor(type: ComponentTypes, data?: Partial<T>) {
        super({ custom_id: "", type, ...data } as T);
    }

    public static createBuilder<U extends SelectMenuStructure>(
        type: ComponentTypes,
        data?: Partial<U>
    ): SelectBuilderFactory<U> {
        return new SelectBuilderFactory<U>(type, data);
    }

    public toJSON(): T {
        return this.data;
    }
}

export class ChannelSelectBuilder extends SelectBuilderFactory<SelectMenuStructure> {
    public constructor(data?: Partial<SelectMenuStructure>) {
        super(ComponentTypes.ChannelSelect, data);
    }

    public static from(data?: Partial<SelectMenuStructure>): ChannelSelectBuilder {
        return new ChannelSelectBuilder(data);
    }

    public setChannelTypes(types: ChannelTypes[]): this {
        this.data.channel_types = types;
        return this;
    }
}

export class MentionableSelectBuilder extends SelectBuilderFactory<SelectMenuStructure> {
    public constructor(data?: Partial<SelectMenuStructure>) {
        super(ComponentTypes.MentionableSelect, data);
    }

    public static from(data?: Partial<SelectMenuStructure>): MentionableSelectBuilder {
        return new MentionableSelectBuilder(data);
    }
}

export class RoleSelectBuilder extends SelectBuilderFactory<SelectMenuStructure> {
    public constructor(data?: Partial<SelectMenuStructure>) {
        super(ComponentTypes.RoleSelect, data);
    }

    public static from(data?: Partial<SelectMenuStructure>): RoleSelectBuilder {
        return new RoleSelectBuilder(data);
    }
}

export class UserSelectBuilder extends SelectBuilderFactory<SelectMenuStructure> {
    public constructor(data?: Partial<SelectMenuStructure>) {
        super(ComponentTypes.UserSelect, data);
    }

    public static from(data?: Partial<SelectMenuStructure>): UserSelectBuilder {
        return new UserSelectBuilder(data);
    }
}

export class StringSelectBuilder extends SelectBuilderFactory<SelectMenuStructure> {
    public constructor(data?: Partial<SelectMenuStructure>) {
        super(ComponentTypes.StringSelect, data);
    }

    public static from(data?: Partial<SelectMenuStructure>): StringSelectBuilder {
        return new StringSelectBuilder(data);
    }

    public addOptions(...options: SelectMenuOptionStructure[]): this {
        this.validateOptions(options);
        this.data.options = [...(this.data.options ?? []), ...options];
        return this;
    }

    public setOptions(options: SelectMenuOptionStructure[]): this {
        this.validateOptions(options);
        this.data.options = options;
        return this;
    }

    private validateOptions(options: SelectMenuOptionStructure[]): void {
        if (options.length > SelectMenuLimits.Options) {
            throw new Error(`Options exceeds the maximum length of ${SelectMenuLimits.Options}`);
        }

        for (const option of options) {
            this.validateLength(option.label, SelectOptionLimits.Label, "Label");
            this.validateLength(option.value, SelectOptionLimits.Value, "Value");
            if (option.description) {
                this.validateLength(option.description, SelectOptionLimits.Description, "Description");
            }
        }
    }
}
