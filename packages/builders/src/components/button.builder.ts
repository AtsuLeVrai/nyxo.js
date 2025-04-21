import {
  type ButtonEntity,
  ButtonStyle,
  ComponentType,
  type EmojiEntity,
  type Snowflake,
} from "@nyxojs/core";
import { COMPONENT_LIMITS } from "../utils/index.js";

/**
 * Builder for button components.
 *
 * Buttons are interactive elements that users can click to trigger an interaction.
 * There are different styles of buttons available, including link buttons that
 * navigate to URLs instead of sending interactions.
 *
 * @example
 * ```typescript
 * // Create a primary button
 * const button = new ButtonBuilder()
 *   .setLabel('Click Me')
 *   .setStyle(ButtonStyle.Primary)
 *   .setCustomId('my_button')
 *   .build();
 *
 * // Create a link button
 * const linkButton = new ButtonBuilder()
 *   .setLabel('Visit Website')
 *   .setStyle(ButtonStyle.Link)
 *   .setURL('https://discord.com')
 *   .build();
 * ```
 */
export class ButtonBuilder {
  /** The internal button data being constructed */
  readonly #data: Partial<ButtonEntity> = {
    type: ComponentType.Button,
  };

  /**
   * Creates a new ButtonBuilder instance.
   *
   * @param data - Optional initial data to populate the button with
   */
  constructor(data?: Partial<ButtonEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.Button, // Ensure type is set correctly
      };
    }
  }

  /**
   * Creates a new ButtonBuilder from existing button data.
   *
   * @param data - The button data to use
   * @returns A new ButtonBuilder instance with the provided data
   *
   * @example
   * ```typescript
   * const buttonData = {
   *   type: ComponentType.Button,
   *   label: 'Existing Button',
   *   style: ButtonStyle.Primary,
   *   custom_id: 'existing_button'
   * };
   * const builder = ButtonBuilder.from(buttonData);
   * ```
   */
  static from(data: Partial<ButtonEntity>): ButtonBuilder {
    return new ButtonBuilder(data);
  }

  /**
   * Sets the style of the button.
   *
   * @param style - The button style to set
   * @returns The button builder instance for method chaining
   *
   * @example
   * ```typescript
   * new ButtonBuilder().setStyle(ButtonStyle.Success);
   * ```
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
   * @throws Error if label exceeds 80 characters
   *
   * @example
   * ```typescript
   * new ButtonBuilder().setLabel('Click Me');
   * ```
   */
  setLabel(label: string): this {
    if (label.length > COMPONENT_LIMITS.BUTTON_LABEL) {
      throw new Error(
        `Button label cannot exceed ${COMPONENT_LIMITS.BUTTON_LABEL} characters`,
      );
    }
    this.#data.label = label;
    return this;
  }

  /**
   * Sets the custom ID of the button.
   * Required for all button styles except Link.
   *
   * @param customId - The custom ID to set (max 100 characters)
   * @returns The button builder instance for method chaining
   * @throws Error if customId exceeds 100 characters
   *
   * @example
   * ```typescript
   * new ButtonBuilder().setCustomId('my_button_id');
   * ```
   */
  setCustomId(customId: string): this {
    if (customId.length > COMPONENT_LIMITS.CUSTOM_ID) {
      throw new Error(
        `Button custom ID cannot exceed ${COMPONENT_LIMITS.CUSTOM_ID} characters`,
      );
    }
    this.#data.custom_id = customId;
    return this;
  }

  /**
   * Sets the SKU ID for a premium button.
   * Required for ButtonStyle.Premium buttons.
   *
   * @param skuId - The SKU ID to set
   * @returns The button builder instance for method chaining
   *
   * @example
   * ```typescript
   * new ButtonBuilder()
   *   .setStyle(ButtonStyle.Premium)
   *   .setSkuId('1234567890123456');
   * ```
   */
  setSkuId(skuId: Snowflake): this {
    this.#data.sku_id = skuId;
    return this;
  }

  /**
   * Sets the URL of the button.
   * Required for Link style buttons.
   *
   * @param url - The URL to set
   * @returns The button builder instance for method chaining
   * @throws Error if URL is invalid
   *
   * @example
   * ```typescript
   * new ButtonBuilder()
   *   .setStyle(ButtonStyle.Link)
   *   .setURL('https://discord.com');
   * ```
   */
  setUrl(url: string): this {
    try {
      new URL(url);
    } catch {
      throw new Error("Invalid URL format");
    }

    this.#data.url = url;
    return this;
  }

  /**
   * Sets the emoji for the button.
   *
   * @param emoji - The emoji to display on the button
   * @returns The button builder instance for method chaining
   *
   * @example
   * ```typescript
   * // Unicode emoji
   * new ButtonBuilder().setEmoji({ name: '👍' });
   *
   * // Custom emoji
   * new ButtonBuilder().setEmoji({
   *   id: '123456789012345678',
   *   name: 'cool_emoji',
   *   animated: false
   * });
   * ```
   */
  setEmoji(emoji: Pick<EmojiEntity, "id" | "name" | "animated">): this {
    this.#data.emoji = emoji;
    return this;
  }

  /**
   * Sets whether the button is disabled.
   *
   * @param disabled - Whether the button should be disabled
   * @returns The button builder instance for method chaining
   *
   * @example
   * ```typescript
   * new ButtonBuilder().setDisabled(true);
   * ```
   */
  setDisabled(disabled = true): this {
    this.#data.disabled = disabled;
    return this;
  }

  /**
   * Builds the final button entity object.
   *
   * @returns The complete button entity ready to be used in an action row
   * @throws Error if the button configuration is invalid
   *
   * @example
   * ```typescript
   * const button = new ButtonBuilder()
   *   .setLabel('Click Me')
   *   .setStyle(ButtonStyle.Primary)
   *   .setCustomId('my_button')
   *   .build();
   * ```
   */
  build(): ButtonEntity {
    // Style is required for all buttons
    if (this.#data.style === undefined) {
      throw new Error("Button style is required");
    }

    // Link buttons require URL and shouldn't have custom_id
    if (this.#data.style === ButtonStyle.Link) {
      if (!this.#data.url) {
        throw new Error("Link buttons must have a URL");
      }
      if (this.#data.custom_id) {
        throw new Error("Link buttons cannot have a custom ID");
      }
      if (this.#data.sku_id) {
        throw new Error("Link buttons cannot have a SKU ID");
      }
    }
    // Premium buttons require sku_id and shouldn't have custom_id
    else if (this.#data.style === ButtonStyle.Premium) {
      if (!this.#data.sku_id) {
        throw new Error("Premium buttons must have a SKU ID");
      }
      if (this.#data.custom_id) {
        throw new Error("Premium buttons cannot have a custom ID");
      }
      if (this.#data.url) {
        throw new Error("Premium buttons cannot have a URL");
      }
      // Premium buttons shouldn't have label or emoji
      if (this.#data.label) {
        throw new Error("Premium buttons cannot have a label");
      }
      if (this.#data.emoji) {
        throw new Error("Premium buttons cannot have an emoji");
      }
    }
    // All other button styles require custom_id and shouldn't have url
    else {
      if (!this.#data.custom_id) {
        throw new Error("Interaction buttons must have a custom ID");
      }
      if (this.#data.url) {
        throw new Error("Interaction buttons cannot have a URL");
      }
      if (this.#data.sku_id) {
        throw new Error("Only Premium buttons can have a SKU ID");
      }
    }

    // Buttons should have either a label or an emoji or both (except Premium)
    if (
      this.#data.style !== ButtonStyle.Premium &&
      !this.#data.label &&
      !this.#data.emoji
    ) {
      throw new Error("Buttons must have either a label or an emoji or both");
    }

    return this.#data as ButtonEntity;
  }

  /**
   * Returns a JSON representation of the button.
   *
   * @returns A read-only copy of the button data
   */
  toJson(): Readonly<Partial<ButtonEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
