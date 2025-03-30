import {
  ComponentType,
  type SelectMenuOptionEntity,
  type StringSelectMenuEntity,
} from "@nyxjs/core";
import { SelectMenuOptionBuilder } from "./select-menu-option.builder.js";
import { SelectMenuBuilder } from "./select-menu.builder.js";

/**
 * Builder for creating string select menu components.
 *
 * @example
 * ```typescript
 * const selectMenu = new StringSelectMenuBuilder()
 *   .setCustomId('my_select')
 *   .setPlaceholder('Select an option')
 *   .addOptions([
 *     { label: 'Option 1', value: 'option_1' },
 *     { label: 'Option 2', value: 'option_2' }
 *   ])
 *   .build();
 * ```
 */
export class StringSelectMenuBuilder extends SelectMenuBuilder<
  StringSelectMenuEntity,
  StringSelectMenuBuilder
> {
  /**
   * Creates a new StringSelectMenuBuilder instance.
   *
   * @param data Optional initial select menu data
   */
  constructor(data: Partial<StringSelectMenuEntity> = {}) {
    super({
      type: ComponentType.StringSelect,
      options: [],
      ...data,
    });
  }

  protected get self(): StringSelectMenuBuilder {
    return this;
  }

  /**
   * Creates a new StringSelectMenuBuilder from an existing select menu entity.
   *
   * @param selectMenu The select menu entity to use as a base
   * @returns A new StringSelectMenuBuilder instance
   */
  static from(
    selectMenu: StringSelectMenuEntity | Partial<StringSelectMenuEntity>,
  ): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder(selectMenu);
  }

  /**
   * Adds options to the select menu.
   *
   * @param options The options to add (array of option entities, builders, or partial data)
   * @returns This builder instance, for method chaining
   * @throws Error If adding would exceed 25 options
   */
  addOptions(
    ...options: Array<
      | SelectMenuOptionEntity
      | SelectMenuOptionBuilder
      | Partial<SelectMenuOptionEntity>
    >
  ): this {
    if (!this.data.options) {
      this.data.options = [];
    }

    const optionsToAdd = options.map((option) => {
      if (option instanceof SelectMenuOptionBuilder) {
        return option.build();
      }
      return new SelectMenuOptionBuilder(option).build();
    });

    if (this.data.options.length + optionsToAdd.length > 25) {
      throw new Error("Select menu cannot have more than 25 options");
    }

    this.data.options.push(...optionsToAdd);
    return this;
  }

  /**
   * Sets all options for the select menu, replacing any existing options.
   *
   * @param options The options to set
   * @returns This builder instance, for method chaining
   * @throws Error If more than 25 options are provided
   */
  setOptions(
    ...options: Array<
      | SelectMenuOptionEntity
      | SelectMenuOptionBuilder
      | Partial<SelectMenuOptionEntity>
    >
  ): this {
    const optionsToSet = options.map((option) => {
      if (option instanceof SelectMenuOptionBuilder) {
        return option.build();
      }
      return new SelectMenuOptionBuilder(option).build();
    });

    if (optionsToSet.length > 25) {
      throw new Error("Select menu cannot have more than 25 options");
    }

    this.data.options = optionsToSet;
    return this;
  }

  /**
   * Builds and returns the final string select menu object.
   *
   * @returns The constructed string select menu entity
   * @throws Error If required properties are missing or if validation fails
   */
  build(): StringSelectMenuEntity {
    this.validateCommon();

    // String select specific validation
    if (!this.data.options || this.data.options.length === 0) {
      throw new Error("String select menu must have at least one option");
    }

    return this.data as StringSelectMenuEntity;
  }
}
