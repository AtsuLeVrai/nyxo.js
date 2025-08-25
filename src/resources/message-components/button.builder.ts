import { type EmojiResolvable, resolveEmoji } from "../../utils/index.js";
import { type ButtonEntity, ButtonStyle, ComponentType } from "./message-components.entity.js";

export class ButtonBuilder {
  readonly #data: Partial<ButtonEntity> = {
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
  };
  constructor(data?: ButtonEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: ButtonEntity): ButtonBuilder {
    return new ButtonBuilder(data);
  }
  setStyle(style: ButtonStyle): this {
    this.#data.style = style;
    return this;
  }
  setLabel(label: string): this {
    this.#data.label = label;
    return this;
  }
  setEmoji(emoji: EmojiResolvable): this {
    this.#data.emoji = resolveEmoji(emoji);
    return this;
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
  setDisabled(disabled = true): this {
    this.#data.disabled = disabled;
    return this;
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): ButtonEntity {
    return this.#data as ButtonEntity;
  }
  toJson(): Readonly<ButtonEntity> {
    return Object.freeze({ ...this.#data }) as ButtonEntity;
  }
}
