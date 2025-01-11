import { ButtonEntity, type ButtonStyle, type EmojiEntity } from "@nyxjs/core";
import type { z } from "zod";
import { fromError } from "zod-validation-error";

export class ButtonBuilder {
  readonly #data: z.input<typeof ButtonEntity> = {};

  constructor(data: z.input<typeof ButtonEntity> = {}) {
    this.#data = data;
  }

  setCustomId(customId: string): this {
    this.#data.custom_id = customId;
    return this;
  }

  setStyle(style: ButtonStyle): this {
    this.#data.style = style;
    return this;
  }

  setLabel(label: string): this {
    this.#data.label = label;
    return this;
  }

  setEmoji(options: Pick<EmojiEntity, "name" | "id" | "animated">): this {
    this.#data.emoji = options;
    return this;
  }

  setSkuId(skuId: string): this {
    this.#data.sku_id = skuId;
    return this;
  }

  setUrl(url: string | URL): this {
    this.#data.url = url instanceof URL ? url.toString() : url;
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.#data.disabled = disabled;
    return this;
  }

  toJson(): z.output<typeof ButtonEntity> {
    try {
      return ButtonEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }
}
