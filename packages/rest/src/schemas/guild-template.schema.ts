import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export const CreateGuildFromGuildTemplateSchema = z.object({
  name: z.string().min(2).max(100),
  icon: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .optional(),
});

export type CreateGuildFromGuildTemplateSchema = z.input<
  typeof CreateGuildFromGuildTemplateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export const CreateGuildTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(120).nullish(),
});

export type CreateGuildTemplateSchema = z.input<
  typeof CreateGuildTemplateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export const ModifyGuildTemplateSchema = CreateGuildTemplateSchema.partial();

export type ModifyGuildTemplateSchema = z.input<
  typeof ModifyGuildTemplateSchema
>;
