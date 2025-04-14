import type { GuildEntity, GuildTemplateEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

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
   */
  name: string;

  /**
   * Base64 128x128 image for the guild icon
   * Optional image to set as the guild's icon
   * Will be converted to a data URI
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
   */
  name: string;

  /**
   * Description for the template (0-120 characters)
   * An optional description explaining the template's purpose or content
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

/**
 * Router class for Guild Template-related endpoints in the Discord API
 * Provides methods to interact with guild templates, which are snapshots of guilds
 * that can be used to create new guilds based on existing ones
 */
export class GuildTemplateRouter {
  /**
   * Collection of route URLs for Guild Template-related endpoints
   */
  static readonly ROUTES = {
    /**
     * Base route for guild template operations without a guild context
     * @see https://discord.com/developers/docs/resources/guild-template#get-guild-template
     */
    guildTemplatesDefault: "/guilds/templates" as const,

    /**
     * Route for operations on a specific template by code
     * @param code - The unique code of the template
     * @returns Route for the specified template
     * @see https://discord.com/developers/docs/resources/guild-template#get-guild-template
     */
    guildTemplateDefault: (code: string) =>
      `/guilds/templates/${code}` as const,

    /**
     * Route for guild templates operations within a specific guild
     * @param guildId - The ID of the guild
     * @returns Route for templates in the specified guild
     * @see https://discord.com/developers/docs/resources/guild-template#get-guild-templates
     */
    guildTemplates: (guildId: Snowflake) =>
      `/guilds/${guildId}/templates` as const,

    /**
     * Route for operations on a specific template within a guild
     * @param guildId - The ID of the guild
     * @param code - The unique code of the template
     * @returns Route for the specified template in the guild
     * @see https://discord.com/developers/docs/resources/guild-template#sync-guild-template
     */
    guildTemplate: (guildId: Snowflake, code: string) =>
      `/guilds/${guildId}/templates/${code}` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Retrieves a guild template by its code
   *
   * @param code - The template code (unique ID)
   * @returns A guild template object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   */
  getGuildTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.#rest.get(
      GuildTemplateRouter.ROUTES.guildTemplateDefault(code),
    );
  }

  /**
   * Creates a new guild based on a template
   * Note: This endpoint can only be used by bots in less than 10 guilds
   *
   * @param code - The template code (unique ID)
   * @param options - Configuration for the new guild including name and optional icon
   * @returns The newly created guild object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   */
  async createGuildFromGuildTemplate(
    code: string,
    options: CreateGuildFromGuildTemplateSchema,
  ): Promise<GuildEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    return this.#rest.post(
      GuildTemplateRouter.ROUTES.guildTemplateDefault(code),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Retrieves all templates for a guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild to get templates for
   * @returns An array of guild template objects
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   */
  getGuildTemplates(guildId: Snowflake): Promise<GuildTemplateEntity[]> {
    return this.#rest.get(GuildTemplateRouter.ROUTES.guildTemplates(guildId));
  }

  /**
   * Creates a new template for the guild
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild to create a template from
   * @param options - Template configuration including name and optional description
   * @returns The created guild template object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   */
  createGuildTemplate(
    guildId: Snowflake,
    options: CreateGuildTemplateSchema,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.post(GuildTemplateRouter.ROUTES.guildTemplates(guildId), {
      body: JSON.stringify(options),
    });
  }

  /**
   * Syncs a template to the guild's current state
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to sync
   * @returns The updated guild template object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template}
   */
  syncGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.put(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
    );
  }

  /**
   * Modifies a guild template's metadata
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to modify
   * @param options - New properties for the template (name and/or description)
   * @returns The updated guild template object
   * @throws Error if validation of options fails
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   */
  modifyGuildTemplate(
    guildId: Snowflake,
    code: string,
    options: ModifyGuildTemplateSchema,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.patch(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Deletes a guild template
   * Requires the MANAGE_GUILD permission
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to delete
   * @returns The deleted guild template object
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   */
  deleteGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.delete(
      GuildTemplateRouter.ROUTES.guildTemplate(guildId, code),
    );
  }
}
