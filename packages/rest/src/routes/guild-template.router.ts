import type { GuildEntity, GuildTemplateEntity, Snowflake } from "@nyxojs/core";
import { BaseRouter } from "../bases/index.js";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for creating a new guild from a guild template.
 * Defines required and optional parameters for creating a guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export interface GuildFromTemplateCreateOptions {
  /**
   * Name of the guild (2-100 characters).
   * This will be the name of the newly created guild.
   */
  name: string;

  /**
   * Base64 128x128 image for the guild icon.
   * Optional image to set as the guild's icon.
   */
  icon?: FileInput;
}

/**
 * Interface for creating a new guild template.
 * Defines parameters for creating a template from an existing guild.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export interface GuildTemplateCreateOptions {
  /**
   * Name of the template (1-100 characters).
   * A descriptive name explaining its purpose.
   */
  name: string;

  /**
   * Description for the template (0-120 characters).
   * Optional description explaining the template's purpose.
   */
  description?: string | null;
}

/**
 * Interface for modifying an existing guild template.
 * Makes all fields optional for updating name and/or description.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export type GuildTemplateUpdateOptions = Partial<GuildTemplateCreateOptions>;

/**
 * Router for Discord Guild Template-related endpoints.
 * Provides methods to manage preset guild configurations.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template}
 */
export class GuildTemplateRouter extends BaseRouter {
  /**
   * API route constants for Guild Template-related endpoints.
   */
  static readonly TEMPLATE_ROUTES = {
    /** Base route for template operations without guild context */
    templatesBaseEndpoint: "/guilds/templates",

    /**
     * Route for operations on a specific template by code.
     * @param code - The unique code of the template
     */
    templateByCodeEndpoint: (code: string) =>
      `/guilds/templates/${code}` as const,

    /**
     * Route for guild templates operations within a specific guild.
     * @param guildId - The ID of the guild
     */
    guildTemplatesEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/templates` as const,

    /**
     * Route for operations on a specific template within a guild.
     * @param guildId - The ID of the guild
     * @param code - The unique code of the template
     */
    guildTemplateByCodeEndpoint: (guildId: Snowflake, code: string) =>
      `/guilds/${guildId}/templates/${code}` as const,
  } as const;

  /**
   * Fetches a guild template by its code.
   * Retrieves template information using its unique code.
   *
   * @param code - The template code (unique ID)
   * @returns A promise resolving to a guild template object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   */
  fetchGuildTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.get(
      GuildTemplateRouter.TEMPLATE_ROUTES.templateByCodeEndpoint(code),
    );
  }

  /**
   * Creates a new guild based on a template.
   * Instantiates a guild with the channels, roles, and settings from the template.
   *
   * @param code - The template code (unique ID)
   * @param options - Configuration for the new guild
   * @returns A promise resolving to the newly created guild object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   */
  async createGuildFromTemplate(
    code: string,
    options: GuildFromTemplateCreateOptions,
  ): Promise<GuildEntity> {
    const fileFields: (keyof GuildFromTemplateCreateOptions)[] = ["icon"];
    const processedOptions = await this.prepareBodyWithFiles(
      options,
      fileFields,
    );

    return this.post(
      GuildTemplateRouter.TEMPLATE_ROUTES.templateByCodeEndpoint(code),
      processedOptions,
    );
  }

  /**
   * Fetches all templates for a guild.
   * Retrieves all templates created for a specific guild.
   *
   * @param guildId - The ID of the guild to get templates for
   * @returns A promise resolving to an array of guild template objects
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  fetchGuildTemplates(guildId: Snowflake): Promise<GuildTemplateEntity[]> {
    return this.get(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplatesEndpoint(guildId),
    );
  }

  /**
   * Creates a new template for the guild.
   * Takes a snapshot of the current guild configuration as a template.
   *
   * @param guildId - The ID of the guild to create a template from
   * @param options - Template configuration with name and description
   * @returns A promise resolving to the created guild template object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   */
  createGuildTemplate(
    guildId: Snowflake,
    options: GuildTemplateCreateOptions,
  ): Promise<GuildTemplateEntity> {
    return this.post(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplatesEndpoint(guildId),
      options,
    );
  }

  /**
   * Syncs a template to the guild's current state.
   * Updates an existing template to match the current guild configuration.
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to sync
   * @returns A promise resolving to the updated guild template object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template}
   */
  syncGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.put(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplateByCodeEndpoint(
        guildId,
        code,
      ),
    );
  }

  /**
   * Updates a guild template's metadata.
   * Modifies a template's name and/or description.
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to modify
   * @param options - New properties for the template
   * @returns A promise resolving to the updated guild template object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   */
  updateGuildTemplate(
    guildId: Snowflake,
    code: string,
    options: GuildTemplateUpdateOptions,
  ): Promise<GuildTemplateEntity> {
    return this.patch(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplateByCodeEndpoint(
        guildId,
        code,
      ),
      options,
    );
  }

  /**
   * Deletes a guild template.
   * Permanently removes a template from a guild.
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to delete
   * @returns A promise resolving to the deleted guild template object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   */
  deleteGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.delete(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplateByCodeEndpoint(
        guildId,
        code,
      ),
    );
  }
}
