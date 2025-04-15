import type { GuildEntity, GuildTemplateEntity, Snowflake } from "@nyxjs/core";
import type { Rest } from "../core/index.js";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Interface for creating a new guild from a guild template.
 *
 * This interface defines the parameters needed when using a template to
 * create a new guild, including required and optional fields.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export interface CreateGuildFromGuildTemplateSchema {
  /**
   * Name of the guild (2-100 characters).
   *
   * This will be the name of the newly created guild.
   * Must be between 2 and 100 characters in length.
   */
  name: string;

  /**
   * Base64 128x128 image for the guild icon.
   *
   * Optional image to set as the guild's icon.
   * Will be automatically converted to a data URI format.
   * Recommended format is PNG or JPEG, 128x128 pixels.
   */
  icon?: FileInput;
}

/**
 * Interface for creating a new guild template.
 *
 * This interface defines the parameters required when creating a template
 * from an existing guild, allowing for future instantiation of similar guilds.
 *
 * @remarks
 * Requires the MANAGE_GUILD permission.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export interface CreateGuildTemplateSchema {
  /**
   * Name of the template (1-100 characters).
   *
   * A descriptive name for the template that explains its purpose.
   * This name will be displayed when listing templates and when creating guilds.
   */
  name: string;

  /**
   * Description for the template (0-120 characters).
   *
   * An optional description explaining the template's purpose or content.
   * This helps users understand what the template provides.
   * Can be null to remove an existing description.
   */
  description?: string | null;
}

/**
 * Interface for modifying an existing guild template.
 *
 * This interface allows updating the name and/or description of an
 * existing template, making all fields optional.
 *
 * @remarks
 * Requires the MANAGE_GUILD permission.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export type ModifyGuildTemplateSchema = Partial<CreateGuildTemplateSchema>;

/**
 * Router for Discord Guild Template-related endpoints.
 *
 * This class provides methods to interact with Discord's guild template system,
 * allowing users to create preset server configurations that can be easily deployed.
 * Templates capture a guild's structure, including channels, roles, and permissions.
 *
 * @remarks
 * Guild templates are snapshots of guilds that can be used to create new guilds
 * with the same configuration. They're useful for organizations that need to create
 * similar server structures repeatedly, such as for classrooms, gaming communities,
 * or business teams.
 */
