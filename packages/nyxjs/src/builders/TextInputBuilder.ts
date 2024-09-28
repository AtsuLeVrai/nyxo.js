import type { Integer, TextInputStructure, TextInputStyles } from "@nyxjs/core";
import { ComponentTypes } from "@nyxjs/core";
import { BaseBuilder } from "../bases/BaseBuilder";

export const TextInputLimits = {
    CUSTOM_ID: 100,
    LABEL: 45,
    MIN_LENGTH: {
        MIN: 0,
        MAX: 4_000,
    },
    MAX_LENGTH: {
        MIN: 1,
        MAX: 4_000,
    },
    VALUE: 4_000,
    PLACEHOLDER: 100,
};

export class TextInputBuilder<T extends TextInputStructure = TextInputStructure> extends BaseBuilder<T> {
    readonly #data: Partial<T>;

    public constructor(data: Partial<T> = {}) {
        super();
        this.#data = data;
    }

    public setType(type: ComponentTypes.TextInput = ComponentTypes.TextInput): this {
        this.#data.type = type;
        return this;
    }

    public setCustomId(customId: string): this {
        this.validateLength(customId, TextInputLimits.CUSTOM_ID, "Custom ID");
        this.#data.custom_id = customId;
        return this;
    }

    public setStyle(style: TextInputStyles): this {
        this.#data.style = style;
        return this;
    }

    public setLabel(label: string): this {
        this.validateLength(label, TextInputLimits.LABEL, "Label");
        this.#data.label = label;
        return this;
    }

    public setMinLength(minLength: Integer): this {
        this.validateRange(minLength, TextInputLimits.MIN_LENGTH.MIN, TextInputLimits.MIN_LENGTH.MAX, "Min length");
        this.#data.min_length = minLength;
        return this;
    }

    public setMaxLength(maxLength: Integer): this {
        this.validateRange(maxLength, TextInputLimits.MAX_LENGTH.MIN, TextInputLimits.MAX_LENGTH.MAX, "Max length");
        this.#data.max_length = maxLength;
        return this;
    }

    public setRequired(required: boolean): this {
        this.#data.required = required;
        return this;
    }

    public setValue(value: string): this {
        this.validateLength(value, TextInputLimits.VALUE, "Value");
        this.#data.value = value;
        return this;
    }

    public setPlaceholder(placeholder: string): this {
        this.validateLength(placeholder, TextInputLimits.PLACEHOLDER, "Placeholder");
        this.#data.placeholder = placeholder;
        return this;
    }

    public toJSON(): T {
        return this.#data as T;
    }
}
