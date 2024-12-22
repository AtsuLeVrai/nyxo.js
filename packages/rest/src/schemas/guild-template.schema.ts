import { z } from "zod";

export const CreateGuildFromGuildTemplateSchema = z
  .object({
    name: z.string().min(2).max(100),
    icon: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template-json-params}
 */
export type CreateGuildFromGuildTemplateEntity = z.infer<
  typeof CreateGuildFromGuildTemplateSchema
>;

export const CreateGuildTemplateSchema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(120).optional().nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#create-guild-template-json-params}
 */
export type CreateGuildTemplateEntity = z.infer<
  typeof CreateGuildTemplateSchema
>;

export const ModifyGuildTemplateSchema = CreateGuildTemplateSchema.partial();

/**
 * @see {@link https://discord.com/developers/docs/resources/guild-template#modify-guild-template-json-params}
 */
export type ModifyGuildTemplateEntity = z.infer<
  typeof ModifyGuildTemplateSchema
>;
