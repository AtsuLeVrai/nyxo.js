import type { ButtonStructure, EmojiStructure, Snowflake } from "@nyxjs/core";
import { ButtonStyles, ComponentTypes } from "@nyxjs/core";

export class ButtonBuilder {
    public static readonly LABEL_LIMIT = 80;

    public static readonly CUSTOM_ID_LIMIT = 100;

    readonly #data: ButtonStructure;

    readonly #DEFAULT_DATA: ButtonStructure = {
        type: ComponentTypes.Button,
        style: ButtonStyles.Primary,
    };

    public constructor(data?: ButtonStructure) {
        this.#data = this.#resolveButton(data ?? this.#DEFAULT_DATA);
    }

    public static create(data?: ButtonStructure): ButtonBuilder {
        return new ButtonBuilder(data);
    }

    public setStyle(style: ButtonStyles): this {
        if (!Object.values(ButtonStyles).includes(style)) {
            throw new Error(`Invalid button style: ${style}`);
        }

        this.#data.style = style;
        return this;
    }

    public setLabel(label: string): this {
        if (label.length > ButtonBuilder.LABEL_LIMIT) {
            throw new Error(`Button label must be less than or equal to ${ButtonBuilder.LABEL_LIMIT} characters`);
        }

        this.#data.label = label;
        return this;
    }

    public setEmoji(emoji: Pick<EmojiStructure, "animated" | "id" | "name">): this {
        this.#data.emoji = emoji;
        return this;
    }

    public setCustomId(customId: Snowflake): this {
        if (this.#data.style === ButtonStyles.Link || this.#data.sku_id) {
            throw new Error("Custom ID cannot be set for Link or Premium buttons");
        }

        if (customId.length > ButtonBuilder.CUSTOM_ID_LIMIT) {
            throw new Error(
                `Button custom id must be less than or equal to ${ButtonBuilder.CUSTOM_ID_LIMIT} characters`
            );
        }

        this.#data.custom_id = customId;
        return this;
    }

    public setSkuId(skuId: Snowflake): this {
        if (this.#data.custom_id || this.#data.label || this.#data.url || this.#data.emoji) {
            throw new Error("Premium buttons cannot have a custom_id, label, url, or emoji");
        }

        this.#data.sku_id = skuId;
        this.#data.style = ButtonStyles.Premium;
        return this;
    }

    public setUrl(url: string): this {
        if (this.#data.custom_id || this.#data.sku_id) {
            throw new Error("URL cannot be set for non-Link buttons");
        }

        this.#data.url = url;
        this.#data.style = ButtonStyles.Link;
        return this;
    }

    public setDisabled(disabled: boolean): this {
        this.#data.disabled = disabled;
        return this;
    }

    public toJSON(): Readonly<ButtonStructure> {
        return Object.freeze({ ...this.#data });
    }

    public toString(): string {
        return JSON.stringify(this.#data);
    }

    #resolveButton(data: ButtonStructure): ButtonStructure {
        if (data.label && data.label.length > ButtonBuilder.LABEL_LIMIT) {
            throw new Error(`Button label must be less than or equal to ${ButtonBuilder.LABEL_LIMIT} characters`);
        }

        if (data.custom_id && data.custom_id.length > ButtonBuilder.CUSTOM_ID_LIMIT) {
            throw new Error(
                `Button custom id must be less than or equal to ${ButtonBuilder.CUSTOM_ID_LIMIT} characters`
            );
        }

        if (data.style === ButtonStyles.Link) {
            if (data.custom_id) {
                throw new Error("Link buttons cannot have a custom_id");
            }

            if (!data.url) {
                throw new Error("Link buttons must have a url");
            }
        } else if (data.style === ButtonStyles.Premium) {
            if (data.custom_id || data.label || data.url || data.emoji) {
                throw new Error("Premium buttons cannot have a custom_id, label, url, or emoji");
            }

            if (!data.sku_id) {
                throw new Error("Premium buttons must have a sku_id");
            }
        } else {
            if (!data.custom_id) {
                throw new Error("Non-link and non-premium buttons must have a custom_id");
            }

            if (data.url) {
                throw new Error("Non-link buttons cannot have a url");
            }

            if (data.sku_id) {
                throw new Error("Non-premium buttons cannot have a sku_id");
            }
        }

        return data;
    }
}
