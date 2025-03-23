import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  type ActionRowEntity,
  ComponentType,
  InteractionCallbackModalEntity,
  type TextInputEntity,
} from "../entities/index.js";
import { ActionRowBuilder } from "./action-row.builder.js";
import { TextInputBuilder } from "./text-input.builder.js";

/**
 * A builder class for creating and validating Discord modals.
 *
 * This builder provides a fluent interface for constructing modals with proper validation
 * using Zod schemas. It ensures that all modal properties conform to Discord's requirements
 * and constraints.
 *
 * @example
 * ```typescript
 * const modal = new ModalBuilder()
 *   .setCustomId("user_profile_modal")
 *   .setTitle("User Profile Information")
 *   .addComponents(
 *     new ActionRowBuilder().addComponents(
 *       new TextInputBuilder()
 *         .setCustomId("name_input")
 *         .setLabel("Name")
 *         .setStyle(TextInputStyle.Short)
 *     ),
 *     new ActionRowBuilder().addComponents(
 *       new TextInputBuilder()
 *         .setCustomId("bio_input")
 *         .setLabel("Bio")
 *         .setStyle(TextInputStyle.Paragraph)
 *     )
 *   )
 *   .build();
 * ```
 */
export class ModalBuilder {
  /** Internal data object representing the modal being built */
  readonly #data: z.input<typeof InteractionCallbackModalEntity> = {
    custom_id: "",
    title: "",
    components: [],
  };

  /**
   * Creates a new ModalBuilder instance.
   *
   * @param data Optional initial data to populate the modal
   */
  constructor(data?: Partial<z.input<typeof InteractionCallbackModalEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new ModalBuilder from an existing modal object.
   *
   * @param modal The modal object to copy from
   * @returns A new ModalBuilder instance
   */
  static from(
    modal: z.input<typeof InteractionCallbackModalEntity>,
  ): ModalBuilder {
    return new ModalBuilder(modal);
  }

  /**
   * Sets the custom ID of the modal.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the custom ID is invalid
   */
  setCustomId(customId: string): this {
    try {
      this.#data.custom_id =
        InteractionCallbackModalEntity.shape.custom_id.parse(customId);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the title of the modal.
   *
   * @param title The title to set (max 45 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the title is invalid
   */
  setTitle(title: string): this {
    try {
      this.#data.title =
        InteractionCallbackModalEntity.shape.title.parse(title);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Adds action rows containing components to the modal.
   *
   * @param components The action rows or text inputs to add (max 5 total)
   * @returns This builder instance for method chaining
   * @throws {Error} If adding components would exceed the maximum of 5
   */
  addComponents(
    ...components: (
      | z.input<typeof ActionRowEntity>
      | ActionRowBuilder
      | z.input<typeof TextInputEntity>
      | TextInputBuilder
    )[]
  ): this {
    try {
      const actionRows: z.input<typeof ActionRowEntity>[] = [];

      // Process each component - could be an ActionRow, ActionRowBuilder, TextInput, or TextInputBuilder
      for (const component of components) {
        if (component instanceof ActionRowBuilder) {
          // If it's an ActionRowBuilder, build it
          actionRows.push(component.build());
        } else if (component instanceof TextInputBuilder) {
          // If it's a TextInputBuilder, wrap it in an ActionRow
          actionRows.push({
            type: ComponentType.ActionRow,
            components: [component.build()],
          });
        } else if (
          (component as z.input<typeof ActionRowEntity>).type ===
          ComponentType.ActionRow
        ) {
          // If it's a raw ActionRow object
          actionRows.push(component as z.input<typeof ActionRowEntity>);
        } else {
          // If it's a raw TextInput object, wrap it in an ActionRow
          actionRows.push({
            type: ComponentType.ActionRow,
            components: [component as z.input<typeof TextInputEntity>],
          });
        }
      }

      // Check if we're going to exceed the max components
      if (this.#data.components.length + actionRows.length > 5) {
        throw new Error("Modal cannot contain more than 5 action rows");
      }

      // Add the action rows to our existing components
      const newComponents = [...this.#data.components, ...actionRows];

      // Validate
      InteractionCallbackModalEntity.shape.components.parse(newComponents);

      this.#data.components = newComponents;
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets all components of the modal, replacing any existing components.
   *
   * @param components The action rows or text inputs to set (max 5)
   * @returns This builder instance for method chaining
   * @throws {Error} If the components are invalid
   */
  setComponents(
    ...components: (
      | z.input<typeof ActionRowEntity>
      | ActionRowBuilder
      | z.input<typeof TextInputEntity>
      | TextInputBuilder
    )[]
  ): this {
    this.#data.components = [];
    return this.addComponents(...components);
  }

  /**
   * Adds a text input component to the modal, automatically wrapping it in an action row.
   *
   * @param textInput The text input to add
   * @returns This builder instance for method chaining
   * @throws {Error} If adding would exceed the maximum of 5 action rows
   */
  addTextInput(
    textInput: TextInputBuilder | z.input<typeof TextInputEntity>,
  ): this {
    const input =
      textInput instanceof TextInputBuilder ? textInput.build() : textInput;

    return this.addComponents({
      type: ComponentType.ActionRow,
      components: [input],
    });
  }

  /**
   * Validates and builds the final modal object.
   *
   * @returns The validated modal object ready to be sent to Discord
   * @throws {Error} If the modal fails validation
   */
  build(): InteractionCallbackModalEntity {
    try {
      return InteractionCallbackModalEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this ModalBuilder.
   *
   * @returns A new ModalBuilder instance with the same data
   */
  clone(): ModalBuilder {
    return new ModalBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the modal data.
   *
   * @returns The modal data as a JSON object
   */
  toJson(): InteractionCallbackModalEntity {
    return structuredClone(InteractionCallbackModalEntity.parse(this.#data));
  }

  /**
   * Checks if the modal is valid according to Discord's requirements.
   *
   * @returns True if the modal is valid, false otherwise
   */
  isValid(): boolean {
    return InteractionCallbackModalEntity.safeParse(this.#data).success;
  }
}
