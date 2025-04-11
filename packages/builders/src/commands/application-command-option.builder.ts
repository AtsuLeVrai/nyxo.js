import {
  type AnyApplicationCommandOptionEntity,
  APPLICATION_COMMAND_NAME_REGEX,
  type ApplicationCommandOptionType,
  type Locale,
} from "@nyxjs/core";

/**
 * Base abstract builder for creating application command options.
 *
 * Command options are parameters for slash commands that users can input.
 *
 * @template T The option entity type this builder produces
 * @template B The builder type (for method chaining)
 */
export abstract class ApplicationCommandOptionBuilder<
  T extends AnyApplicationCommandOptionEntity,
  B extends ApplicationCommandOptionBuilder<T, B>,
> {
  /** The option data being built */
  protected readonly data: Partial<T>;

  /**
   * Creates a new ApplicationCommandOptionBuilder instance.
   *
   * @param type The type of option to create
   * @param data Optional initial option data
   */
  protected constructor(
    type: ApplicationCommandOptionType,
    data: Partial<T> = {},
  ) {
    this.data = {
      type,
      ...data,
    };
  }

  /**
   * Returns this builder for method chaining.
   * Used internally to ensure correct typing for subclasses.
   */
  protected abstract get self(): B;

  /**
   * Sets the name of the option.
   *
   * Option names must match the regex pattern ^[-_'\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$
   * with the unicode flag set. If there is a lowercase variant of any letters used,
   * the lowercase variant must be used.
   *
   * @param name The name to set (1-32 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If name exceeds 32 characters or doesn't match the regex pattern
   */
  setName(name: string): B {
    if (name.length > 32) {
      throw new Error("Option name cannot exceed 32 characters");
    }

    if (!APPLICATION_COMMAND_NAME_REGEX.test(name)) {
      throw new Error(
        "Option name must match regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$",
      );
    }

    this.data.name = name;
    return this.self;
  }

  /**
   * Sets localization dictionary for the option name.
   *
   * Localized names must follow the same restrictions as the name field.
   *
   * @param localizations Dictionary of localized names by locale
   * @returns This builder instance, for method chaining
   * @throws Error If any localized name exceeds 32 characters or doesn't match the regex pattern
   */
  setNameLocalizations(localizations: Record<Locale, string> | null): B {
    if (localizations) {
      for (const [locale, name] of Object.entries(localizations)) {
        if (name.length > 32) {
          throw new Error(
            `Option name for locale ${locale} cannot exceed 32 characters`,
          );
        }

        if (!APPLICATION_COMMAND_NAME_REGEX.test(name)) {
          throw new Error(
            `Option name for locale ${locale} must match regex pattern ^[-_'\\p{L}\\p{N}\\p{sc=Deva}\\p{sc=Thai}]{1,32}$`,
          );
        }
      }
    }

    this.data.name_localizations = localizations;
    return this.self;
  }

  /**
   * Sets the description of the option.
   *
   * @param description The description to set (1-100 characters)
   * @returns This builder instance, for method chaining
   * @throws Error If description exceeds 100 characters
   */
  setDescription(description: string): B {
    if (description.length > 100) {
      throw new Error("Option description cannot exceed 100 characters");
    }

    this.data.description = description;
    return this.self;
  }

  /**
   * Sets localization dictionary for the option description.
   *
   * Localized descriptions must follow the same restrictions as the description field.
   *
   * @param localizations Dictionary of localized descriptions by locale
   * @returns This builder instance, for method chaining
   * @throws Error If any localized description exceeds 100 characters
   */
  setDescriptionLocalizations(localizations: Record<Locale, string> | null): B {
    if (localizations) {
      for (const [locale, description] of Object.entries(localizations)) {
        if (description.length > 100) {
          throw new Error(
            `Option description for locale ${locale} cannot exceed 100 characters`,
          );
        }
      }
    }

    this.data.description_localizations = localizations;
    return this.self;
  }

  /**
   * Sets whether the option is required.
   *
   * @param required Whether the option is required
   * @returns This builder instance, for method chaining
   */
  setRequired(required = true): B {
    if ("required" in this.data) {
      this.data.required = required;
    }

    return this.self;
  }

  /**
   * Builds and returns the final option object.
   *
   * @returns The constructed option entity
   * @throws Error If required fields are missing or validation fails
   */
  abstract build(): T;

  /**
   * Returns the current option data as a plain object.
   *
   * @returns The current option data
   */
  toJson(): Partial<T> {
    return { ...this.data };
  }
}
