import type { GuildTemplateEntity } from "@nyxjs/core";
import type { ImageData } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export interface CreateFromTemplateEntity
  extends Pick<GuildTemplateEntity, "name"> {
  icon?: ImageData;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export type CreateTemplateEntity = Pick<
  GuildTemplateEntity,
  "name" | "description"
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export type ModifyTemplateEntity = Partial<
  Pick<GuildTemplateEntity, "name" | "description">
>;
