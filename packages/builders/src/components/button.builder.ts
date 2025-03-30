import type { Snowflake } from "@nyxjs/core";
import {
  type ButtonEntity,
  ButtonStyle,
  ComponentType,
  type EmojiEntity,
} from "@nyxjs/core";
import { ComponentBuilder } from "./component.builder.js";

/**
 * Builder for creating button components.
 *
 * @example
 * ```typescript
 * const button = new ButtonBuilder()
 *   .setStyle(ButtonStyle.Primary)
 *   .setLabel('Click me')
 *   .setCustomId('my_button')
 *   .build();
 * ```
 */
export class ButtonBuilder extends ComponentBuilder<
  ButtonEntity,
  ButtonBuilder
> {
  /**
   * Creates a new ButtonBuilder instance.
   *
   * @param data Optional initial button data
   */
  constructor(data: Partial<ButtonEntity> = {}) {
    super({
      type: ComponentType.Button,
      ...data,
    });
  }

  protected get self(): ButtonBuilder {
    return this;
  }

  /**
   * Creates a new link button.
   *
   * @param url The URL to link to
   * @param label Optional label text to display
   * @returns A new ButtonBuilder instance for a link button
   */
  static link(url: string, label?: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setUrl(url)
      .setLabel(label || url);
  }

  /**
   * Creates a new primary (blurple) button.
   *
   * @param customId The custom ID for the button
   * @param label Optional label text to display
   * @returns A new ButtonBuilder instance for a primary button
   */
  static primary(customId: string, label?: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId(customId)
      .setLabel(label || customId);
  }

  /**
   * Creates a new secondary (grey) button.
   *
   * @param customId The custom ID for the button
   * @param label Optional label text to display
   * @returns A new ButtonBuilder instance for a secondary button
   */
  static secondary(customId: string, label?: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setCustomId(customId)
      .setLabel(label || customId);
  }

  /**
   * Creates a new success (green) button.
   *
   * @param customId The custom ID for the button
   * @param label Optional label text to display
   * @returns A new ButtonBuilder instance for a success button
   */
  static success(customId: string, label?: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setCustomId(customId)
      .setLabel(label || customId);
  }

  /**
   * Creates a new danger (red) button.
   *
   * @param customId The custom ID for the button
   * @param label Optional label text to display
   * @returns A new ButtonBuilder instance for a danger button
   */
  static danger(customId: string, label?: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId(customId)
      .setLabel(label || customId);
  }

  /**
   * Creates a new ButtonBuilder from an existing button entity.
   *
   * @param button The button entity to use as a base
   * @returns A new ButtonBuilder instance
   */
  static from(button: ButtonEntity | Partial<ButtonEntity>): ButtonBuilder {
    return new ButtonBuilder(button);
  }

  /**
   * Sets the style of the button.
   *
   * @param style The button style to use
   * @returns This builder instance, for method chaining
   */
  setStyle(style: ButtonStyle): this {
    this.data.style = style;
    return this;
  }

  /**
   * Sets the label text of the button.
   *
   * @param label The label text to set (max 80 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If label exceeds 80 characters
   */
  setLabel(label: string): this {
    if (label.length > 80) {
      throw new Error("Button label cannot exceed 80 characters");
    }
    this.data.label = label;
    return this;
  }

  /**
   * Sets the custom ID of the button.
   * Required for all button styles except LINK.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If customId exceeds 100 characters
   */
  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Button custom ID cannot exceed 100 characters");
    }
    this.data.custom_id = customId;
    return this;
  }

  /**
   * Sets the URL of the button.
   * Required for LINK style buttons.
   *
   * @param url The URL to set
   * @returns This builder instance, for method chaining
   */
  setUrl(url: string): this {
    this.data.url = url;
    return this;
  }

  /**
   * Sets the SKU ID for premium purchase buttons.
   *
   * @param skuId The premium SKU ID to use
   * @returns This builder instance, for method chaining
   */
  setSkuId(skuId: Snowflake): this {
    this.data.sku_id = skuId;
    return this;
  }

  /**
   * Sets the emoji for the button.
   *
   * @param emoji The emoji to use (can be a partial emoji object or string)
   * @returns This builder instance, for method chaining
   */
  setEmoji(emoji: Pick<EmojiEntity, "id" | "name" | "animated">): this {
    this.data.emoji = emoji;
    return this;
  }

  /**
   * Sets whether the button is disabled.
   *
   * @param disabled Whether the button should be disabled
   * @returns This builder instance, for method chaining
   */
  setDisabled(disabled = true): this {
    this.data.disabled = disabled;
    return this;
  }

  /**
   * Builds and returns the final button object.
   *
   * @returns The constructed button entity
   * @throws Error If required properties are missing based on button style
   */
  build(): ButtonEntity {
    // Validate based on style
    if (this.data.style === ButtonStyle.Link) {
      if (!this.data.url) {
        throw new Error("Link buttons must have a URL");
      }
    } else if (this.data.style === ButtonStyle.Premium) {
      if (!this.data.sku_id) {
        throw new Error("Premium buttons must have a SKU ID");
      }
    } else if (!this.data.custom_id) {
      throw new Error("Non-link buttons must have a custom ID");
    }

    // Ensure required properties
    if (!this.data.style) {
      throw new Error("Button must have a style");
    }

    if (!(this.data.label || this.data.emoji)) {
      throw new Error("Button must have a label or emoji");
    }

    return this.data as ButtonEntity;
  }
}
