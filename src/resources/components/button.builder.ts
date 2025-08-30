import { BaseBuilder } from "../../bases/index.js";
import { type EmojiResolvable, resolveEmoji } from "../../utils/index.js";
import { type ButtonEntity, ButtonStyle, ComponentType } from "./components.entity.js";

/**
 * @description Professional builder for Discord button components with comprehensive validation.
 * Supports all button styles including premium buttons and proper Discord API compliance.
 * @see {@link https://discord.com/developers/docs/components/reference#button}
 */
export class ButtonBuilder extends BaseBuilder<ButtonEntity> {
  constructor(data?: Partial<ButtonEntity>) {
    super({
      type: ComponentType.Button,
      ...data,
    });
  }

  /**
   * @description Creates a button builder from existing data.
   * @param data - Existing button entity data
   * @returns New button builder instance
   */
  static from(data: ButtonEntity): ButtonBuilder {
    return new ButtonBuilder(data);
  }

  /**
   * @description Sets the button visual style and interaction behavior.
   * @param style - Button style (Primary, Secondary, Success, Danger, Link, Premium)
   * @returns This builder instance for method chaining
   * @throws {Error} When style conflicts with other properties
   */
  setStyle(style: ButtonStyle): this {
    this.validateStyleCompatibility(style);
    return this.set("style", style);
  }

  /**
   * @description Sets the button text label.
   * @param label - Button label text (max 80 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} When label is too long or used with premium style
   */
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

  /**
   * @description Sets the button emoji icon.
   * @param emoji - Emoji resolvable (unicode, custom emoji, or emoji object)
   * @returns This builder instance for method chaining
   */
  setEmoji(emoji: EmojiResolvable): this {
    return this.set("emoji", resolveEmoji(emoji));
  }

  /**
   * @description Sets the custom ID for interaction responses.
   * @param customId - Developer-defined identifier (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} When custom ID is too long or used with incompatible styles
   */
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

  /**
   * @description Sets the external URL for link buttons.
   * @param url - External URL (max 512 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} When URL is invalid or used with incompatible styles
   */
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

  /**
   * @description Sets the Discord SKU ID for premium purchase buttons.
   * @param skuId - Discord SKU identifier
   * @returns This builder instance for method chaining
   * @throws {Error} When used with incompatible styles
   */
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

  /**
   * @description Sets whether the button is disabled and non-interactive.
   * @param disabled - Whether button should be disabled (defaults to true)
   * @returns This builder instance for method chaining
   */
  setDisabled(disabled = true): this {
    return this.set("disabled", disabled);
  }

  /**
   * @description Sets the unique component identifier within the message.
   * @param id - Component identifier
   * @returns This builder instance for method chaining
   */
  setId(id: number): this {
    return this.set("id", id);
  }

  /**
   * @description Creates a primary action button (blurple color).
   * @param customId - Developer-defined identifier
   * @param label - Button label text
   * @returns This builder instance for method chaining
   */
  setPrimary(customId: string, label?: string): this {
    this.setStyle(ButtonStyle.Primary).setCustomId(customId);
    if (label) this.setLabel(label);
    return this;
  }

  /**
   * @description Creates a secondary action button (gray color).
   * @param customId - Developer-defined identifier
   * @param label - Button label text
   * @returns This builder instance for method chaining
   */
  setSecondary(customId: string, label?: string): this {
    this.setStyle(ButtonStyle.Secondary).setCustomId(customId);
    if (label) this.setLabel(label);
    return this;
  }

  /**
   * @description Creates a success confirmation button (green color).
   * @param customId - Developer-defined identifier
   * @param label - Button label text
   * @returns This builder instance for method chaining
   */
  setSuccess(customId: string, label?: string): this {
    this.setStyle(ButtonStyle.Success).setCustomId(customId);
    if (label) this.setLabel(label);
    return this;
  }

  /**
   * @description Creates a dangerous action button (red color).
   * @param customId - Developer-defined identifier
   * @param label - Button label text
   * @returns This builder instance for method chaining
   */
  setDanger(customId: string, label?: string): this {
    this.setStyle(ButtonStyle.Danger).setCustomId(customId);
    if (label) this.setLabel(label);
    return this;
  }

  /**
   * @description Creates an external link button (gray color, no interaction).
   * @param url - External URL to link to
   * @param label - Button label text
   * @returns This builder instance for method chaining
   */
  setLink(url: string, label?: string): this {
    this.setStyle(ButtonStyle.Link).setUrl(url);
    if (label) this.setLabel(label);
    return this;
  }

  /**
   * @description Creates a premium purchase button (Discord handles the interaction).
   * @param skuId - Discord SKU identifier
   * @returns This builder instance for method chaining
   */
  setPremium(skuId: string): this {
    this.setStyle(ButtonStyle.Premium).setSkuId(skuId);
    return this;
  }

  /**
   * @description Validates button data before building.
   * @throws {Error} When button configuration is invalid
   */
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

  /**
   * @description Validates style compatibility with existing properties.
   * @param style - Button style to validate
   * @throws {Error} When style conflicts with existing properties
   */
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
