import { ComponentType, type MentionableSelectMenuEntity } from "@nyxjs/core";
import { SelectMenuBuilder } from "./select-menu.builder.js";

/**
 * Builder for creating mentionable select menu components.
 *
 * @example
 * ```typescript
 * const mentionableSelect = new MentionableSelectMenuBuilder()
 *   .setCustomId('mentionable_select')
 *   .setPlaceholder('Select a user or role')
 *   .build();
 * ```
 */
export class MentionableSelectMenuBuilder extends SelectMenuBuilder<
  MentionableSelectMenuEntity,
  MentionableSelectMenuBuilder
> {
  /**
   * Creates a new MentionableSelectMenuBuilder instance.
   *
   * @param data Optional initial select menu data
   */
  constructor(data: Partial<MentionableSelectMenuEntity> = {}) {
    super({
      type: ComponentType.MentionableSelect,
      ...data,
    });
  }

  protected get self(): MentionableSelectMenuBuilder {
    return this;
  }

  /**
   * Creates a new MentionableSelectMenuBuilder from an existing select menu entity.
   *
   * @param selectMenu The select menu entity to use as a base
   * @returns A new MentionableSelectMenuBuilder instance
   */
  static from(
    selectMenu:
      | MentionableSelectMenuEntity
      | Partial<MentionableSelectMenuEntity>,
  ): MentionableSelectMenuBuilder {
    return new MentionableSelectMenuBuilder(selectMenu);
  }

  /**
   * Builds and returns the final mentionable select menu object.
   *
   * @returns The constructed mentionable select menu entity
   * @throws Error If required properties are missing or if validation fails
   */
  build(): MentionableSelectMenuEntity {
    this.validateCommon();
    return this.data as MentionableSelectMenuEntity;
  }
}
