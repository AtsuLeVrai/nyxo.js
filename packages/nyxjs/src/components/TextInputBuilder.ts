import type { Integer, Snowflake, TextInputStructure } from "@nyxjs/core";
import { ComponentTypes, TextInputStyles } from "@nyxjs/core";

export class TextInputBuilder {
    public static readonly CUSTOM_ID_LIMIT = 100;

    public static readonly LABEL_LIMIT = 45;

    public static readonly MIN_LENGTH = [0, 4_000];

    public static readonly MAX_LENGTH = [1, 4_000];

    public static readonly VALUE_LIMIT = 4_000;

    public static readonly PLACEHOLDER_LIMIT = 100;

    readonly #data: TextInputStructure;

    readonly #DEFAULT_DATA: TextInputStructure = {
        custom_id: "placeholder",
        label: "placeholder",
        type: ComponentTypes.TextInput,
        style: TextInputStyles.Short,
    };

    public constructor(data?: TextInputStructure) {
        this.#data = this.#resolveTextInput(data ?? this.#DEFAULT_DATA);
    }

    public static create(data?: TextInputStructure): TextInputBuilder {
        return new TextInputBuilder(data);
    }

    public setCustomId(customId: Snowflake): this {
        if (customId.length > TextInputBuilder.CUSTOM_ID_LIMIT) {
            throw new Error(`Custom ID must be less than or equal to ${TextInputBuilder.CUSTOM_ID_LIMIT} characters`);
        }

        this.#data.custom_id = customId;
        return this;
    }

    public setStyle(style: TextInputStyles): this {
        if (!Object.values(TextInputStyles).includes(style)) {
            throw new Error(`Invalid text input style: ${style}`);
        }

        this.#data.style = style;
        return this;
    }

    public setLabel(label: string): this {
        if (label.length > TextInputBuilder.LABEL_LIMIT) {
            throw new Error(`Label must be less than or equal to ${TextInputBuilder.LABEL_LIMIT} characters`);
        }

        this.#data.label = label;
        return this;
    }

    public setMinLength(minLength: Integer): this {
        if (minLength < TextInputBuilder.MIN_LENGTH[0] || minLength > TextInputBuilder.MIN_LENGTH[1]) {
            throw new Error(
                `Minimum length must be between ${TextInputBuilder.MIN_LENGTH[0]} and ${TextInputBuilder.MIN_LENGTH[1]}`
            );
        }

        this.#data.min_length = minLength;
        return this;
    }

    public setMaxLength(maxLength: Integer): this {
        if (maxLength < TextInputBuilder.MAX_LENGTH[0] || maxLength > TextInputBuilder.MAX_LENGTH[1]) {
            throw new Error(
                `Maximum length must be between ${TextInputBuilder.MAX_LENGTH[0]} and ${TextInputBuilder.MAX_LENGTH[1]}`
            );
        }

        this.#data.max_length = maxLength;
        return this;
    }

    public setRequired(required: boolean): this {
        this.#data.required = required;
        return this;
    }

    public setValue(value: string): this {
        if (value.length > TextInputBuilder.VALUE_LIMIT) {
            throw new Error(`Value must be less than or equal to ${TextInputBuilder.VALUE_LIMIT} characters`);
        }

        this.#data.value = value;
        return this;
    }

    public setPlaceholder(placeholder: string): this {
        if (placeholder.length > TextInputBuilder.PLACEHOLDER_LIMIT) {
            throw new Error(
                `Placeholder must be less than or equal to ${TextInputBuilder.PLACEHOLDER_LIMIT} characters`
            );
        }

        this.#data.placeholder = placeholder;
        return this;
    }

    public toJSON(): Readonly<TextInputStructure> {
        return Object.freeze({ ...this.#data });
    }

    public toString(): string {
        return JSON.stringify(this.#data);
    }

    #resolveTextInput(data: TextInputStructure): TextInputStructure {
        if (data.custom_id && data.custom_id.length > TextInputBuilder.CUSTOM_ID_LIMIT) {
            throw new Error(`Custom ID must be less than or equal to ${TextInputBuilder.CUSTOM_ID_LIMIT} characters`);
        }

        if (data.label && data.label.length > TextInputBuilder.LABEL_LIMIT) {
            throw new Error(`Label must be less than or equal to ${TextInputBuilder.LABEL_LIMIT} characters`);
        }

        if (
            data.min_length &&
            (data.min_length < TextInputBuilder.MIN_LENGTH[0] || data.min_length > TextInputBuilder.MIN_LENGTH[1])
        ) {
            throw new Error(
                `Minimum length must be between ${TextInputBuilder.MIN_LENGTH[0]} and ${TextInputBuilder.MIN_LENGTH[1]}`
            );
        }

        if (
            data.max_length &&
            (data.max_length < TextInputBuilder.MAX_LENGTH[0] || data.max_length > TextInputBuilder.MAX_LENGTH[1])
        ) {
            throw new Error(
                `Maximum length must be between ${TextInputBuilder.MAX_LENGTH[0]} and ${TextInputBuilder.MAX_LENGTH[1]}`
            );
        }

        if (data.value && data.value.length > TextInputBuilder.VALUE_LIMIT) {
            throw new Error(`Value must be less than or equal to ${TextInputBuilder.VALUE_LIMIT} characters`);
        }

        if (data.placeholder && data.placeholder.length > TextInputBuilder.PLACEHOLDER_LIMIT) {
            throw new Error(
                `Placeholder must be less than or equal to ${TextInputBuilder.PLACEHOLDER_LIMIT} characters`
            );
        }

        return data;
    }
}
