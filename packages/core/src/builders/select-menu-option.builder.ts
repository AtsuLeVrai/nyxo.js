import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { EmojiEntity, SelectMenuOptionEntity } from "../entities/index.js";

/**
 * A builder class for creating and validating Discord select menu options.
 *
 * This builder provides a fluent interface for constructing select menu options with proper validation
 * using Zod schemas. It ensures that all option properties conform to Discord's requirements
 * and constraints.
 *
 * @example
 * ```typescript
 * const option = new SelectMenuOptionBuilder()
 *   .setLabel("Option 1")
 *   .setValue("option_1")
 *   .setDescription("This is the first option")
 *   .setDefault(true)
 *   .build();
 * ```
 */
export class SelectMenuOptionBuilder {
  /** Internal data object representing the select menu option being built */
  readonly #data: z.input<typeof SelectMenuOptionEntity> = {
    label: "",
    value: "",
  };

  /**
   * Creates a new SelectMenuOptionBuilder instance.
   *
   * @param data Optional initial data to populate the select menu option
   */
  constructor(data?: Partial<z.input<typeof SelectMenuOptionEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new SelectMenuOptionBuilder from an existing select menu option object.
   *
   * @param option The select menu option object to copy from
   * @returns A new SelectMenuOptionBuilder instance
   */
  static from(
    option: z.input<typeof SelectMenuOptionEntity>,
  ): SelectMenuOptionBuilder {
    return new SelectMenuOptionBuilder(option);
  }

  /**
   * Sets the label of the select menu option.
   *
   * @param label The label to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the label is invalid
   */
  setLabel(label: string): this {
    try {
      this.#data.label = SelectMenuOptionEntity.shape.label.parse(label);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the value of the select menu option.
   *
   * @param value The value to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the value is invalid
   */
  setValue(value: string): this {
    try {
      this.#data.value = SelectMenuOptionEntity.shape.value.parse(value);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the description of the select menu option.
   *
   * @param description The description to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the description is invalid
   */
  setDescription(description: string): this {
    try {
      this.#data.description =
        SelectMenuOptionEntity.shape.description.parse(description);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the emoji of the select menu option.
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
   * Sets whether the select menu option is selected by default.
   *
   * @param defaultValue Whether the option should be selected by default
   * @returns This builder instance for method chaining
   */
  setDefault(defaultValue: boolean): this {
    this.#data.default =
      SelectMenuOptionEntity.shape.default.parse(defaultValue);
    return this;
  }

  /**
   * Validates and builds the final select menu option object.
   *
   * @returns The validated select menu option object ready to be sent to Discord
   * @throws {Error} If the select menu option fails validation
   */
  build(): z.infer<typeof SelectMenuOptionEntity> {
    try {
      return SelectMenuOptionEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this SelectMenuOptionBuilder.
   *
   * @returns A new SelectMenuOptionBuilder instance with the same data
   */
  clone(): SelectMenuOptionBuilder {
    return new SelectMenuOptionBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the select menu option data.
   *
   * @returns The select menu option data as a JSON object
   */
  toJson(): z.infer<typeof SelectMenuOptionEntity> {
    return structuredClone(SelectMenuOptionEntity.parse(this.#data));
  }

  /**
   * Checks if the select menu option is valid according to Discord's requirements.
   *
   * @returns True if the select menu option is valid, false otherwise
   */
  isValid(): boolean {
    return SelectMenuOptionEntity.safeParse(this.#data).success;
  }
}
