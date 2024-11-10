import type { Integer, TextInputStructure, TextInputStyles } from "@nyxjs/core";

interface TextInputSchema {
    setCustomId(customId: string): TextInputSchema;
    setLabel(label: string): TextInputSchema;
    setMaxLength(maxLength: Integer): TextInputSchema;
    setMinLength(minLength: Integer): TextInputSchema;
    setPlaceholder(placeholder: string): TextInputSchema;
    setRequired(required: boolean): TextInputSchema;
    setStyle(style: TextInputStyles): TextInputSchema;
    setValue(value: string): TextInputSchema;
    toJson(): Readonly<Partial<TextInputStructure>>;
    toString(): string;
}

export class TextInputBuilder implements TextInputSchema {
    static readonly CUSTOM_ID_LIMIT = 100;

    static readonly LABEL_LIMIT = 45;

    static readonly MIN_LENGTH: [min: Integer, max: Integer] = [0, 4_000];

    static readonly MAX_LENGTH: [min: Integer, max: Integer] = [1, 4_000];

    static readonly VALUE_LIMIT = 4_000;

    static readonly PLACEHOLDER_LIMIT = 100;

    readonly #data: Partial<TextInputStructure>;

    constructor(data: Partial<TextInputStructure> = {}) {
        this.#data = data;
    }

    setCustomId(customId: string): this {
        this.#data.custom_id = customId;
        return this;
    }

    setLabel(label: string): this {
        this.#data.label = label;
        return this;
    }

    setMaxLength(maxLength: Integer): this {
        this.#data.max_length = maxLength;
        return this;
    }

    setMinLength(minLength: Integer): this {
        this.#data.min_length = minLength;
        return this;
    }

    setPlaceholder(placeholder: string): this {
        this.#data.placeholder = placeholder;
        return this;
    }

    setRequired(required: boolean): this {
        this.#data.required = required;
        return this;
    }

    setStyle(style: TextInputStyles): this {
        this.#data.style = style;
        return this;
    }

    setValue(value: string): this {
        this.#data.value = value;
        return this;
    }

    toJson(): Readonly<Partial<TextInputStructure>> {
        if (!this.#validate()) {
            return Object.freeze({});
        }

        return Object.freeze({ ...this.#data });
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    #validate(): boolean {
        try {
            if (this.#data.custom_id && this.#data.custom_id.length > TextInputBuilder.CUSTOM_ID_LIMIT) {
                throw new Error(
                    `Custom ID must be less than or equal to ${TextInputBuilder.CUSTOM_ID_LIMIT} characters`,
                );
            }

            if (this.#data.label && this.#data.label.length > TextInputBuilder.LABEL_LIMIT) {
                throw new Error(`Label must be less than or equal to ${TextInputBuilder.LABEL_LIMIT} characters`);
            }

            if (
                this.#data.max_length &&
                (this.#data.max_length < TextInputBuilder.MAX_LENGTH[0] ||
                    this.#data.max_length > TextInputBuilder.MAX_LENGTH[1])
            ) {
                throw new Error(
                    `Max length must be between ${TextInputBuilder.MAX_LENGTH[0]} and ${TextInputBuilder.MAX_LENGTH[1]}`,
                );
            }

            if (
                this.#data.min_length &&
                (this.#data.min_length < TextInputBuilder.MIN_LENGTH[0] ||
                    this.#data.min_length > TextInputBuilder.MIN_LENGTH[1])
            ) {
                throw new Error(
                    `Min length must be between ${TextInputBuilder.MIN_LENGTH[0]} and ${TextInputBuilder.MIN_LENGTH[1]}`,
                );
            }

            if (this.#data.placeholder && this.#data.placeholder.length > TextInputBuilder.PLACEHOLDER_LIMIT) {
                throw new Error(
                    `Placeholder must be less than or equal to ${TextInputBuilder.PLACEHOLDER_LIMIT} characters`,
                );
            }

            if (this.#data.value && this.#data.value.length > TextInputBuilder.VALUE_LIMIT) {
                throw new Error(`Value must be less than or equal to ${TextInputBuilder.VALUE_LIMIT} characters`);
            }

            return true;
        } catch {
            return false;
        }
    }
}
