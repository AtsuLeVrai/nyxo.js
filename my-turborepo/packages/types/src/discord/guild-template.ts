import type { FileInput } from "../utils/index.js";
import type { GuildEntity } from "./guild.js";
import type { UserObject } from "./user.js";

/**
 * Discord guild template representing a reusable guild configuration snapshot.
 * Templates allow users to create new guilds based on existing guild structures,
 * including channels, roles, permissions, and other settings.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#guild-template-object} for guild template specification
 */
export interface GuildTemplateObject {
  /** Unique template code used for guild creation */
  readonly code: string;
  /** Display name of the template (1-100 characters) */
  readonly name: string;
  /** Optional description of the template (0-120 characters) */
  readonly description: string | null;
  /** Number of times this template has been used to create guilds */
  readonly usage_count: number;
  /** User ID of the template creator */
  readonly creator_id: string;
  /** User object of the template creator */
  readonly creator: UserObject;
  /** ISO8601 timestamp when template was created */
  readonly created_at: string;
  /** ISO8601 timestamp when template was last synced to source guild */
  readonly updated_at: string;
  /** ID of the guild this template is based on */
  readonly source_guild_id: string;
  /** Partial guild snapshot with placeholder IDs as integers */
  readonly serialized_source_guild: Partial<GuildEntity>;
  /** Whether template has unsynced changes from source guild */
  readonly is_dirty: boolean | null;
}

/**
 * Request parameters for creating a new guild from an existing template.
 * Supports customizing the guild name and icon while preserving template structure.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template} for create guild from template endpoint
 */
export interface CreateGuildFromTemplateJSONParams extends Pick<GuildTemplateObject, "name"> {
  /** Optional guild icon image data */
  readonly icon?: FileInput;
}

/**
 * Request parameters for creating a new guild template from an existing guild.
 * Requires MANAGE_GUILD permission and captures current guild state as template.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template} for create guild template endpoint
 */
export type CreateGuildTemplateJSONParams = Pick<GuildTemplateObject, "name"> &
  Partial<Pick<GuildTemplateObject, "description">>;

/**
 * Request parameters for modifying an existing guild template's metadata.
 * All parameters are optional, allowing partial updates to template properties.
 *
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template} for modify guild template endpoint
 */
export type ModifyGuildTemplateJSONParams = Partial<CreateGuildTemplateJSONParams>;
