import {
  type ActionRowEntity,
  type AnyComponentEntity,
  type ButtonEntity,
  type ChannelSelectMenuEntity,
  ComponentType,
  type MentionableSelectMenuEntity,
  type RoleSelectMenuEntity,
  type StringSelectMenuEntity,
  type TextInputEntity,
  type UserSelectMenuEntity,
} from "@nyxjs/core";
import { ButtonBuilder } from "./button.builder.js";
import { ChannelSelectMenuBuilder } from "./channel-select-menu.builder.js";
import { MentionableSelectMenuBuilder } from "./mentionable-select-menu.builder.js";
import { RoleSelectMenuBuilder } from "./role-select-menu.builder.js";
import { StringSelectMenuBuilder } from "./string-select-menu.builder.js";
import { TextInputBuilder } from "./text-input.builder.js";
import { UserSelectMenuBuilder } from "./user-select-menu.builder.js";

/**
 * Type representing any component builder
 */
export type AnyComponentBuilder =
  | ButtonBuilder
  | TextInputBuilder
  | StringSelectMenuBuilder
  | UserSelectMenuBuilder
  | RoleSelectMenuBuilder
  | MentionableSelectMenuBuilder
  | ChannelSelectMenuBuilder;

/**
 * Builder for creating action row components to contain other components.
 * Action rows are containers that can hold up to 5 components of certain types.
 *
 * @template T The type of component builders this action row can contain
 *
 * @example
 * ```typescript
 * // Create an action row with buttons
 * const actionRow = new ActionRowBuilder<ButtonBuilder>()
 *   .addComponents(
 *     ButtonBuilder.primary('btn_1', 'Click me'),
 *     ButtonBuilder.secondary('btn_2', 'Or me')
 *   );
 *
 * // Create an action row with a select menu
 * const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>()
 *   .addComponents(
 *     new StringSelectMenuBuilder()
 *       .setCustomId('select_menu')
 *       .setPlaceholder('Choose an option')
 *       .addOptions(
 *         { label: 'Option 1', value: 'opt1' },
 *         { label: 'Option 2', value: 'opt2' }
 *       )
 *   );
 * ```
 */
export class ActionRowBuilder<
  T extends AnyComponentBuilder = AnyComponentBuilder,
