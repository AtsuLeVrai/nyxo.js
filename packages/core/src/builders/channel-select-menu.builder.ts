import type { z } from "zod";
import { fromError } from "zod-validation-error";
import {
  ChannelSelectMenuEntity,
  ChannelType,
  ComponentType,
  type SelectMenuDefaultValueEntity,
} from "../entities/index.js";
import type { Snowflake } from "../managers/index.js";

/**
 * A builder class for creating and validating Discord channel select menus.
 *
 * This builder provides a fluent interface for constructing channel select menus with proper validation
 * using Zod schemas. It ensures that all select menu properties conform to Discord's requirements.
 *
 * @example
 * ```typescript
 * const channelSelect = new ChannelSelectMenuBuilder()
 *   .setCustomId("select_channels")
 *   .setPlaceholder("Select text channels")
 *   .setChannelTypes([ChannelType.GuildText])
 *   .setMinValues(1)
 *   .setMaxValues(3)
 *   .build();
 * ```
 */
export class ChannelSelectMenuBuilder {
  /** Internal data object representing the channel select menu being built */
  readonly #data: z.input<typeof ChannelSelectMenuEntity> = {
    type: ComponentType.ChannelSelect,
    custom_id: "",
  };

  /**
   * Creates a new ChannelSelectMenuBuilder instance.
   *
   * @param data Optional initial data to populate the channel select menu
   */
  constructor(data?: Partial<z.input<typeof ChannelSelectMenuEntity>>) {
    if (data) {
      this.#data = {
        ...this.#data,
        ...data,
      };
    }
  }

  /**
   * Creates a new ChannelSelectMenuBuilder from an existing channel select menu object.
   *
   * @param selectMenu The channel select menu object to copy from
   * @returns A new ChannelSelectMenuBuilder instance
   */
  static from(
    selectMenu: z.input<typeof ChannelSelectMenuEntity>,
  ): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(selectMenu);
  }

  /**
   * Creates a text channel select menu with common settings.
   *
   * @param customId The custom ID for the select menu
   * @param placeholder Optional placeholder text
   * @returns A new ChannelSelectMenuBuilder configured for text channels
   */
  static createForTextChannels(
    customId: string,
    placeholder?: string,
  ): ChannelSelectMenuBuilder {
    const builder = new ChannelSelectMenuBuilder()
      .setCustomId(customId)
      .setChannelTypes([ChannelType.GuildText, ChannelType.GuildAnnouncement]);

    if (placeholder) {
      builder.setPlaceholder(placeholder);
    }

    return builder;
  }

  /**
   * Creates a voice channel select menu with common settings.
   *
   * @param customId The custom ID for the select menu
   * @param placeholder Optional placeholder text
   * @returns A new ChannelSelectMenuBuilder configured for voice channels
   */
  static createForVoiceChannels(
    customId: string,
    placeholder?: string,
  ): ChannelSelectMenuBuilder {
    const builder = new ChannelSelectMenuBuilder()
      .setCustomId(customId)
      .setChannelTypes([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);

    if (placeholder) {
      builder.setPlaceholder(placeholder);
    }

    return builder;
  }

  /**
   * Creates a thread channel select menu with common settings.
   *
   * @param customId The custom ID for the select menu
   * @param placeholder Optional placeholder text
   * @returns A new ChannelSelectMenuBuilder configured for thread channels
   */
  static createForThreads(
    customId: string,
    placeholder?: string,
  ): ChannelSelectMenuBuilder {
    const builder = new ChannelSelectMenuBuilder()
      .setCustomId(customId)
      .setChannelTypes([
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread,
      ]);

    if (placeholder) {
      builder.setPlaceholder(placeholder);
    }

    return builder;
  }

  /**
   * Sets the custom ID of the channel select menu.
   *
   * @param customId The custom ID to set (max 100 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the custom ID is invalid
   */
  setCustomId(customId: string): this {
    try {
      this.#data.custom_id =
        ChannelSelectMenuEntity.shape.custom_id.parse(customId);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the placeholder text of the channel select menu.
   *
   * @param placeholder The placeholder text to set (max 150 characters)
   * @returns This builder instance for method chaining
   * @throws {Error} If the placeholder is invalid
   */
  setPlaceholder(placeholder: string): this {
    try {
      this.#data.placeholder =
        ChannelSelectMenuEntity.shape.placeholder.parse(placeholder);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the minimum number of channels that must be chosen.
   *
   * @param minValues The minimum values to set (0-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the min values is invalid
   */
  setMinValues(minValues: number): this {
    try {
      this.#data.min_values =
        ChannelSelectMenuEntity.shape.min_values.parse(minValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the maximum number of channels that can be chosen.
   *
   * @param maxValues The maximum values to set (1-25)
   * @returns This builder instance for method chaining
   * @throws {Error} If the max values is invalid
   */
  setMaxValues(maxValues: number): this {
    try {
      this.#data.max_values =
        ChannelSelectMenuEntity.shape.max_values.parse(maxValues);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets whether the channel select menu is disabled.
   *
   * @param disabled Whether the select menu should be disabled
   * @returns This builder instance for method chaining
   */
  setDisabled(disabled: boolean): this {
    this.#data.disabled =
      ChannelSelectMenuEntity.shape.disabled.parse(disabled);
    return this;
  }

  /**
   * Sets the channel types that can be selected in the menu.
   *
   * @param types Array of channel types that should be available for selection
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the channel types are invalid
   */
  setChannelTypes(types: ChannelType[]): this {
    try {
      this.#data.channel_types =
        ChannelSelectMenuEntity.shape.channel_types.parse(types);
      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Adds default channels to the select menu.
   *
   * @param channelIds An array of channel IDs to be selected by default
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the channel IDs are invalid
   */
  addDefaultChannels(...channelIds: Snowflake[]): this {
    try {
      const defaultValues = channelIds.map((channelId) => {
        return {
          id: channelId,
          type: "channel" as const,
        };
      });

      // Initialize default_values if it doesn't exist
      if (!this.#data.default_values) {
        this.#data.default_values = [];
      }

      // Add the new default values
      const newDefaultValues = [
        ...(this.#data.default_values || []),
        ...defaultValues,
      ];

      // Validate
      this.#data.default_values =
        ChannelSelectMenuEntity.shape.default_values.parse(newDefaultValues);

      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the default channels for the select menu, replacing any existing defaults.
   *
   * @param channelIds An array of channel IDs to be selected by default
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the channel IDs are invalid
   */
  setDefaultChannels(...channelIds: Snowflake[]): this {
    this.#data.default_values = [];
    return this.addDefaultChannels(...channelIds);
  }

  /**
   * Adds default values to the select menu.
   *
   * @param defaultValues An array of default value objects
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the default values are invalid
   */
  addDefaultValues(
    ...defaultValues: z.input<typeof SelectMenuDefaultValueEntity>[]
  ): this {
    try {
      // Initialize default_values if it doesn't exist
      if (!this.#data.default_values) {
        this.#data.default_values = [];
      }

      // Add the new default values
      const newDefaultValues = [
        ...(this.#data.default_values || []),
        ...defaultValues,
      ];

      // Validate
      this.#data.default_values =
        ChannelSelectMenuEntity.shape.default_values.parse(newDefaultValues);

      return this;
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Sets the default values for the select menu, replacing any existing defaults.
   *
   * @param defaultValues An array of default value objects
   * @returns This builder instance for method chaining
   * @throws {Error} If any of the default values are invalid
   */
  setDefaultValues(
    ...defaultValues: z.input<typeof SelectMenuDefaultValueEntity>[]
  ): this {
    this.#data.default_values = [];
    return this.addDefaultValues(...defaultValues);
  }

  /**
   * Validates and builds the final channel select menu object.
   *
   * @returns The validated channel select menu object ready to be sent to Discord
   * @throws {Error} If the channel select menu fails validation
   */
  build(): ChannelSelectMenuEntity {
    try {
      return ChannelSelectMenuEntity.parse(this.#data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  /**
   * Creates a copy of this ChannelSelectMenuBuilder.
   *
   * @returns A new ChannelSelectMenuBuilder instance with the same data
   */
  clone(): ChannelSelectMenuBuilder {
    return new ChannelSelectMenuBuilder(structuredClone(this.#data));
  }

  /**
   * Returns the JSON representation of the channel select menu data.
   *
   * @returns The channel select menu data as a JSON object
   */
  toJson(): ChannelSelectMenuEntity {
    return structuredClone(ChannelSelectMenuEntity.parse(this.#data));
  }

  /**
   * Checks if the channel select menu is valid according to Discord's requirements.
   *
   * @returns True if the channel select menu is valid, false otherwise
   */
  isValid(): boolean {
    return ChannelSelectMenuEntity.safeParse(this.#data).success;
  }
}
