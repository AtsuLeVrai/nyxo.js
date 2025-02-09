import {
  ButtonEntity,
  ButtonStyle,
  ComponentType,
  type EmojiEntity,
} from "@nyxjs/core";
import { z } from "zod";

export class ButtonBuilder {
  readonly #data: Partial<z.input<typeof ButtonEntity>>;

  constructor(data: Partial<z.input<typeof ButtonEntity>> = {}) {
    this.#data = {
      type: ComponentType.Button,
      style: ButtonStyle.Primary,
      disabled: false,
      ...data,
    };
  }

  static from(data: z.input<typeof ButtonEntity>): ButtonBuilder {
    return new ButtonBuilder(data);
  }

  setStyle(style: ButtonStyle): this {
    this.#data.style = style;
    return this;
  }

  setPrimary(): this {
    return this.setStyle(ButtonStyle.Primary);
  }

  setSecondary(): this {
    return this.setStyle(ButtonStyle.Secondary);
  }

  setSuccess(): this {
    return this.setStyle(ButtonStyle.Success);
  }

  setDanger(): this {
    return this.setStyle(ButtonStyle.Danger);
  }

  setLink(): this {
    return this.setStyle(ButtonStyle.Link);
  }

  setPremium(): this {
    return this.setStyle(ButtonStyle.Premium);
  }

  setCustomId(customId: string): this {
    this.#data.custom_id = customId;
    return this;
  }

  setUrl(url: string): this {
    this.#data.url = url;
    return this;
  }

  setSkuId(skuId: string): this {
    this.#data.sku_id = skuId;
    return this;
  }

  setLabel(label: string): this {
    this.#data.label = label;
    return this;
  }

  setEmoji(
    emoji: Pick<z.input<typeof EmojiEntity>, "id" | "name" | "animated">,
  ): this {
    this.#data.emoji = emoji;
    return this;
  }

  setDisabled(disabled = true): this {
    this.#data.disabled = disabled;
    return this;
  }

  toJson(): ButtonEntity {
    return ButtonEntity.parse(this.#data);
  }
}

export const ButtonBuilderSchema = z.instanceof(ButtonBuilder);
