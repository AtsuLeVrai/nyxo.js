import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ButtonEntity,
  ButtonStyle,
  ComponentType,
  EmojiEntity,
} from "../entities/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * A builder class for creating and validating Discord message buttons.
 *
 * This builder provides a fluent interface for constructing buttons with proper validation
 * using Zod schemas. It ensures that all button properties conform to Discord's requirements
 * and constraints.
 *
 * @example
 * ```typescript
 * // Primary button with custom ID
 * const button = new ButtonBuilder()
 *   .setCustomId("click_me")
 *   .setLabel("Click me!")
 *   .setStyle(ButtonStyle.Primary)
 *   .build();
 *
 * // Link button
 * const linkButton = new ButtonBuilder()
 *   .setURL("https://discord.com")
 *   .setLabel("Visit Discord")
 *   .setStyle(ButtonStyle.Link)
 *   .build();
 * ```
 */
export class ButtonBuilder {
  /** Internal data object representing the button being built */
  readonly #data: z.input<typeof ButtonEntity> = {
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
  };

  /**
   * Creates a new ButtonBuilder instance.
   *
   * @param data Optional initial data to populate the button
   */
  constructor(data?: Partial<z.input<typeof ButtonEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new ButtonBuilder from an existing button object.
   *
   * @param button The button object to copy from
   * @returns A new ButtonBuilder instance
   */
  static from(button: z.input<typeof ButtonEntity>): ButtonBuilder {
    return new ButtonBuilder(button);
  }

  /**
   * Creates a link button with the specified URL and label.
   *
   * @param url The URL the button should link to
   * @param label The label for the button
   * @returns A new ButtonBuilder configured as a link button
   */
  static link(url: string, label: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setUrl(url)
      .setLabel(label);
  }

  /**
   * Creates a primary (blurple) button with the specified custom ID and label.
   *
   * @param customId The custom ID for the button
   * @param label The label for the button
   * @returns A new ButtonBuilder configured as a primary button
   */
  static primary(customId: string, label: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId(customId)
      .setLabel(label);
  }

  /**
   * Creates a secondary (gray) button with the specified custom ID and label.
   *
   * @param customId The custom ID for the button
   * @param label The label for the button
   * @returns A new ButtonBuilder configured as a secondary button
   */
  static secondary(customId: string, label: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setCustomId(customId)
      .setLabel(label);
  }

  /**
   * Creates a success (green) button with the specified custom ID and label.
   *
   * @param customId The custom ID for the button
   * @param label The label for the button
   * @returns A new ButtonBuilder configured as a success button
   */
  static success(customId: string, label: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setCustomId(customId)
      .setLabel(label);
  }

  /**
   * Creates a danger (red) button with the specified custom ID and label.
   *
   * @param customId The custom ID for the button
   * @param label The label for the button
   * @returns A new ButtonBuilder configured as a danger button
   */
  static danger(customId: string, label: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setCustomId(customId)
      .setLabel(label);
  }

  /**
   * Creates a premium subscription button with the specified SKU ID and label.
   *
   * @param skuId The SKU ID for the premium offering
   * @param label The label for the button
   * @returns A new ButtonBuilder configured as a premium button
   */
  static premium(skuId: Snowflake, label: string): ButtonBuilder {
    return new ButtonBuilder()
      .setStyle(ButtonStyle.Premium)
      .setSkuId(skuId)
      .setLabel(label);
  }

  /**
   * Sets the custom ID of the button. Required for all button styles except Link.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the custom ID is invalid or if setting for a Link button
   */
  setCustomId(customId: string): this {
    try {
      if (this.#data.style === ButtonStyle.Link) {
        throw new Error("Link buttons cannot have a custom ID");
      }
      if (this.#data.style === ButtonStyle.Premium) {
        throw new Error("Premium buttons cannot have a custom ID");
      }

      this.#data.custom_id = ButtonEntity.shape.custom_id.parse(customId);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the URL of the button. Only valid for Link buttons.
   *
   * @param url The URL to set
   * @returns This builder instance for method chaining
   * @throws {Error} If the URL is invalid or if setting for a non-Link button
   */
  setUrl(url: string): this {
    try {
      if (this.#data.style !== ButtonStyle.Link) {
        throw new Error("URL can only be set for Link buttons");
      }

      this.#data.url = ButtonEntity.shape.url.parse(url);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the SKU ID for the button. Only valid for Premium buttons.
   *
   * @param skuId The SKU ID to set
   * @returns This builder instance for method chaining
   * @throws {Error} If setting for a non-Premium button
   */
  setSkuId(skuId: Snowflake): this {
    try {
      if (this.#data.style !== ButtonStyle.Premium) {
        throw new Error("SKU ID can only be set for Premium buttons");
      }

      this.#data.sku_id = skuId;
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the label of the button.
   *
   * @param label The label to set (max 80 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the label is invalid
   */
  setLabel(label: string): this {
    try {
      this.#data.label = ButtonEntity.shape.label.parse(label);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the emoji of the button.
   *
   * @param emoji The emoji object or emoji identifier
   * @returns This builder instance for method chaining
   * @throws {Error} If the emoji is invalid
   */
  setEmoji(
    emoji:
      | z.input<typeof EmojiEntity>
      | { id?: string; name?: string; animated?: boolean },
  ): this {
    try {
      // Create a partial emoji object with just the needed fields
      const partialEmoji = {
        id: emoji.id,
        name: emoji.name,
        animated: emoji.animated,
      };

      this.#data.emoji = EmojiEntity.pick({
        id: true,
        name: true,
        animated: true,
      }).parse(partialEmoji);

      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the style of the button.
   *
   * @param style The button style to set
   * @returns This builder instance for method chaining
   * @throws {Error} If the style is invalid
   */
  setStyle(style: ButtonStyle): this {
    try {
      this.#data.style = ButtonEntity.shape.style.parse(style);

      // Clear conflicting fields based on style
      if (style === ButtonStyle.Link) {
        delete this.#data.custom_id;
        delete this.#data.sku_id;
      } else if (style === ButtonStyle.Premium) {
        delete this.#data.custom_id;
        delete this.#data.url;
      } else {
        delete this.#data.url;
        delete this.#data.sku_id;
      }

      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets whether the button is disabled.
   *
   * @param disabled Whether the button should be disabled
   * @returns This builder instance for method chaining
   */
  setDisabled(disabled: boolean): this {
    this.#data.disabled = ButtonEntity.shape.disabled.parse(disabled);
    return this;
  }

  /**
   * Validates and builds the final button object.
   *
   * @returns The validated button object ready to be sent to Discord
   * @throws {Error} If the button fails validation
   */
  build(): ButtonEntity {
    try {
      return ButtonEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this ButtonBuilder.
   *
   * @returns A new ButtonBuilder instance with the same data
   */
  clone(): ButtonBuilder {
    return new ButtonBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the button data.
   *
   * @returns The button data as a JSON object
   */
  toJson(): ButtonEntity {
    return structuredClone(ButtonEntity.parse(this.#data));
  }

  /**
   * Checks if the button has the required fields based on its style.
   *
   * @returns True if the button has all required fields, false otherwise
   */
  hasRequiredFields(): boolean {
    if (this.#data.style === ButtonStyle.Link && !this.#data.url) {
      return false;
    }

    if (this.#data.style === ButtonStyle.Premium && !this.#data.sku_id) {
      return false;
    }

    if (
      this.#data.style !== ButtonStyle.Link &&
      this.#data.style !== ButtonStyle.Premium &&
      !this.#data.custom_id
    ) {
      return false;
    }

    return true;
  }

  /**
   * Checks if the button is valid according to Discord's requirements.
   *
   * @returns True if the button is valid, false otherwise
   */
  isValid(): boolean {
    return ButtonEntity.safeParse(this.#data).success;
  }
}
