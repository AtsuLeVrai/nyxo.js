import { BaseBuilder } from "../../bases/index.js";
import { type EmojiResolvable, resolveEmoji } from "../../utils/index.js";
import { type ButtonEntity, ButtonStyle, ComponentType } from "./components.entity.js";

export class ButtonBuilder extends BaseBuilder<ButtonEntity> {
  constructor(data?: Partial<ButtonEntity>) {
    super({
      type: ComponentType.Button,
      ...data,
    });
  }

  static from(data: ButtonEntity): ButtonBuilder {
    return new ButtonBuilder(data);
  }

  setStyle(style: ButtonStyle): this {
    this.validateStyleCompatibility(style);
    return this.set("style", style);
  }

  setLabel(label: string): this {
    if (label.length > 80) {
      throw new Error("Button label cannot exceed 80 characters");
    }

    const currentStyle = this.get("style");
    if (currentStyle === ButtonStyle.Premium) {
      throw new Error("Premium buttons cannot have labels");
    }

    return this.set("label", label);
  }

  setEmoji(emoji: EmojiResolvable): this {
    return this.set("emoji", resolveEmoji(emoji));
  }

  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Custom ID cannot exceed 100 characters");
    }

    const currentStyle = this.get("style");
    if (currentStyle === ButtonStyle.Link) {
      throw new Error("Link buttons cannot have custom IDs (use URL instead)");
    }
    if (currentStyle === ButtonStyle.Premium) {
      throw new Error("Premium buttons cannot have custom IDs (use SKU ID instead)");
    }

    return this.set("custom_id", customId);
  }

  setUrl(url: string): this {
    if (url.length > 512) {
      throw new Error("Button URL cannot exceed 512 characters");
    }

    const currentStyle = this.get("style");
    if (currentStyle && currentStyle !== ButtonStyle.Link) {
      throw new Error("Only Link buttons can have URLs");
    }

    // Auto-set style to Link if not already set
    if (!currentStyle) {
      this.set("style", ButtonStyle.Link);
    }

    // Clear incompatible fields
    this.clear("custom_id");
    this.clear("sku_id");

    return this.set("url", url);
  }

  setSkuId(skuId: string): this {
    const currentStyle = this.get("style");
    if (currentStyle && currentStyle !== ButtonStyle.Premium) {
      throw new Error("Only Premium buttons can have SKU IDs");
    }

    // Auto-set style to Premium if not already set
    if (!currentStyle) {
      this.set("style", ButtonStyle.Premium);
    }

    // Clear incompatible fields
    this.clear("custom_id");
    this.clear("url");
    this.clear("label"); // Premium buttons cannot have labels

    return this.set("sku_id", skuId);
  }

  setDisabled(disabled = true): this {
    return this.set("disabled", disabled);
  }

  setId(id: number): this {
    return this.set("id", id);
  }

  setPrimary(customId: string, label?: string): this {
    this.setStyle(ButtonStyle.Primary).setCustomId(customId);
    if (label) this.setLabel(label);
    return this;
  }

  setSecondary(customId: string, label?: string): this {
    this.setStyle(ButtonStyle.Secondary).setCustomId(customId);
    if (label) this.setLabel(label);
    return this;
  }

  setSuccess(customId: string, label?: string): this {
    this.setStyle(ButtonStyle.Success).setCustomId(customId);
    if (label) this.setLabel(label);
    return this;
  }

  setDanger(customId: string, label?: string): this {
    this.setStyle(ButtonStyle.Danger).setCustomId(customId);
    if (label) this.setLabel(label);
    return this;
  }

  setLink(url: string, label?: string): this {
    this.setStyle(ButtonStyle.Link).setUrl(url);
    if (label) this.setLabel(label);
    return this;
  }

  setPremium(skuId: string): this {
    this.setStyle(ButtonStyle.Premium).setSkuId(skuId);
    return this;
  }

  protected validate(): void {
    const data = this.rawData;

    if (!data.style) {
      throw new Error("Button must have a style");
    }

    // Validate required fields based on style
    switch (data.style) {
      case ButtonStyle.Primary:
      case ButtonStyle.Secondary:
      case ButtonStyle.Success:
      case ButtonStyle.Danger:
        if (!data.custom_id) {
          throw new Error("Interactive buttons must have a custom_id");
        }
        break;
      case ButtonStyle.Link:
        if (!data.url) {
          throw new Error("Link buttons must have a URL");
        }
        break;
      case ButtonStyle.Premium:
        if (!data.sku_id) {
          throw new Error("Premium buttons must have a sku_id");
        }
        break;
    }

    // Validate button has content (label or emoji)
    if (!data.label && !data.emoji) {
      throw new Error("Button must have either a label or emoji");
    }
  }

  private validateStyleCompatibility(style: ButtonStyle): void {
    const currentCustomId = this.get("custom_id");
    const currentUrl = this.get("url");
    const currentSkuId = this.get("sku_id");
    const currentLabel = this.get("label");

    switch (style) {
      case ButtonStyle.Link:
        if (currentCustomId || currentSkuId) {
          throw new Error("Link buttons cannot have custom_id or sku_id");
        }
        break;
      case ButtonStyle.Premium:
        if (currentCustomId || currentUrl || currentLabel) {
          throw new Error("Premium buttons cannot have custom_id, url, or label");
        }
        break;
      default:
        if (currentUrl || currentSkuId) {
          throw new Error("Interactive buttons cannot have url or sku_id");
        }
        break;
    }
  }
}
