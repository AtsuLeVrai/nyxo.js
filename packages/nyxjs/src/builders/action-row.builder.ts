import { ActionRowEntity, ComponentType } from "@nyxjs/core";
import { z } from "zod";
import { ButtonBuilder } from "./button.builder.js";
import type { BaseSelectMenuBuilder } from "./select-menu.builder.js";
import type { TextInputBuilder } from "./text-input.builder.js";

type AnyComponentBuilder =
  | ButtonBuilder
  | BaseSelectMenuBuilder
  | TextInputBuilder;
type Component = z.input<typeof ActionRowEntity>["components"][number];

export class ActionRowBuilder {
  readonly #data: Partial<z.input<typeof ActionRowEntity>>;

  constructor(data: Partial<z.input<typeof ActionRowEntity>> = {}) {
    this.#data = {
      type: ComponentType.ActionRow,
      components: [],
      ...data,
    };
  }

  static from(data: z.input<typeof ActionRowEntity>): ActionRowBuilder {
    return new ActionRowBuilder(data);
  }

  static createWithButtons(...buttons: ButtonBuilder[]): ActionRowBuilder {
    return new ActionRowBuilder().addComponents(...buttons);
  }

  static createWithSelectMenu(
    selectMenu: BaseSelectMenuBuilder,
  ): ActionRowBuilder {
    return new ActionRowBuilder().addComponent(selectMenu);
  }

  static createWithTextInput(textInput: TextInputBuilder): ActionRowBuilder {
    return new ActionRowBuilder().addComponent(textInput);
  }

  addComponent(component: AnyComponentBuilder): this {
    const componentData = component.toJson() as Component;
    this.#data.components = [...(this.#data.components || []), componentData];
    return this;
  }

  addComponents(...components: AnyComponentBuilder[]): this {
    const componentsData = components.map((c) => c.toJson() as Component);
    this.#data.components = [
      ...(this.#data.components || []),
      ...componentsData,
    ];
    return this;
  }

  setComponents(components: AnyComponentBuilder[]): this {
    this.#data.components = components.map((c) => c.toJson() as Component);
    return this;
  }

  addButton(callback: (button: ButtonBuilder) => ButtonBuilder): this {
    const button = callback(new ButtonBuilder());
    return this.addComponent(button);
  }

  addButtons(...callbacks: ((button: ButtonBuilder) => ButtonBuilder)[]): this {
    const buttons = callbacks.map((callback) => callback(new ButtonBuilder()));
    return this.addComponents(...buttons);
  }

  removeComponent(index: number): this {
    if (this.#data.components) {
      this.#data.components = this.#data.components.filter(
        (_, i) => i !== index,
      );
    }
    return this;
  }

  componentCount(): number {
    return this.#data.components?.length || 0;
  }

  clearComponents(): this {
    this.#data.components = [];
    return this;
  }

  toJson(): ActionRowEntity {
    return ActionRowEntity.parse(this.#data);
  }
}

export const ActionRowBuilderSchema = z.instanceof(ActionRowBuilder);
