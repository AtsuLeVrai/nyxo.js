import type {
    ChannelTypes,
    SelectDefaultValueStructure,
    SelectMenuStructure,
    SelectOptionStructure,
} from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";
import { SelectMenuLimits, SelectOptionLimits } from "../libs/Limits";

abstract class BaseSelectBuilder<T extends SelectMenuStructure> {
    protected constructor(public data: T) {}

    public setCustomId(customId: string): this {
        if (SelectMenuLimits.CustomId < customId.length) {
            throw new Error(`CustomId exceeds the maximum length of ${SelectMenuLimits.CustomId}`);
        }

        this.data.custom_id = customId;
        return this;
    }

    public setPlaceholder(placeholder: string): this {
        if (SelectMenuLimits.Placeholder < placeholder.length) {
            throw new Error(`Placeholder exceeds the maximum length of ${SelectMenuLimits.Placeholder}`);
        }

        this.data.placeholder = placeholder;
        return this;
    }

    public setMinValues(minValues: number): this {
        if (SelectMenuLimits.MinValues.Min > minValues || SelectMenuLimits.MinValues.Max < minValues) {
            throw new Error(
                `Min values must be between ${SelectMenuLimits.MinValues.Min} and ${SelectMenuLimits.MinValues.Max}`
            );
        }

        this.data.min_values = minValues;
        return this;
    }

    public setMaxValues(maxValues: number): this {
        if (SelectMenuLimits.MaxValues.Min > maxValues || SelectMenuLimits.MaxValues.Max < maxValues) {
            throw new Error(
                `Max values must be between ${SelectMenuLimits.MaxValues.Min} and ${SelectMenuLimits.MaxValues.Max}`
            );
        }

        this.data.max_values = maxValues;
        return this;
    }

    public setDisabled(disabled: boolean): this {
        this.data.disabled = disabled;
        return this;
    }

    public setDefaultValues(defaultValues: SelectDefaultValueStructure[]): this {
        this.data.default_values = defaultValues;
        return this;
    }
}

export class ChannelSelectBuilder extends BaseSelectBuilder<SelectMenuStructure> {
    public constructor(data?: SelectMenuStructure) {
        super(data ?? { custom_id: "", type: ComponentTypes.ChannelSelect });
    }

    public static from(data?: SelectMenuStructure): ChannelSelectBuilder {
        return new ChannelSelectBuilder(data);
    }

    public setChannelTypes(types: ChannelTypes[]): this {
        this.data.channel_types = types;
        return this;
    }
}

export class MentionableSelectBuilder extends BaseSelectBuilder<SelectMenuStructure> {
    public constructor(data?: SelectMenuStructure) {
        super(data ?? { custom_id: "", type: ComponentTypes.MentionableSelect });
    }

    public static from(data?: SelectMenuStructure): MentionableSelectBuilder {
        return new MentionableSelectBuilder(data);
    }
}

export class RoleSelectBuilder extends BaseSelectBuilder<SelectMenuStructure> {
    public constructor(data?: SelectMenuStructure) {
        super(data ?? { custom_id: "", type: ComponentTypes.RoleSelect });
    }

    public static from(data?: SelectMenuStructure): RoleSelectBuilder {
        return new RoleSelectBuilder(data);
    }
}

export class UserSelectBuilder extends BaseSelectBuilder<SelectMenuStructure> {
    public constructor(data?: SelectMenuStructure) {
        super(data ?? { custom_id: "", type: ComponentTypes.UserSelect });
    }

    public static from(data?: SelectMenuStructure): UserSelectBuilder {
        return new UserSelectBuilder(data);
    }
}

export class StringSelectBuilder extends BaseSelectBuilder<SelectMenuStructure> {
    public constructor(data?: SelectMenuStructure) {
        super(data ?? { custom_id: "", type: ComponentTypes.StringSelect });
    }

    public static from(data?: SelectMenuStructure): StringSelectBuilder {
        return new StringSelectBuilder(data);
    }

    public addOptions(...options: SelectOptionStructure[]): this {
        this.validateOptions(options);
        this.data.options = [...(this.data.options ?? []), ...options];
        return this;
    }

    public setOptions(options: SelectOptionStructure[]): this {
        this.validateOptions(options);
        this.data.options = options;
        return this;
    }

    private validateOptions(options: SelectOptionStructure[]): void {
        if (SelectMenuLimits.Options < options.length) {
            throw new Error(`Options exceeds the maximum length of ${SelectMenuLimits.Options}`);
        }

        for (const option of options) {
            if (SelectOptionLimits.Label < option.label.length) {
                throw new Error(`Label exceeds the maximum length of ${SelectOptionLimits.Label}`);
            }

            if (SelectOptionLimits.Value < option.value.length) {
                throw new Error(`Value exceeds the maximum length of ${SelectOptionLimits.Value}`);
            }

            if (option.description && SelectOptionLimits.Description < option.description.length) {
                throw new Error(`Description exceeds the maximum length of ${SelectOptionLimits.Description}`);
            }
        }
    }
}
