import {
  type ChannelSelectMenuEntity,
  type ChannelType,
  ComponentType,
} from "@nyxjs/core";
import { SelectMenuBuilder } from "./select-menu.builder.js";

/**
 * Builder for creating channel select menu components.
 *
 * @example
 * ```typescript
 * const channelSelect = new ChannelSelectMenuBuilder()
 *   .setCustomId('channel_select')
 *   .setPlaceholder('Select a channel')
 *   .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice)
 *   .build();
 * ```
 */
export class ChannelSelectMenuBuilder extends SelectMenuBuilder<
  ChannelSelectMenuEntity,
  ChannelSelectMenuBuilder
> {
  /**
   * Creates a new ChannelSelectMenuBuilder instance.
   *
   * @param data Optional initial select menu data
   */
  constructor(data: Partial<ChannelSelectMenuEntity> = {}) {
    super({
      type: ComponentType.ChannelSelect,
      ...data,
    });
  }

  protected get self(): ChannelSelectMenuBuilder {
    return this;
  }

  /**
   * Creates a new ChannelSelectMenuBuilder from an existing select menu entity.
   *
   * @param selectMenu The select menu entity to use as a base
   * @returns A new ChannelSelectMenuBuilder instance
   */
  static from(
    selectMenu: ChannelSelectMenuEntity | Partial<ChannelSelectMenuEntity>,
  ): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(selectMenu);
  }

  /**
   * Sets the channel types that can be selected.
   *
   * @param types The channel types to allow
   * @returns This builder instance, for method chaining
   */
  setChannelTypes(...types: ChannelType[]): this {
    this.data.channel_types = types;
    return this;
  }

  /**
   * Adds channel types that can be selected.
   *
   * @param types The channel types to add
   * @returns This builder instance, for method chaining
   */
  addChannelTypes(...types: ChannelType[]): this {
    if (!this.data.channel_types) {
      this.data.channel_types = [];
    }

    this.data.channel_types.push(...types);
    return this;
  }

  /**
   * Builds and returns the final channel select menu object.
   *
   * @returns The constructed channel select menu entity
   * @throws Error If required properties are missing or if validation fails
   */
  build(): ChannelSelectMenuEntity {
    this.validateCommon();
    return this.data as ChannelSelectMenuEntity;
  }
}
