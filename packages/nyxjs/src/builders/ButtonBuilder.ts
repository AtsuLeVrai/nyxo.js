import type { ButtonStructure } from "@nyxjs/core";
import { ButtonStyles, ComponentTypes } from "@nyxjs/core";
import { ButtonLimits } from "../libs/Limits";

const DEFAULT_VALUES: ButtonStructure = {
    style: ButtonStyles.Secondary,
    type: ComponentTypes.Button,
};

export class ButtonBuilder {
    public constructor(public data: ButtonStructure = DEFAULT_VALUES) {}

    public static from(data?: ButtonStructure): ButtonBuilder {
        return new ButtonBuilder(data);
    }

    public setStyle(style: ButtonStyles): this {
        this.data.style = style;
        return this;
    }

    public setLabel(label: string): this {
        if (ButtonLimits.Label < label.length) {
            throw new Error(`Label exceeds the maximum length of ${ButtonLimits.Label}`);
        }

        this.data.label = label;
        return this;
    }

    public setEmoji(emoji: ButtonStructure["emoji"]): this {
        this.data.emoji = emoji;
        return this;
    }

    public setCustomId(customId: string): this {
        if (ButtonLimits.CustomId < customId.length) {
            throw new Error(`CustomId exceeds the maximum length of ${ButtonLimits.CustomId}`);
        }

        this.data.custom_id = customId;
        return this;
    }

    public setSkuId(skuId: string) {
        this.data.sku_id = skuId;
        return this as any;
    }

    public setUrl(url: string) {
        this.data.url = url;
        return this as any;
    }

    public setDisabled(disabled: boolean): this {
        this.data.disabled = disabled;
        return this;
    }
}
