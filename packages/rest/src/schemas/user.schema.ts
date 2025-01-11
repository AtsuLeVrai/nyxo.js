import { Snowflake } from "@nyxjs/core";
import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export const ModifyCurrentUserEntity = z
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

export type ModifyCurrentUserEntity = z.infer<typeof ModifyCurrentUserEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export const GetCurrentUserGuildsQueryEntity = z
  .object({
    before: Snowflake.optional(),
    after: Snowflake.optional(),
    limit: z.number().int().optional().default(200),
    with_counts: z.boolean().optional().default(false),
  })
  .strict();

export type GetCurrentUserGuildsQueryEntity = z.infer<
  typeof GetCurrentUserGuildsQueryEntity
>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export const CreateGroupDmEntity = z
  .object({
    access_tokens: z.array(z.string()).min(2).max(10),
    nicks: z.record(Snowflake, z.string()),
  })
  .strict();

export type CreateGroupDmEntity = z.infer<typeof CreateGroupDmEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export const UpdateCurrentUserApplicationRoleConnectionEntity = z
  .object({
    platform_name: z.string().max(50).optional(),
    platform_username: z.string().max(100).optional(),
    metadata: z.record(z.string().max(100), z.string().max(100)).optional(),
  })
  .strict();

export type UpdateCurrentUserApplicationRoleConnectionEntity = z.infer<
  typeof UpdateCurrentUserApplicationRoleConnectionEntity
>;
