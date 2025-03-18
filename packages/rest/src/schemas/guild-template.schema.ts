import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Schema for creating a new guild from a guild template
 * Defines the required and optional parameters when using a template to create a guild
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export const CreateGuildFromGuildTemplateSchema = z.object({
  /**
   * Name of the guild (2-100 characters)
   * This will be the name of the newly created guild
   */
  name: z.string().min(2).max(100),

  /**
   * Base64 128x128 image for the guild icon
   * Optional image to set as the guild's icon
   */
  icon: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .optional(),
});

export type CreateGuildFromGuildTemplateSchema = z.input<
  typeof CreateGuildFromGuildTemplateSchema
>;

/**
 * Schema for creating a new guild template
 * Defines the parameters required when creating a template from an existing guild
 * Requires the MANAGE_GUILD permission
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export const CreateGuildTemplateSchema = z.object({
  /**
   * Name of the template (1-100 characters)
   * A descriptive name for the template
   */
  name: z.string().min(1).max(100),

  /**
   * Description for the template (0-120 characters)
   * An optional description explaining the template's purpose or content
   */
  description: z.string().max(120).nullish(),
});

export type CreateGuildTemplateSchema = z.input<
  typeof CreateGuildTemplateSchema
>;

/**
 * Schema for modifying an existing guild template
 * Allows updating the name and/or description of a template
 * Requires the MANAGE_GUILD permission
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export const ModifyGuildTemplateSchema = CreateGuildTemplateSchema.partial();

export type ModifyGuildTemplateSchema = z.input<
  typeof ModifyGuildTemplateSchema
>;
