import {
  ApplicationCommandType,
  type UserApplicationCommandEntity,
} from "@nyxjs/core";
import { ApplicationCommandBuilder } from "./application-command.builder.js";

/**
 * Builder for creating user context menu commands (USER type).
 *
 * User commands appear in the context menu when right-clicking or tapping on a user.
 * They do not take any options and will provide the user data in the interaction.
 *
 * @example
 * ```typescript
 * const userCommand = new UserCommandBuilder()
 *   .setName('Get Avatar')
 *   .setDefaultMemberPermissions('1073741824') // MANAGE_MESSAGES permission
 *   .build();
 * ```
 */
export class UserCommandBuilder extends ApplicationCommandBuilder<
  UserApplicationCommandEntity,
  UserCommandBuilder
> {
  /**
   * Creates a new UserCommandBuilder instance.
   *
   * @param data Optional initial command data
   */
  constructor(data: Partial<UserApplicationCommandEntity> = {}) {
    super(ApplicationCommandType.User, data);

    // User commands require an empty description
    // @ts-expect-error : This is safe because we're creating the same class type
    this.data.description = "";
  }

  protected get self(): UserCommandBuilder {
    return this;
  }

  /**
   * Builds and returns the final user command object.
   *
   * @returns The constructed user command entity
   * @throws Error If required fields are missing or validation fails
   */
  build(): UserApplicationCommandEntity {
    if (!this.data.name) {
      throw new Error("Command name is required");
    }

    // Ensure type is set correctly
    this.data.type = ApplicationCommandType.User;

    // User commands require an empty description
    // @ts-expect-error : This is safe because we're creating the same class type
    this.data.description = "";

    // User commands don't have options or description localizations
    // @ts-expect-error : This is safe because we're creating the same class type
    this.data.description_localizations = undefined;
    // @ts-expect-error : This is safe because we're creating the same class type
    this.data.options = undefined;

    return this.data as UserApplicationCommandEntity;
  }
}