export class GuildTemplateRouter {
  /**
   * API route constants for Guild Template-related endpoints.
   */
  static readonly TEMPLATE_ROUTES = {
    /**
     * Base route for guild template operations without a guild context.
     *
     * Used for getting templates by code or creating guilds from templates.
     *
     * @see https://discord.com/developers/docs/resources/guild-template#get-guild-template
     */
    templatesBaseEndpoint: "/guilds/templates",

    /**
     * Route for operations on a specific template by code.
     *
     * Used for fetching information about a template or creating a guild from it.
     *
     * @param code - The unique code of the template
     * @returns The formatted API route string
     * @see https://discord.com/developers/docs/resources/guild-template#get-guild-template
     */
    templateByCodeEndpoint: (code: string) =>
      `/guilds/templates/${code}` as const,

    /**
     * Route for guild templates operations within a specific guild.
     *
     * Used for listing or creating templates in a guild.
     *
     * @param guildId - The ID of the guild
     * @returns The formatted API route string
     * @see https://discord.com/developers/docs/resources/guild-template#get-guild-templates
     */
    guildTemplatesEndpoint: (guildId: Snowflake) =>
      `/guilds/${guildId}/templates` as const,

    /**
     * Route for operations on a specific template within a guild.
     *
     * Used for syncing, modifying, or deleting a specific template.
     *
     * @param guildId - The ID of the guild
     * @param code - The unique code of the template
     * @returns The formatted API route string
     * @see https://discord.com/developers/docs/resources/guild-template#sync-guild-template
     */
    guildTemplateByCodeEndpoint: (guildId: Snowflake, code: string) =>
      `/guilds/${guildId}/templates/${code}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Guild Template Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches a guild template by its code.
   *
   * This method retrieves detailed information about a template using its
   * unique code, without requiring authentication or guild membership.
   *
   * @param code - The template code (unique ID)
   * @returns A promise resolving to a guild template object
   * @throws Will throw an error if the template doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-template}
   *
   * @example
   * ```typescript
   * // Fetch information about a template
   * try {
   *   const template = await templateRouter.fetchGuildTemplate("gg-xyz-123");
   *
   *   console.log(`Template: ${template.name}`);
   *   console.log(`Description: ${template.description || "No description"}`);
   *   console.log(`Created by: ${template.creator.username}`);
   *   console.log(`Created at: ${new Date(template.created_at).toLocaleString()}`);
   *   console.log(`From guild: ${template.source_guild_id}`);
   *
   *   // Check template usage count
   *   console.log(`Used ${template.usage_count} times`);
   *
   *   // Check if it's a verified template
   *   if (template.is_dirty === false) {
   *     console.log("This is a verified template that exactly matches the source guild");
   *   } else {
   *     console.log("This template may be out of sync with the source guild");
   *   }
   * } catch (error) {
   *   console.error("Failed to fetch template:", error);
   * }
   * ```
   */
  fetchGuildTemplate(code: string): Promise<GuildTemplateEntity> {
    return this.#rest.get(
      GuildTemplateRouter.TEMPLATE_ROUTES.templateByCodeEndpoint(code),
    );
  }

  /**
   * Creates a new guild based on a template.
   *
   * This method instantiates a new guild with the channels, roles, and settings
   * defined in the specified template.
   *
   * @param code - The template code (unique ID)
   * @param options - Configuration for the new guild including name and optional icon
   * @returns A promise resolving to the newly created guild object
   * @throws Error if validation of options fails or you've reached the guild limit
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template}
   *
   * @example
   * ```typescript
   * // Create a guild with just a name
   * try {
   *   const newGuild = await templateRouter.createGuildFromTemplate(
   *     "gg-xyz-123", // Template code
   *     {
   *       name: "My New Community"
   *     }
   *   );
   *
   *   console.log(`Guild created with ID: ${newGuild.id}`);
   *   console.log(`Guild has ${newGuild.channels.length} channels`);
   *   console.log(`Guild has ${newGuild.roles.length} roles`);
   * } catch (error) {
   *   console.error("Failed to create guild:", error);
   * }
   *
   * // Create a guild with a custom icon
   * try {
   *   // Load an image file
   *   const iconFile = await FileHandler.fromLocalFile("./guild-icon.png");
   *
   *   const newGuild = await templateRouter.createGuildFromTemplate(
   *     "gg-xyz-123", // Template code
   *     {
   *       name: "My New Community",
   *       icon: iconFile
   *     }
   *   );
   *
   *   console.log(`Guild created with custom icon`);
   * } catch (error) {
   *   console.error("Failed to create guild with icon:", error);
   * }
   * ```
   *
   * @remarks
   * Note: This endpoint can only be used by bots in less than 10 guilds.
   * Users can create guilds from templates directly in the Discord client.
   */
  async createGuildFromTemplate(
    code: string,
    options: CreateGuildFromGuildTemplateSchema,
  ): Promise<GuildEntity> {
    if (options.icon) {
      options.icon = await FileHandler.toDataUri(options.icon);
    }

    return this.#rest.post(
      GuildTemplateRouter.TEMPLATE_ROUTES.templateByCodeEndpoint(code),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Fetches all templates for a guild.
   *
   * This method retrieves all templates that have been created for a specific guild.
   *
   * @param guildId - The ID of the guild to get templates for
   * @returns A promise resolving to an array of guild template objects
   * @throws Will throw an error if you lack permissions or the guild doesn't exist
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#get-guild-templates}
   *
   * @example
   * ```typescript
   * // Fetch all templates for a guild
   * try {
   *   const templates = await templateRouter.fetchGuildTemplates("123456789012345678");
   *
   *   console.log(`Found ${templates.length} templates for this guild`);
   *
   *   // Display information about each template
   *   templates.forEach(template => {
   *     console.log(`- ${template.name} (Code: ${template.code})`);
   *     console.log(`  Description: ${template.description || "None"}`);
   *     console.log(`  Created by: ${template.creator.username}`);
   *     console.log(`  Used ${template.usage_count} times`);
   *     console.log(`  Last synced: ${new Date(template.updated_at).toLocaleString()}`);
   *     console.log('  -----');
   *   });
   * } catch (error) {
   *   console.error("Failed to fetch guild templates:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   */
  fetchGuildTemplates(guildId: Snowflake): Promise<GuildTemplateEntity[]> {
    return this.#rest.get(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplatesEndpoint(guildId),
    );
  }

  /**
   * Creates a new template for the guild.
   *
   * This method takes a snapshot of the current guild configuration
   * and saves it as a template that can be used to create new guilds.
   *
   * @param guildId - The ID of the guild to create a template from
   * @param options - Template configuration including name and optional description
   * @returns A promise resolving to the created guild template object
   * @throws Error if validation of options fails or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template}
   *
   * @example
   * ```typescript
   * // Create a new template with name only
   * try {
   *   const template = await templateRouter.createGuildTemplate(
   *     "123456789012345678", // Guild ID
   *     {
   *       name: "Community Server Template"
   *     }
   *   );
   *
   *   console.log(`Template created with code: ${template.code}`);
   *   console.log(`Use this link to share the template: https://discord.new/${template.code}`);
   * } catch (error) {
   *   console.error("Failed to create template:", error);
   * }
   *
   * // Create a template with name and description
   * try {
   *   const template = await templateRouter.createGuildTemplate(
   *     "123456789012345678", // Guild ID
   *     {
   *       name: "Gaming Community Template",
   *       description: "A template for gaming communities with channels for different games"
   *     }
   *   );
   *
   *   console.log(`Template created with description`);
   * } catch (error) {
   *   console.error("Failed to create template with description:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * A guild can have a maximum of 6 templates.
   */
  createGuildTemplate(
    guildId: Snowflake,
    options: CreateGuildTemplateSchema,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.post(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplatesEndpoint(guildId),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Syncs a template to the guild's current state.
   *
   * This method updates an existing template to match the current
   * configuration of the guild, capturing any changes made since
   * the template was created or last synced.
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to sync
   * @returns A promise resolving to the updated guild template object
   * @throws Will throw an error if the template doesn't exist or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#sync-guild-template}
   *
   * @example
   * ```typescript
   * // Sync a template with the current guild configuration
   * try {
   *   const updatedTemplate = await templateRouter.syncGuildTemplate(
   *     "123456789012345678", // Guild ID
   *     "gg-xyz-123"         // Template code
   *   );
   *
   *   console.log(`Template synced successfully`);
   *   console.log(`Last synced at: ${new Date(updatedTemplate.updated_at).toLocaleString()}`);
   *
   *   // The is_dirty flag should now be false
   *   if (updatedTemplate.is_dirty === false) {
   *     console.log("Template is now in sync with the guild");
   *   }
   * } catch (error) {
   *   console.error("Failed to sync template:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * This updates the template to match the current channels, roles, settings,
   * and permissions of the guild, but does not change the template's name or description.
   */
  syncGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.put(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplateByCodeEndpoint(
        guildId,
        code,
      ),
    );
  }

  /**
   * Updates a guild template's metadata.
   *
   * This method modifies an existing template's name and/or description
   * without changing the captured guild configuration.
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to modify
   * @param options - New properties for the template (name and/or description)
   * @returns A promise resolving to the updated guild template object
   * @throws Error if validation of options fails or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template}
   *
   * @example
   * ```typescript
   * // Update a template's name
   * try {
   *   const updatedTemplate = await templateRouter.updateGuildTemplate(
   *     "123456789012345678", // Guild ID
   *     "gg-xyz-123",        // Template code
   *     {
   *       name: "Updated Template Name"
   *     }
   *   );
   *
   *   console.log(`Template name updated to: ${updatedTemplate.name}`);
   * } catch (error) {
   *   console.error("Failed to update template name:", error);
   * }
   *
   * // Update a template's description
   * try {
   *   const updatedTemplate = await templateRouter.updateGuildTemplate(
   *     "123456789012345678", // Guild ID
   *     "gg-xyz-123",        // Template code
   *     {
   *       description: "This template has been updated with a better description"
   *     }
   *   );
   *
   *   console.log(`Template description updated`);
   * } catch (error) {
   *   console.error("Failed to update template description:", error);
   * }
   *
   * // Remove a template's description
   * try {
   *   const updatedTemplate = await templateRouter.updateGuildTemplate(
   *     "123456789012345678", // Guild ID
   *     "gg-xyz-123",        // Template code
   *     {
   *       description: null
   *     }
   *   );
   *
   *   console.log(`Template description removed`);
   * } catch (error) {
   *   console.error("Failed to remove template description:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * This only updates the template's metadata, not the captured guild configuration.
   * To update the configuration, use syncGuildTemplate instead.
   */
  updateGuildTemplate(
    guildId: Snowflake,
    code: string,
    options: ModifyGuildTemplateSchema,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.patch(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplateByCodeEndpoint(
        guildId,
        code,
      ),
      {
        body: JSON.stringify(options),
      },
    );
  }

  /**
   * Deletes a guild template.
   *
   * This method permanently removes a template from a guild.
   *
   * @param guildId - The ID of the guild containing the template
   * @param code - The code of the template to delete
   * @returns A promise resolving to the deleted guild template object
   * @throws Will throw an error if the template doesn't exist or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/guild-template#delete-guild-template}
   *
   * @example
   * ```typescript
   * // Delete a template
   * try {
   *   const deletedTemplate = await templateRouter.deleteGuildTemplate(
   *     "123456789012345678", // Guild ID
   *     "gg-xyz-123"         // Template code
   *   );
   *
   *   console.log(`Deleted template: ${deletedTemplate.name}`);
   *   console.log(`It was used ${deletedTemplate.usage_count} times before deletion`);
   * } catch (error) {
   *   console.error("Failed to delete template:", error);
   * }
   * ```
   *
   * @remarks
   * Requires the MANAGE_GUILD permission.
   * Once deleted, a template cannot be recovered.
   * The API returns the deleted template object for reference.
   */
  deleteGuildTemplate(
    guildId: Snowflake,
    code: string,
  ): Promise<GuildTemplateEntity> {
    return this.#rest.delete(
      GuildTemplateRouter.TEMPLATE_ROUTES.guildTemplateByCodeEndpoint(
        guildId,
        code,
      ),
    );
  }
}
