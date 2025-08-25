import type { InteractionCallbackModalEntity } from "../interaction/index.js";
import type { ActionRowEntity } from "./message-components.entity.js";

export class ModalBuilder {
  readonly #data: Partial<InteractionCallbackModalEntity> = {
    components: [],
  };
  constructor(data?: InteractionCallbackModalEntity) {
    if (data) {
      this.#data = { ...data };
      if (data.components) {
        this.#data.components = [...data.components];
      }
    }
  }
  static from(data: InteractionCallbackModalEntity): ModalBuilder {
    return new ModalBuilder(data);
  }
  setCustomId(customId: string): this {
    this.#data.custom_id = customId;
    return this;
  }
  setTitle(title: string): this {
    this.#data.title = title;
    return this;
  }
  addComponent(component: ActionRowEntity): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }
    this.#data.components.push(component);
    return this;
  }
  addComponents(...components: ActionRowEntity[]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }
  setComponents(components: ActionRowEntity[]): this {
    this.#data.components = [...components];
    return this;
  }
  build(): InteractionCallbackModalEntity {
    return this.#data as InteractionCallbackModalEntity;
  }
  toJson(): Readonly<InteractionCallbackModalEntity> {
    return Object.freeze({ ...this.#data }) as InteractionCallbackModalEntity;
  }
}
