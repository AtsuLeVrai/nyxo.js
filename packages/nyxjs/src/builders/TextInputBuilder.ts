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
    private readonly data: TextInputStructure;

    public constructor(data: Partial<TextInputStructure> = {}) {
        this.data = { ...DEFAULT_VALUES, ...data };
    }

    public static from(data?: Partial<TextInputStructure>): TextInputBuilder {
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
        this.validateLength(label, TextInputLimits.Label, "Label");
        this.data.label = label;
        return this;
    }

    public setMinLength(minLength: number): this {
        this.validateRange(minLength, TextInputLimits.MinLength.Min, TextInputLimits.MinLength.Max, "Min length");
        this.data.min_length = minLength;
        return this;
    }

    public setMaxLength(maxLength: number): this {
        this.validateRange(maxLength, TextInputLimits.MaxLength.Min, TextInputLimits.MaxLength.Max, "Max length");
        this.data.max_length = maxLength;
        return this;
    }

    public setValue(value: string): this {
        this.validateLength(value, TextInputLimits.Value, "Value");
        this.data.value = value;
        return this;
    }

    public setPlaceholder(placeholder: string): this {
        this.validateLength(placeholder, TextInputLimits.Placeholder, "Placeholder");
        this.data.placeholder = placeholder;
        return this;
    }

    public toJSON(): TextInputStructure {
        return this.data;
    }

    private validateLength(value: string, limit: number, fieldName: string): void {
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
