import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export const CreateGuildFromGuildTemplateSchema = z
  .object({
    name: z.string().min(2).max(100),
    icon: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional(),
  })
  .strict();

export type CreateGuildFromGuildTemplateEntity = z.infer<
  typeof CreateGuildFromGuildTemplateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export const CreateGuildTemplateSchema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(120).nullish(),
  })
  .strict();

export type CreateGuildTemplateEntity = z.infer<
  typeof CreateGuildTemplateSchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export const ModifyGuildTemplateSchema = CreateGuildTemplateSchema.partial();

export type ModifyGuildTemplateEntity = z.infer<
  typeof ModifyGuildTemplateSchema
>;
