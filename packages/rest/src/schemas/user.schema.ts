import { SnowflakeManager } from "@nyxjs/core";
import { z } from "zod";

export const ModifyCurrentUserSchema = z
  .object({
    username: z.string().optional(),
    avatar: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional()
      .nullable(),
    banner: z
      .string()
      .regex(/^data:image\/(jpeg|png|gif);base64,/)
      .optional()
      .nullable(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export type ModifyCurrentUserEntity = z.infer<typeof ModifyCurrentUserSchema>;

export const GetCurrentUserGuildsQuerySchema = z
  .object({
    before: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    after: z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX).optional(),
    limit: z.number().int().default(200).optional(),
    with_counts: z.boolean().default(false).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export type GetCurrentUserGuildsQueryEntity = z.infer<
  typeof GetCurrentUserGuildsQuerySchema
>;

export const CreateGroupDmSchema = z
  .object({
    access_tokens: z.array(z.string()).min(2).max(10),
    nicks: z.record(
      z.string().regex(SnowflakeManager.SNOWFLAKE_REGEX),
      z.string(),
    ),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export type CreateGroupDmEntity = z.infer<typeof CreateGroupDmSchema>;

export const UpdateCurrentUserApplicationRoleConnectionSchema = z
  .object({
    platform_name: z.string().max(50).optional(),
    platform_username: z.string().max(100).optional(),
    metadata: z.record(z.string().max(100), z.string().max(100)).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export type UpdateCurrentUserApplicationRoleConnectionEntity = z.infer<
  typeof UpdateCurrentUserApplicationRoleConnectionSchema
>;
