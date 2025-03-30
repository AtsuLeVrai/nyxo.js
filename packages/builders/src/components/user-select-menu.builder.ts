import { ComponentType, type UserSelectMenuEntity } from "@nyxjs/core";
import { SelectMenuBuilder } from "./select-menu.builder.js";

/**
 * Builder for creating user select menu components.
 *
 * @example
 * ```typescript
 * const userSelect = new UserSelectMenuBuilder()
 *   .setCustomId('user_select')
 *   .setPlaceholder('Select a user')
 *   .build();
 * ```
 */
export class UserSelectMenuBuilder extends SelectMenuBuilder<
  UserSelectMenuEntity,
  UserSelectMenuBuilder
> {
  /**
   * Creates a new UserSelectMenuBuilder instance.
   *
   * @param data Optional initial select menu data
   */
  constructor(data: Partial<UserSelectMenuEntity> = {}) {
    super({
      type: ComponentType.UserSelect,
      ...data,
    });
  }

  protected get self(): UserSelectMenuBuilder {
    return this;
  }

  /**
   * Creates a new UserSelectMenuBuilder from an existing select menu entity.
   *
   * @param selectMenu The select menu entity to use as a base
   * @returns A new UserSelectMenuBuilder instance
   */
  static from(
    selectMenu: UserSelectMenuEntity | Partial<UserSelectMenuEntity>,
  ): UserSelectMenuBuilder {
    return new UserSelectMenuBuilder(selectMenu);
  }

  /**
   * Builds and returns the final user select menu object.
   *
   * @returns The constructed user select menu entity
   * @throws Error If required properties are missing or if validation fails
   */
  build(): UserSelectMenuEntity {
    this.validateCommon();
    return this.data as UserSelectMenuEntity;
  }
}
