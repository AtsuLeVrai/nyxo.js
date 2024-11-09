import type { ButtonStructure, ButtonStyles, EmojiStructure, Snowflake } from "@nyxjs/core";

interface BaseButtonSchema<T extends ButtonStyles> {
    setData(data: Partial<ButtonStructure>): BaseButtonSchema<T>;
    setDisabled(disabled: boolean): BaseButtonSchema<T>;
    setEmoji(emoji: Pick<EmojiStructure, "animated" | "id" | "name">): BaseButtonSchema<T>;
    setLabel(label: string): BaseButtonSchema<T>;
    setStyle(style: T): BaseButtonSchema<T>;
    toJSON(): Readonly<Partial<ButtonStructure>>;
    toString(): string;
}

interface ButtonSchema
    extends BaseButtonSchema<
        ButtonStyles.Danger | ButtonStyles.Primary | ButtonStyles.Secondary | ButtonStyles.Success
    > {
    setCustomId(customId: Snowflake): ButtonSchema;
}

interface ButtonUrlSchema extends BaseButtonSchema<ButtonStyles.Link> {
    setUrl(url: string): ButtonUrlSchema;
}

interface ButtonPremiumSchema extends BaseButtonSchema<ButtonStyles.Premium> {
    setSkuId(skuId: Snowflake): ButtonPremiumSchema;
}

abstract class BaseButton<T extends ButtonStyles> implements BaseButtonSchema<T> {
    static readonly LABEL_LIMIT = 80;

    static readonly CUSTOM_ID_LIMIT = 100;

    protected data: Partial<ButtonStructure>;

    constructor(data: Partial<ButtonStructure> = {}) {
        this.data = data;
    }

    setStyle(style: T): this {
        this.data.style = style;
        return this;
    }

    setLabel(label: string): this {
        this.data.label = label;
        return this;
    }

    setEmoji(emoji: Pick<EmojiStructure, "animated" | "id" | "name">): this {
        this.data.emoji = emoji;
        return this;
    }

    setDisabled(disabled: boolean): this {
        this.data.disabled = disabled;
        return this;
    }

    setData(data: Partial<ButtonStructure>): this {
        Object.assign(this.data, data);
        return this;
    }

    toJSON(): Readonly<Partial<ButtonStructure>> {
        if (!this.#validate()) {
            return Object.freeze({});
        }

        return Object.freeze({ ...this.data });
    }

    toString(): string {
        return JSON.stringify(this.toJSON());
    }

    #validate(): boolean {
        try {
            if (this.data.label && this.data.label.length > BaseButton.LABEL_LIMIT) {
                throw new Error(`Label exceeds ${BaseButton.LABEL_LIMIT} characters`);
            }

            if (this.data.custom_id && this.data.custom_id.length > BaseButton.CUSTOM_ID_LIMIT) {
                throw new Error(`Custom ID exceeds ${BaseButton.CUSTOM_ID_LIMIT} characters`);
            }

            if (this.data.url && !this.#isUrlValid(this.data.url)) {
                throw new Error("Invalid URL");
            }

            return true;
        } catch {
            return false;
        }
    }

    #isUrlValid(url: string): boolean {
        try {
            return URL.parse(url) !== null;
        } catch {
            return false;
        }
    }
}

export class ButtonBuilder
    extends BaseButton<ButtonStyles.Danger | ButtonStyles.Primary | ButtonStyles.Secondary | ButtonStyles.Success>
    implements ButtonSchema
{
    setCustomId(customId: Snowflake): this {
        this.data.custom_id = customId;
        return this;
    }
}

export class ButtonUrlBuilder extends BaseButton<ButtonStyles.Link> implements ButtonUrlSchema {
    setUrl(url: string): this {
        this.data.url = url;
        return this;
    }
}

export class ButtonPremiumBuilder extends BaseButton<ButtonStyles.Premium> implements ButtonPremiumSchema {
    setSkuId(skuId: Snowflake): this {
        this.data.sku_id = skuId;
        return this;
    }
}

export type ButtonResolvable = ButtonBuilder | ButtonPremiumBuilder | ButtonUrlBuilder;
