import type { SelectDefaultValueStructure, SelectMenuStructure } from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";
import { SelectMenuLimits } from "../libs/Limits";

const DEFAULT_VALUES: SelectMenuStructure = {
    custom_id: "",
    type: ComponentTypes.RoleSelect,
};

export class RoleSelectBuilder {
    public constructor(public data: SelectMenuStructure = DEFAULT_VALUES) {}

    public static from(data?: SelectMenuStructure): RoleSelectBuilder {
        return new RoleSelectBuilder(data);
    }

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

    public setDefaultValues(defaultValues: SelectDefaultValueStructure[]): this {
        this.data.default_values = defaultValues;
        return this;
    }

    public setMinValues(minValues: number): this {
        if (SelectMenuLimits.MinValues.Min > minValues) {
            throw new Error(`Min values is less than the minimum length of ${SelectMenuLimits.MinValues.Min}`);
        }

        if (SelectMenuLimits.MinValues.Max < minValues) {
            throw new Error(`Min values exceeds the maximum length of ${SelectMenuLimits.MinValues.Max}`);
        }

        this.data.min_values = minValues;
        return this;
    }

    public setMaxValues(maxValues: number): this {
        if (SelectMenuLimits.MaxValues.Min > maxValues) {
            throw new Error(`Max values is less than the minimum length of ${SelectMenuLimits.MaxValues.Min}`);
        }

        if (SelectMenuLimits.MaxValues.Max < maxValues) {
            throw new Error(`Max values exceeds the maximum length of ${SelectMenuLimits.MaxValues.Max}`);
        }

        this.data.max_values = maxValues;
        return this;
    }

    public setDisabled(disabled: boolean): this {
        this.data.disabled = disabled;
        return this;
    }
}
