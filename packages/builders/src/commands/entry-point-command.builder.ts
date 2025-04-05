import {
  type ApplicationCommandEntryPointType,
  ApplicationCommandType,
  type EntryPointApplicationCommandEntity,
} from "@nyxjs/core";
import { ApplicationCommandBuilder } from "./application-command.builder.js";

/**
 * Builder for creating entry point commands (PRIMARY_ENTRY_POINT type).
 *
 * Entry point commands serve as the primary way for users to open an app's Activity
 * from the App Launcher. For the Entry Point command to be visible to users,
 * an app must have Activities enabled.
 *
 * @example
 * ```typescript
 * const entryPointCommand = new EntryPointCommandBuilder()
 *   .setName('Launch Game')
 *   .setDescription('Launch the awesome game')
 *   .setHandler(ApplicationCommandEntryPointType.DiscordLaunchActivity)
 *   .build();
 * ```
 */
export class EntryPointCommandBuilder extends ApplicationCommandBuilder<
  EntryPointApplicationCommandEntity,
  EntryPointCommandBuilder
> {
  /**
   * Creates a new EntryPointCommandBuilder instance.
   *
   * @param data Optional initial command data
   */
  constructor(data: Partial<EntryPointApplicationCommandEntity> = {}) {
    super(ApplicationCommandType.PrimaryEntryPoint, data);
  }

  protected get self(): EntryPointCommandBuilder {
    return this;
  }

  /**
   * Sets the description of the command.
   *
   * @param description The description to set (1-100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If description exceeds 100 characters
   *
   * @example
   * ```typescript
   * new EntryPointCommandBuilder()
   *   .setDescription('Launch the awesome game')
   * ```
   */
  setDescription(description: string): this {
    if (description.length > 100) {
      throw new Error("Command description cannot exceed 100 characters");
    }

    this.data.description = description;
    return this;
  }

  /**
   * Sets the handler type for the entry point command.
   * Determines how the interaction will be handled when the command is used.
   *
   * - AppHandler (1): The app is responsible for responding to the interaction using an interaction token.
   * - DiscordLaunchActivity (2): Discord handles the interaction automatically by launching the associated
   *   Activity and sending a message to the channel where it was launched.
   *
   * @param handler The handler type to set
   * @returns This builder instance, for method chaining
   *
   * @example
   * ```typescript
   * import { ApplicationCommandEntryPointType } from "@nyxjs/core";
   *
   * new EntryPointCommandBuilder()
   *   .setHandler(ApplicationCommandEntryPointType.DiscordLaunchActivity)
   * ```
   */
  setHandler(handler: ApplicationCommandEntryPointType): this {
    this.data.handler = handler;
    return this;
  }

  /**
   * Builds and returns the final entry point command object.
   *
   * @returns The constructed entry point command entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): EntryPointApplicationCommandEntity {
    if (!this.data.name) {
      throw new Error("Command name is required");
    }

    if (!this.data.description) {
      throw new Error("Command description is required");
    }

    if (!this.data.handler) {
      throw new Error("Command handler is required for entry point commands");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandType.PrimaryEntryPoint;

    // Entry point commands don't have options
    // @ts-expect-error: This is safe because we are setting it to undefined
    this.data.options = undefined;

    return this.data as EntryPointApplicationCommandEntity;
  }
}
