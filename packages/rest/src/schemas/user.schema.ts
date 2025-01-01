import { SnowflakeSchema } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export const ModifyCurrentUserSchema = z
  .object({
    username: z.string().optional(),
    avatar: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
    banner: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .nullish(),
  })
  .strict();

export type ModifyCurrentUserEntity = z.infer<typeof ModifyCurrentUserSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export const GetCurrentUserGuildsQuerySchema = z
  .object({
    before: SnowflakeSchema.optional(),
    after: SnowflakeSchema.optional(),
    limit: z.number().int().default(200).optional(),
    with_counts: z.boolean().default(false).optional(),
  })
  .strict();

export type GetCurrentUserGuildsQueryEntity = z.infer<
  typeof GetCurrentUserGuildsQuerySchema
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export const CreateGroupDmSchema = z
  .object({
    access_tokens: z.array(z.string()).min(2).max(10),
    nicks: z.record(SnowflakeSchema, z.string()),
  })
  .strict();

export type CreateGroupDmEntity = z.infer<typeof CreateGroupDmSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export const UpdateCurrentUserApplicationRoleConnectionSchema = z
  .object({
    platform_name: z.string().max(50).optional(),
    platform_username: z.string().max(100).optional(),
    metadata: z.record(z.string().max(100), z.string().max(100)).optional(),
  })
  .strict();

export type UpdateCurrentUserApplicationRoleConnectionEntity = z.infer<
  typeof UpdateCurrentUserApplicationRoleConnectionSchema
>;
