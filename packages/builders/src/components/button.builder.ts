import {
  type ButtonEntity,
  ButtonStyle,
  ComponentType,
  type EmojiResolvable,
  type Snowflake,
  resolveEmoji,
} from "@nyxojs/core";
import { z } from "zod/v4";
import { ButtonEmojiSchema, ButtonSchema } from "../schemas/index.js";

/**
 * A builder for creating Discord button components.
 *
 * This class follows the builder pattern to create fully-featured button components
 * with validation through Zod schemas to ensure all elements meet Discord's requirements.
 *
 * Buttons can be used in messages to create interactive elements that users can click
 * to trigger actions or navigate to URLs.
 */
export class ButtonBuilder {
  /** The internal button data being constructed */
  readonly #data: z.input<typeof ButtonSchema> = {
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
  };

  /**
   * Creates a new ButtonBuilder instance.
   *
   * @param data - Optional initial data to populate the button with
   */
  constructor(data?: z.input<typeof ButtonSchema>) {
    if (data) {
      // Validate the initial data
      const result = ButtonSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new ButtonBuilder from existing button data.
   *
   * @param data - The button data to use
   * @returns A new ButtonBuilder instance with the provided data
   */
  static from(data: z.input<typeof ButtonSchema>): ButtonBuilder {
    return new ButtonBuilder(data);
  }

  /**
   * Sets the style of the button.
   *
   * @param style - The style of the button
   * @returns The button builder instance for method chaining
   */
  setStyle(style: ButtonStyle): this {
    const result = ButtonSchema.shape.style.safeParse(style);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.style = result.data;
    return this;
  }

  /**
   * Sets the label text of the button.
   *
   * @param label - The label to set (max 80 characters)
   * @returns The button builder instance for method chaining
   */
  setLabel(label: string): this {
    const result = ButtonSchema.shape.label.safeParse(label);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.label = result.data;
    return this;
  }

  /**
   * Sets the emoji for the button.
   *
   * @param emoji - The emoji to display on the button
   * @returns The button builder instance for method chaining
   */
  setEmoji(emoji: EmojiResolvable): this {
    const result = ButtonEmojiSchema.safeParse(resolveEmoji(emoji));
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.emoji = result.data;
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
    const result = ButtonSchema.shape.custom_id.safeParse(customId);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.custom_id = result.data;
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
    const result = ButtonSchema.shape.url.safeParse(url);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.url = result.data;
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
    const result = ButtonSchema.shape.sku_id.safeParse(skuId);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.sku_id = result.data;
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
    const result = ButtonSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
    return this;
  }

  /**
   * Builds the final button entity object.
   *
   * @returns The complete button entity ready to be used in an action row
   * @throws Error if the button configuration is invalid
   */
  build(): ButtonEntity {
    // Validate the entire button
    const result = ButtonSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the button.
   *
   * @returns A read-only copy of the button data
   */
  toJson(): Readonly<z.input<typeof ButtonSchema>> {
    return Object.freeze({ ...this.#data });
  }
}
