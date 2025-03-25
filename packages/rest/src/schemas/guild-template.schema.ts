import type { FileInput } from "../handlers/index.js";

/**
 * Interface for creating a new guild from a guild template
 * Defines the required and optional parameters when using a template to create a guild
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export interface CreateGuildFromGuildTemplateSchema {
  /**
   * Name of the guild (2-100 characters)
   * This will be the name of the newly created guild
   *
   * @minLength 2
   * @maxLength 100
   */
  name: string;

  /**
   * Base64 128x128 image for the guild icon
   * Optional image to set as the guild's icon
   *
   * @transform Converted to data URI using FileHandler.toDataUri
   * @optional
   */
  icon?: FileInput;
}

/**
 * Interface for creating a new guild template
 * Defines the parameters required when creating a template from an existing guild
 * Requires the MANAGE_GUILD permission
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export interface CreateGuildTemplateSchema {
  /**
   * Name of the template (1-100 characters)
   * A descriptive name for the template
   *
   * @minLength 1
   * @maxLength 100
   */
  name: string;

  /**
   * Description for the template (0-120 characters)
   * An optional description explaining the template's purpose or content
   *
   * @maxLength 120
   * @nullable
   * @optional
   */
  description?: string | null;
}

/**
 * Interface for modifying an existing guild template
 * Allows updating the name and/or description of a template
 * Requires the MANAGE_GUILD permission
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export type ModifyGuildTemplateSchema = Partial<CreateGuildTemplateSchema>;
