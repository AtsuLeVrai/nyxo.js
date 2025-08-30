import { BaseBuilder } from "../../bases/index.js";
import {
  type ComponentsV2ActionRowEntity,
  ComponentType,
  type InteractiveComponentEntity,
  type LegacyActionRowEntity,
} from "./components.entity.js";

/**
 * @description Supported ActionRow contexts for different Discord systems.
 * Note: Modal components now use LabelEntity instead of ActionRows.
 */
export type ActionRowContext = "legacy" | "components-v2";

/**
 * @description ActionRow entity type mapping based on context.
 */
export type ActionRowEntityMap = {
  legacy: LegacyActionRowEntity;
  "components-v2": ComponentsV2ActionRowEntity;
};

/**
 * @description Component type mapping based on ActionRow context.
 */
export type ActionRowComponentMap = {
  legacy: InteractiveComponentEntity;
  "components-v2": InteractiveComponentEntity;
};

/**
 * @description Unified ActionRow builder for all Discord component systems.
 * Automatically adapts behavior based on the specified context.
 * @template C - The ActionRow context (legacy, components-v2, or modal)
 */
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

  /**
   * @description Gets the current number of components in this ActionRow.
   * @returns Number of components currently added
   */
  get componentCount(): number {
    const components = this.get("components" as keyof ActionRowEntityMap[C]);
    return Array.isArray(components) ? components.length : 0;
  }

  /**
   * @description Creates a new ActionRow builder from existing data.
   * @param context - The ActionRow context (legacy or components-v2)
   * @param data - Existing ActionRow entity data
   * @returns New ActionRow builder instance
   */
  static from<C extends ActionRowContext = "legacy">(
    context: C,
    data: ActionRowEntityMap[C],
  ): ActionRowBuilder<C> {
    return new ActionRowBuilder(context, data);
  }

  /**
   * @description Sets the component ID for this ActionRow.
   * @param id - Unique identifier for the component
   * @returns This builder instance for method chaining
   */
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

  /**
   * @description Adds a single component to this ActionRow.
   * @param component - Component to add (type depends on context)
   * @returns This builder instance for method chaining
   * @throws {Error} When exceeding component limits or validation fails
   */
  addComponent(component: ActionRowComponentMap[C]): this {
    this.#validateInteractiveComponent(
      component as InteractiveComponentEntity,
      this.componentCount,
    );
    // @ts-expect-error - pushToArray is correctly typed
    return this.pushToArray("components" as keyof ActionRowEntityMap[C], component);
  }

  /**
   * @description Adds multiple components to this ActionRow.
   * @param components - Components to add
   * @returns This builder instance for method chaining
   * @throws {Error} When exceeding component limits or validation fails
   */
  addComponents(...components: ActionRowComponentMap[C][]): this {
    for (const component of components) {
      this.addComponent(component);
    }
    return this;
  }

  /**
   * @description Sets all components for this ActionRow, replacing existing ones.
   * @param components - Components to set
   * @returns This builder instance for method chaining
   * @throws {Error} When exceeding component limits or validation fails
   */
  setComponents(components: ActionRowComponentMap[C][]): this {
    this.clear("components" as keyof ActionRowEntityMap[C]);
    return this.addComponents(...components);
  }

  /**
   * @description Removes all components from this ActionRow.
   * @returns This builder instance for method chaining
   */
  clearComponents(): this {
    return this.setArray("components" as keyof ActionRowEntityMap[C], [] as any);
  }

  /**
   * @description Validates ActionRow data before building.
   * @throws {Error} When ActionRow configuration is invalid
   */
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

  /**
   * @description Validates interactive components for legacy and Components v2 ActionRows.
   * @param component - Interactive component to validate
   * @param currentCount - Current number of components
   * @throws {Error} When validation fails
   * @private
   */
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
