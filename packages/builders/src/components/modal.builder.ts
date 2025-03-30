import type {
  ActionRowEntity,
  InteractionCallbackModalEntity,
} from "@nyxjs/core";
import type { ActionRowBuilder } from "./action-row.builder.js";
import type { TextInputBuilder } from "./text-input.builder.js";

/**
 * Builder for creating Discord modal dialogs.
 *
 * Modals are popup windows that can contain text inputs for users to fill.
 *
 * @example
 * ```typescript
 * const modal = new ModalBuilder()
 *   .setCustomId('my_modal')
 *   .setTitle('Information Form')
 *   .addComponents(
 *     ActionRowBuilder.createTextInputRow(
 *       new TextInputBuilder()
 *         .setCustomId('name_input')
 *         .setLabel('Name')
 *         .setStyle(TextInputStyle.Short)
 *     ),
 *     ActionRowBuilder.createTextInputRow(
 *       new TextInputBuilder()
 *         .setCustomId('bio_input')
 *         .setLabel('Bio')
 *         .setStyle(TextInputStyle.Paragraph)
 *     )
 *   );
 * ```
 */
export class ModalBuilder {
  #customId: string | undefined;
  #title: string | undefined;
  #components: ActionRowBuilder<TextInputBuilder>[] = [];

  /**
   * Creates a new ModalBuilder instance.
   *
   * @param data Optional initial modal data
   */
  constructor(
    data: Partial<
      Pick<InteractionCallbackModalEntity, "custom_id" | "title">
    > = {},
  ) {
    if (data.custom_id) {
      this.setCustomId(data.custom_id);
    }
    if (data.title) {
      this.setTitle(data.title);
    }
  }

  /**
   * Sets the custom ID of the modal.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If customId exceeds 100 characters
   */
  setCustomId(customId: string): this {
    if (customId.length > 100) {
      throw new Error("Modal custom ID cannot exceed 100 characters");
    }
    this.#customId = customId;
    return this;
  }

  /**
   * Sets the title of the modal.
   *
   * @param title The title to set (max 45 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If title exceeds 45 characters
   */
  setTitle(title: string): this {
    if (title.length > 45) {
      throw new Error("Modal title cannot exceed 45 characters");
    }
    this.#title = title;
    return this;
  }

  /**
   * Adds action rows with text inputs to the modal.
   *
   * @param components The action rows to add
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 5 action rows
   */
  addComponents(...components: ActionRowBuilder<TextInputBuilder>[]): this {
    if (this.#components.length + components.length > 5) {
      throw new Error("Modal cannot have more than 5 action rows");
    }

    this.#components.push(...components);
    return this;
  }

  /**
   * Sets all action rows for the modal, replacing any existing components.
   *
   * @param components The action rows to set
   * @returns This builder instance, for method chaining
   * @throws Error If more than 5 action rows are provided
   */
  setComponents(...components: ActionRowBuilder<TextInputBuilder>[]): this {
    if (components.length > 5) {
      throw new Error("Modal cannot have more than 5 action rows");
    }

    this.#components = [...components];
    return this;
  }

  /**
   * Builds and returns the final modal object for API submission.
   *
   * @returns The constructed modal object
   * @throws Error If required properties are missing
   */
  build(): InteractionCallbackModalEntity {
    if (!this.#customId) {
      throw new Error("Modal must have a custom ID");
    }

    if (!this.#title) {
      throw new Error("Modal must have a title");
    }

    if (this.#components.length === 0) {
      throw new Error("Modal must have at least one component");
    }

    return {
      custom_id: this.#customId,
      title: this.#title,
      components: this.#components.map((row) => row.build()),
    };
  }

  /**
   * Converts the modal to a plain object representation.
   *
   * @returns The modal data as a plain object
   */
  toJson(): Partial<InteractionCallbackModalEntity> {
    return {
      custom_id: this.#customId,
      title: this.#title,
      components: this.#components.map((row) =>
        row.toJson(),
      ) as ActionRowEntity[],
    };
  }
}
