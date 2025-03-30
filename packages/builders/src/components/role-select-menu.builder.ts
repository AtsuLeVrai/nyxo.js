import { ComponentType, type RoleSelectMenuEntity } from "@nyxjs/core";
import { SelectMenuBuilder } from "./select-menu.builder.js";

/**
 * Builder for creating role select menu components.
 *
 * @example
 * ```typescript
 * const roleSelect = new RoleSelectMenuBuilder()
 *   .setCustomId('role_select')
 *   .setPlaceholder('Select a role')
 *   .build();
 * ```
 */
export class RoleSelectMenuBuilder extends SelectMenuBuilder<
  RoleSelectMenuEntity,
  RoleSelectMenuBuilder
> {
  /**
   * Creates a new RoleSelectMenuBuilder instance.
   *
   * @param data Optional initial select menu data
   */
  constructor(data: Partial<RoleSelectMenuEntity> = {}) {
    super({
      type: ComponentType.RoleSelect,
      ...data,
    });
  }

  protected get self(): RoleSelectMenuBuilder {
    return this;
  }

  /**
   * Creates a new RoleSelectMenuBuilder from an existing select menu entity.
   *
   * @param selectMenu The select menu entity to use as a base
   * @returns A new RoleSelectMenuBuilder instance
   */
  static from(
    selectMenu: RoleSelectMenuEntity | Partial<RoleSelectMenuEntity>,
  ): RoleSelectMenuBuilder {
    return new RoleSelectMenuBuilder(selectMenu);
  }

  /**
   * Builds and returns the final role select menu object.
   *
   * @returns The constructed role select menu entity
   * @throws Error If required properties are missing or if validation fails
   */
  build(): RoleSelectMenuEntity {
    this.validateCommon();
    return this.data as RoleSelectMenuEntity;
  }
}
