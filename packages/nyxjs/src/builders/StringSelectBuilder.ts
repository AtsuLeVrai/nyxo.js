import type { SelectMenuStructure, SelectOptionStructure } from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";
import { SelectMenuLimits, SelectOptionLimits } from "../libs/Limits";

const DEFAULT_VALUES: SelectMenuStructure = {
    custom_id: "",
    type: ComponentTypes.StringSelect,
};

export class StringSelectBuilder {
    public constructor(public data: SelectMenuStructure = DEFAULT_VALUES) {}

    public static from(data?: SelectMenuStructure): StringSelectBuilder {
        return new StringSelectBuilder(data);
    }

    public setCustomId(customId: string): this {
        if (SelectMenuLimits.CustomId < customId.length) {
            throw new Error(`CustomId exceeds the maximum length of ${SelectMenuLimits.CustomId}`);
        }

        this.data.custom_id = customId;
        return this;
    }

    public addOptions(...options: SelectOptionStructure[]): this {
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

        this.data.options?.push(...options);
        return this;
    }

    public setOptions(options: SelectOptionStructure[]): this {
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

        this.data.options = options;
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
