import type { ButtonStructure } from "@nyxjs/core";
import { ButtonStyles, ComponentTypes } from "@nyxjs/core";
import { ButtonLimits } from "../libs/Limits";

const DEFAULT_VALUES: ButtonStructure = {
    style: ButtonStyles.Secondary,
    type: ComponentTypes.Button,
};

export class ButtonBuilder {
    private readonly data: ButtonStructure;

    public constructor(data: Partial<ButtonStructure> = {}) {
        this.data = { ...DEFAULT_VALUES, ...data };
    }

    public static from(data?: Partial<ButtonStructure>): ButtonBuilder {
        return new ButtonBuilder(data);
    }

    public setStyle(style: ButtonStyles): this {
        this.data.style = style;
        return this;
    }

    public setLabel(label: string): this {
        this.validateLength(label, ButtonLimits.Label, `Label exceeds the maximum length of ${ButtonLimits.Label}`);
        this.data.label = label;
        return this;
    }

    public setEmoji(emoji: ButtonStructure["emoji"]): this {
        this.data.emoji = emoji;
        return this;
    }

    public setCustomId(customId: string): this {
        this.validateLength(
            customId,
            ButtonLimits.CustomId,
            `CustomId exceeds the maximum length of ${ButtonLimits.CustomId}`
        );
        this.data.custom_id = customId;
        return this;
    }

    public setSkuId(skuId: string): this {
        this.data.sku_id = skuId;
        return this;
    }

    public setUrl(url: string): this {
        this.data.url = url;
        return this;
    }

    public setDisabled(disabled: boolean): this {
        this.data.disabled = disabled;
        return this;
    }

    public toJSON(): ButtonStructure {
        return this.data;
    }

    private validateLength(value: string, limit: number, errorMessage: string): void {
        if (value.length > limit) {
            throw new Error(errorMessage);
        }
    }
}
