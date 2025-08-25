import {
  type ActionRowEntity,
  type AnyComponentEntity,
  ComponentType,
} from "./message-components.entity.js";

export class ActionRowBuilder<T extends AnyComponentEntity> {
  readonly #data: Partial<ActionRowEntity> = {
    type: ComponentType.ActionRow,
    components: [],
  };
  constructor(data?: ActionRowEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from<C extends AnyComponentEntity>(data: ActionRowEntity): ActionRowBuilder<C> {
    return new ActionRowBuilder<C>(data);
  }
  addComponent(component: T): this {
    if (!this.#data.components) {
      this.#data.components = [];
    }
    this.#data.components.push(component);
    return this;
  }
  addComponents(...components: T[]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }
  setComponents(components: T[]): this {
    this.#data.components = [...components];
    return this;
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  build(): ActionRowEntity {
    return this.#data as ActionRowEntity;
  }
  toJson(): Readonly<ActionRowEntity> {
    return Object.freeze({ ...this.#data }) as ActionRowEntity;
  }
}