> {
  /** The components contained in this action row */
  #components: T[] = [];

  /**
   * Creates a new ActionRowBuilder instance.
   *
   * @param components Optional initial components
   */
  constructor(components: T[] = []) {
    this.#components = [...components];
  }

  /**
   * Creates a new ActionRowBuilder from an existing action row entity.
   * This method converts the components to the appropriate builder types.
   *
   * @param actionRow The action row entity to use as a base
   * @returns A new ActionRowBuilder instance
   */
  static from(actionRow: ActionRowEntity): ActionRowBuilder {
    const builder = new ActionRowBuilder();

    const componentBuilders = actionRow.components.map((component) => {
      switch (component.type) {
        case ComponentType.Button:
          return ButtonBuilder.from(component as ButtonEntity);

        case ComponentType.TextInput:
          return TextInputBuilder.from(component as TextInputEntity);

        case ComponentType.StringSelect:
          return StringSelectMenuBuilder.from(
            component as StringSelectMenuEntity,
          );

        case ComponentType.UserSelect:
          return UserSelectMenuBuilder.from(component as UserSelectMenuEntity);

        case ComponentType.RoleSelect:
          return RoleSelectMenuBuilder.from(component as RoleSelectMenuEntity);

        case ComponentType.MentionableSelect:
          return MentionableSelectMenuBuilder.from(
            component as MentionableSelectMenuEntity,
          );

        case ComponentType.ChannelSelect:
          return ChannelSelectMenuBuilder.from(
            component as ChannelSelectMenuEntity,
          );

        default:
          throw new Error(
            `Unknown component type: ${(component as AnyComponentEntity).type}`,
          );
      }
    });

    return builder.setComponents(...componentBuilders);
  }

  /**
   * Creates a specialized action row for buttons.
   *
   * @param buttons Optional initial buttons
   * @returns A new ActionRowBuilder specialized for buttons
   */
  static createButtonRow(
    ...buttons: (ButtonBuilder | ButtonEntity)[]
  ): ActionRowBuilder<ButtonBuilder> {
    const buttonBuilders = buttons.map((btn) =>
      btn instanceof ButtonBuilder ? btn : ButtonBuilder.from(btn),
    );
    return new ActionRowBuilder<ButtonBuilder>(buttonBuilders);
  }

  /**
   * Creates a specialized action row for a select menu.
   *
   * @param selectMenu The select menu to include
   * @returns A new ActionRowBuilder with the select menu
   */
  static createSelectMenuRow<
    T extends
      | StringSelectMenuBuilder
      | UserSelectMenuBuilder
      | RoleSelectMenuBuilder
      | MentionableSelectMenuBuilder
      | ChannelSelectMenuBuilder,
  >(selectMenu: T): ActionRowBuilder<T> {
    return new ActionRowBuilder<T>([selectMenu]);
  }

  /**
   * Creates a specialized action row for text inputs (used in classes).
   *
   * @param textInputs Optional initial text inputs
   * @returns A new ActionRowBuilder specialized for text inputs
   */
  static createTextInputRow(
    ...textInputs: (TextInputBuilder | TextInputEntity)[]
  ): ActionRowBuilder<TextInputBuilder> {
    const textInputBuilders = textInputs.map((input) =>
      input instanceof TextInputBuilder ? input : TextInputBuilder.from(input),
    );
    return new ActionRowBuilder<TextInputBuilder>(textInputBuilders);
  }

  /**
   * Adds components to the action row.
   *
   * @param components The components to add
   * @returns This builder instance, for method chaining
   * @throws If adding would exceed 5 components
   */
  addComponents(...components: T[]): this {
    if (this.#components.length + components.length > 5) {
      throw new Error("Action row cannot have more than 5 components");
    }

    this.#components.push(...components);
    return this;
  }

  /**
   * Sets all components for the action row, replacing any existing components.
   *
   * @param components The components to set
   * @returns This builder instance, for method chaining
   * @throws If more than 5 components are provided
   */
  setComponents(...components: T[]): this {
    if (components.length > 5) {
      throw new Error("Action row cannot have more than 5 components");
    }

    this.#components = [...components];
    return this;
  }

  /**
   * Gets the current components in this action row.
   *
   * @returns Array of component builders
   */
  getComponents(): T[] {
    return [...this.#components];
  }

  /**
   * Builds and returns the final action row object.
   *
   * @returns The constructed action row entity
   * @throws If validation fails
   */
  build(): ActionRowEntity {
    if (this.#components.length === 0) {
      throw new Error("Action row must have at least one component");
    }

    const builtComponents = this.#components.map((component) =>
      component.build(),
    );

    // Check for select menu and button combination
    const hasSelectMenu = builtComponents.some(
      (c) =>
        c.type === ComponentType.StringSelect ||
        c.type === ComponentType.UserSelect ||
        c.type === ComponentType.RoleSelect ||
        c.type === ComponentType.MentionableSelect ||
        c.type === ComponentType.ChannelSelect,
    );

    const hasButton = builtComponents.some(
      (c) => c.type === ComponentType.Button,
    );

    if (hasSelectMenu && hasButton) {
      throw new Error(
        "Action row cannot contain both a select menu and buttons",
      );
    }

    // Check for multiple select menus
    const selectMenuCount = builtComponents.filter(
      (c) =>
        c.type === ComponentType.StringSelect ||
        c.type === ComponentType.UserSelect ||
        c.type === ComponentType.RoleSelect ||
        c.type === ComponentType.MentionableSelect ||
        c.type === ComponentType.ChannelSelect,
    ).length;

    if (selectMenuCount > 1) {
      throw new Error("Action row cannot contain more than one select menu");
    }

    // Check for text inputs (only allowed in classes)
    const hasTextInput = builtComponents.some(
      (c) => c.type === ComponentType.TextInput,
    );
    const hasNonTextInput = builtComponents.some(
      (c) => c.type !== ComponentType.TextInput,
    );

    if (hasTextInput && hasNonTextInput) {
      throw new Error(
        "Action rows with text inputs cannot contain other component types",
      );
    }

    return {
      type: ComponentType.ActionRow,
      components: builtComponents,
    };
  }

  /**
   * Converts the action row to a plain object representation.
   *
   * @returns The action row data as a plain object
   */
  toJson(): Partial<ActionRowEntity> {
    return {
      type: ComponentType.ActionRow,
      components: this.#components.map((component) =>
        component.toJson(),
      ) as AnyComponentEntity[],
    };
  }
}
