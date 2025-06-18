import {
  type ButtonEntity,
  ButtonStyle,
  ComponentType,
  type EmojiResolvable,
  resolveEmoji,
  type Snowflake,
} from "@nyxojs/core";

/**
 * A builder for creating Discord button components.
 *
 * This class follows the builder pattern to create fully-featured button components
 * for Discord messages. Buttons can be used to create interactive elements that users
 * can click to trigger actions or navigate to URLs.
 */
export class ButtonBuilder {
  /** The internal button data being constructed */
  readonly #data: Partial<ButtonEntity> = {
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
  };

  /**
   * Creates a new ButtonBuilder instance.
   *
   * @param data - Optional initial data to populate the button with
   */
  constructor(data?: ButtonEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new ButtonBuilder from existing button data.
   *
   * @param data - The button data to use
   * @returns A new ButtonBuilder instance with the provided data
   */
  static from(data: ButtonEntity): ButtonBuilder {
    return new ButtonBuilder(data);
  }

  /**
   * Sets the style of the button.
   *
   * @param style - The style of the button
   * @returns The button builder instance for method chaining
   */
  setStyle(style: ButtonStyle): this {
    this.#data.style = style;
    return this;
  }

  /**
   * Sets the label text of the button.
   *
   * @param label - The label to set (max 80 characters)
   * @returns The button builder instance for method chaining
   */
  setLabel(label: string): this {
    this.#data.label = label;
    return this;
  }

  /**
   * Sets the emoji for the button.
   *
   * @param emoji - The emoji to display on the button
   * @returns The button builder instance for method chaining
   */
  setEmoji(emoji: EmojiResolvable): this {
    this.#data.emoji = resolveEmoji(emoji);
    return this;
  }

  /**
   * Sets the custom ID of the button.
   * Required for all button styles except Link and Premium.
   *
   * @param customId - The custom ID to set (max 100 characters)
   * @returns The button builder instance for method chaining
   */
  setCustomId(customId: string): this {
    this.#data.custom_id = customId;
    return this;
  }

  /**
   * Sets the URL of the button.
   * Required for Link style buttons.
   *
   * @param url - The URL to set
   * @returns The button builder instance for method chaining
   */
  setUrl(url: string): this {
    this.#data.url = url;
    return this;
  }

  /**
   * Sets the SKU ID for a premium button.
   * Required for Premium style buttons.
   *
   * @param skuId - The SKU ID to set
   * @returns The button builder instance for method chaining
   */
  setSkuId(skuId: Snowflake): this {
    this.#data.sku_id = skuId;
    return this;
  }

  /**
   * Sets whether the button is disabled.
   *
   * @param disabled - Whether the button should be disabled
   * @returns The button builder instance for method chaining
   */
  setDisabled(disabled = true): this {
    this.#data.disabled = disabled;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The button builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Builds the final button entity object.
   *
   * @returns The complete button entity ready to be used in an action row
   */
  build(): ButtonEntity {
    return this.#data as ButtonEntity;
  }

  /**
   * Converts the button data to an immutable object.
   *
   * @returns A read-only copy of the button data
   */
  toJson(): Readonly<ButtonEntity> {
    return Object.freeze({ ...this.#data }) as ButtonEntity;
  }
}
