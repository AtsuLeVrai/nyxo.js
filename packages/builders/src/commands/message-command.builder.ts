import {
  ApplicationCommandType,
  type MessageApplicationCommandEntity,
} from "@nyxjs/core";
import { ApplicationCommandBuilder } from "./application-command.builder.js";

/**
 * Builder for creating message context menu commands (MESSAGE type).
 *
 * Message commands appear in the context menu when right-clicking or tapping on a message.
 * They do not take any options and will provide the message data in the interaction.
 *
 * @example
 * ```typescript
 * const messageCommand = new MessageCommandBuilder()
 *   .setName('Bookmark')
 *   .setNSFW(false)
 *   .build();
 * ```
 */
export class MessageCommandBuilder extends ApplicationCommandBuilder<
  MessageApplicationCommandEntity,
  MessageCommandBuilder
> {
  /**
   * Creates a new MessageCommandBuilder instance.
   *
   * @param data Optional initial command data
   */
  constructor(data: Partial<MessageApplicationCommandEntity> = {}) {
    super(ApplicationCommandType.Message, data);

    // Message commands require an empty description
    // @ts-expect-error description is a string
    this.data.description = "";
  }

  protected get self(): MessageCommandBuilder {
    return this;
  }

  /**
   * Builds and returns the final message command object.
   *
   * @returns The constructed message command entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): MessageApplicationCommandEntity {
    if (!this.data.name) {
      throw new Error("Command name is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandType.Message;

    // Message commands require an empty description
    // @ts-expect-error description is a string
    this.data.description = "";

    // Message commands don't have options or description localizations
    // @ts-expect-error
    this.data.description_localizations = undefined;
    // @ts-expect-error
    this.data.options = undefined;

    return this.data as MessageApplicationCommandEntity;
  }
}
