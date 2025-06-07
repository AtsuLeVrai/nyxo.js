import type {
  ActionRowEntity,
  InteractionCallbackModalEntity,
} from "@nyxojs/core";

/**
 * A builder for creating Discord modal components.
 *
 * Modals are popup forms that can contain text inputs and other interactive components.
 * They must be shown as the first response to an interaction and cannot be sent
 * after deferring or updating a response.
 *
 * Modals can contain up to 5 action rows, with each action row containing exactly
 * one text input component. This class follows the builder pattern to create
 * fully-featured modal components for Discord interactions.
 */
export class ModalBuilder {
  /** The internal modal data being constructed */
  readonly #data: Partial<InteractionCallbackModalEntity> = {
    components: [],
  };

  /**
   * Creates a new ModalBuilder instance.
   *
   * @param data - Optional initial data to populate the modal with
   */
  constructor(data?: InteractionCallbackModalEntity) {
    if (data) {
      this.#data = { ...data };

      // Initialize components array if needed
      if (data.components) {
        this.#data.components = [...data.components];
      }
    }
  }

  /**
   * Creates a new ModalBuilder from existing modal data.
   *
   * @param data - The modal data to use
   * @returns A new ModalBuilder instance with the provided data
   */
  static from(data: InteractionCallbackModalEntity): ModalBuilder {
    return new ModalBuilder(data);
  }

  /**
   * Sets the custom ID of the modal.
   * This identifier will be provided when the modal is submitted.
   *
   * @param customId - The custom ID to set (max 100 characters)
   * @returns The modal builder instance for method chaining
   */
  setCustomId(customId: string): this {
    this.#data.custom_id = customId;
    return this;
  }

  /**
   * Sets the title of the modal.
   * This appears at the top of the modal popup.
   *
   * @param title - The title to set (max 45 characters)
   * @returns The modal builder instance for method chaining
   */
  setTitle(title: string): this {
    this.#data.title = title;
    return this;
  }

  /**
   * Adds an action row component to the modal.
   *
   * @param component - The action row component to add
   * @returns The modal builder instance for method chaining
   */
  addComponent(component: ActionRowEntity): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }

    this.#data.components.push(component);
    return this;
  }

  /**
   * Adds multiple action row components to the modal.
   *
   * @param components - The action row components to add
   * @returns The modal builder instance for method chaining
   */
  addComponents(...components: ActionRowEntity[]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }

  /**
   * Sets all action row components for the modal, replacing any existing components.
   *
   * @param components - The action row components to set
   * @returns The modal builder instance for method chaining
   */
  setComponents(components: ActionRowEntity[]): this {
    this.#data.components = [...components];
    return this;
  }

  /**
   * Builds the final modal entity object.
   *
   * @returns The complete modal entity ready to be used in an interaction response
   */
  build(): InteractionCallbackModalEntity {
    return this.#data as InteractionCallbackModalEntity;
  }

  /**
   * Converts the modal data to an immutable object.
   * This is useful for serialization or sending to Discord's API.
   *
   * @returns A read-only copy of the modal data
   */
  toJson(): Readonly<InteractionCallbackModalEntity> {
    return Object.freeze({ ...this.#data }) as InteractionCallbackModalEntity;
  }
}
