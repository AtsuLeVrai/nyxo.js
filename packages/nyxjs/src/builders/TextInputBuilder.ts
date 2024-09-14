import type { TextInputStructure } from "@nyxjs/core";
import { ComponentTypes, TextInputStyles } from "@nyxjs/core";
import { TextInputLimits } from "../libs/Limits";

const DEFAULT_VALUES: TextInputStructure = {
    custom_id: "",
    label: "",
    style: TextInputStyles.Short,
    type: ComponentTypes.TextInput,
};

export class TextInputBuilder {
    public constructor(public data: TextInputStructure = DEFAULT_VALUES) {}

    public static from(data?: TextInputStructure): TextInputBuilder {
        return new TextInputBuilder(data);
    }

    public setCustomId(customId: string): this {
        this.data.custom_id = customId;
        return this;
    }

    public setStyle(style: TextInputStyles): this {
        this.data.style = style;
        return this;
    }

    public setLabel(label: string): this {
        if (TextInputLimits.Label < label.length) {
            throw new Error(`Label exceeds the maximum length of ${TextInputLimits.Label}`);
        }

        this.data.label = label;
        return this;
    }

    public setMinLength(minLength: number): this {
        if (TextInputLimits.MinLength.Min > minLength) {
            throw new Error(`Min length is less than the minimum length of ${TextInputLimits.MinLength.Min}`);
        }

        if (TextInputLimits.MinLength.Max < minLength) {
            throw new Error(`Min length exceeds the maximum length of ${TextInputLimits.MinLength.Max}`);
        }

        this.data.min_length = minLength;
        return this;
    }

    public setMaxLength(maxLength: number): this {
        if (TextInputLimits.MaxLength.Min > maxLength) {
            throw new Error(`Max length is less than the minimum length of ${TextInputLimits.MaxLength.Min}`);
        }

        if (TextInputLimits.MaxLength.Max < maxLength) {
            throw new Error(`Max length exceeds the maximum length of ${TextInputLimits.MaxLength.Max}`);
        }

        this.data.max_length = maxLength;
        return this;
    }

    public setValue(value: string): this {
        if (TextInputLimits.Value < value.length) {
            throw new Error(`Value exceeds the maximum length of ${TextInputLimits.Value}`);
        }

        this.data.value = value;
        return this;
    }

    public setPlaceholder(placeholder: string): this {
        if (TextInputLimits.Placeholder < placeholder.length) {
            throw new Error(`Placeholder exceeds the maximum length of ${TextInputLimits.Placeholder}`);
        }

        this.data.placeholder = placeholder;
        return this;
    }
}
