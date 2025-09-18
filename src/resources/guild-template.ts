import type { FileInput } from "../core/index.js";
import type { GuildEntity } from "./guild.js";
import type { UserObject } from "./user.js";

export interface GuildTemplateObject {
  code: string;
  name: string;
  description: string | null;
  usage_count: number;
  creator_id: string;
  creator: UserObject;
  created_at: string;
  updated_at: string;
  source_guild_id: string;
  serialized_source_guild: Partial<GuildEntity>;
  is_dirty: boolean | null;
}

export interface CreateGuildFromTemplateJSONParams extends Pick<GuildTemplateObject, "name"> {
  icon?: FileInput;
}

export type CreateGuildTemplateJSONParams = Pick<GuildTemplateObject, "name"> &
  Partial<Pick<GuildTemplateObject, "description">>;

export type ModifyGuildTemplateJSONParams = Partial<CreateGuildTemplateJSONParams>;

/**
 * Checks if a guild template has unsynced changes
 * @param template The template to check
 * @returns true if the template is dirty
 */
export function isTemplateDirty(template: GuildTemplateObject): boolean {
  return template.is_dirty === true;
}

/**
 * Checks if a guild template was created by a specific user
 * @param template The template to check
 * @param userId The user ID to compare
 * @returns true if the user created the template
 */
export function isTemplateCreatedBy(template: GuildTemplateObject, userId: string): boolean {
  return template.creator_id === userId;
}

/**
 * Gets the age of a guild template in days
 * @param template The template to check
 * @returns age in days
 */
export function getTemplateAge(template: GuildTemplateObject): number {
  const now = new Date();
  const created = new Date(template.created_at);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
