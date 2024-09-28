import type { ButtonStructure, EmojiStructure, Snowflake } from "@nyxjs/core";
import { ButtonStyles } from "@nyxjs/core";
import { BaseBuilder } from "./BaseBuilder";

export const ButtonLimits = {
    LABEL: 80,
    CUSTOM_ID: 100,
};

export class ButtonBuilder<T extends ButtonStructure = ButtonStructure> extends BaseBuilder<T> {
    readonly #data: Partial<T>;

    public constructor(data: Partial<T> = {}) {
        super();
        this.#data = data;
    }

    public setCustomId(customId: Snowflake): this {
        this.validateLength(customId, ButtonLimits.CUSTOM_ID, "Custom ID");
        this.#data.custom_id = customId;
        return this;
    }

    public setDisabled(disabled: boolean): this {
        this.#data.disabled = disabled;
        return this;
    }

    public setEmoji(emoji: EmojiStructure): this {
        this.#data.emoji = emoji;
        return this;
    }

    public setLabel(label: string): this {
        this.validateLength(label, ButtonLimits.LABEL, "Label");
        this.#data.label = label;
        return this;
    }

    public setSkuId(skuId: Snowflake): this {
        if (this.#data.style !== ButtonStyles.Premium) {
            throw new Error("SKU ID can only be set for a premium button.");
        }

        this.#data.sku_id = skuId;
        return this;
    }

    public setStyle(style: ButtonStyles): this {
        this.#data.style = style;
        return this;
    }

    public setUrl(url: string): this {
        if (this.#data.style !== ButtonStyles.Link) {
            throw new Error("URL can only be set for a link button.");
        }

        this.#data.url = url;
        return this;
    }

    public toJSON(): T {
        return this.#data as T;
    }
}
