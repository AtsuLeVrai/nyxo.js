import { BaseBuilder } from "../../bases/index.js";
import {
  type ComponentsV2ActionRowEntity,
  ComponentType,
  type InteractiveComponentEntity,
  type LegacyActionRowEntity,
} from "./components.entity.js";

export type ActionRowContext = "legacy" | "components-v2";

export type ActionRowEntityMap = {
  legacy: LegacyActionRowEntity;
  "components-v2": ComponentsV2ActionRowEntity;
};

export type ActionRowComponentMap = {
  legacy: InteractiveComponentEntity;
  "components-v2": InteractiveComponentEntity;
};

export class ActionRowBuilder<C extends ActionRowContext = "legacy"> extends BaseBuilder<
  ActionRowEntityMap[C]
> {
  readonly #context: C;

  constructor(context?: C, data?: Partial<ActionRowEntityMap[C]>) {
    super({
      type: ComponentType.ActionRow,
      components: [],
      ...data,
    } as Partial<ActionRowEntityMap[C]>);

    this.#context = (context ?? "legacy") as C;

    // Apply context-specific defaults
    if (this.#context === "legacy") {
      this.set(
        "id" as keyof ActionRowEntityMap[C],
        0 as ActionRowEntityMap[C][keyof ActionRowEntityMap[C]],
      );
    }
  }

  get componentCount(): number {
    const components = this.get("components" as keyof ActionRowEntityMap[C]);
    return Array.isArray(components) ? components.length : 0;
  }

  static from<C extends ActionRowContext = "legacy">(
    context: C,
    data: ActionRowEntityMap[C],
  ): ActionRowBuilder<C> {
    return new ActionRowBuilder(context, data);
  }

  setId(id: number): this {
    // Legacy ActionRows always have id of 0
    if (this.#context === "legacy") {
      return this.set(
        "id" as keyof ActionRowEntityMap[C],
        0 as ActionRowEntityMap[C][keyof ActionRowEntityMap[C]],
      );
    }
    return this.set(
      "id" as keyof ActionRowEntityMap[C],
      id as ActionRowEntityMap[C][keyof ActionRowEntityMap[C]],
    );
  }

  addComponent(component: ActionRowComponentMap[C]): this {
    this.#validateInteractiveComponent(
      component as InteractiveComponentEntity,
      this.componentCount,
    );
    // @ts-expect-error - pushToArray is correctly typed
    return this.pushToArray("components" as keyof ActionRowEntityMap[C], component);
  }

  addComponents(...components: ActionRowComponentMap[C][]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }

  setComponents(components: ActionRowComponentMap[C][]): this {
    this.clear("components" as keyof ActionRowEntityMap[C]);
    return this.addComponents(...components);
  }

  clearComponents(): this {
    return this.setArray("components" as keyof ActionRowEntityMap[C], [] as any);
  }

  protected validate(): void {
    const data = this.rawData;
    const components = (data.components as InteractiveComponentEntity[]) || [];

    if (components.length === 0) {
      throw new Error("ActionRow must have at least one component");
    }

    if (components.length > 5) {
      const contextName = this.#context === "legacy" ? "Legacy" : "Components v2";
      throw new Error(`${contextName} ActionRow cannot have more than 5 components`);
    }

    // Check component type consistency
    const hasSelectMenu = components.some(
      (c) =>
        c.type === ComponentType.StringSelect ||
        c.type === ComponentType.UserSelect ||
        c.type === ComponentType.RoleSelect ||
        c.type === ComponentType.MentionableSelect ||
        c.type === ComponentType.ChannelSelect,
    );
    const hasButton = components.some((c) => c.type === ComponentType.Button);

    if (hasSelectMenu && hasButton) {
      throw new Error("ActionRow cannot mix select menus with buttons");
    }

    if (hasSelectMenu && components.length > 1) {
      throw new Error("ActionRow with select menu can only contain one component");
    }

    // Validate legacy ActionRow id
    if (this.#context === "legacy" && data.id !== 0) {
      throw new Error("Legacy ActionRow must have id of 0");
    }
  }

  #validateInteractiveComponent(component: InteractiveComponentEntity, currentCount: number): void {
    // Check total component limit
    if (currentCount >= 5) {
      const contextName = this.#context === "legacy" ? "Legacy" : "Components v2";
      throw new Error(`${contextName} ActionRow cannot have more than 5 components`);
    }

    const components = (this.get("components" as keyof ActionRowEntityMap[C]) ||
      []) as InteractiveComponentEntity[];
    const hasSelectMenu = components.some(
      (c) =>
        c.type === ComponentType.StringSelect ||
        c.type === ComponentType.UserSelect ||
        c.type === ComponentType.RoleSelect ||
        c.type === ComponentType.MentionableSelect ||
        c.type === ComponentType.ChannelSelect,
    );

    // If adding a select menu, ensure no other components exist
    if (
      [
        ComponentType.StringSelect,
        ComponentType.UserSelect,
        ComponentType.RoleSelect,
        ComponentType.MentionableSelect,
        ComponentType.ChannelSelect,
      ].includes(component.type as any)
    ) {
      if (currentCount > 0) {
        throw new Error("ActionRow with select menu cannot contain other components");
      }
    }

    // If adding a button, ensure no select menu exists
    if (component.type === ComponentType.Button && hasSelectMenu) {
      throw new Error("ActionRow with buttons cannot contain select menus");
    }
  }
}
