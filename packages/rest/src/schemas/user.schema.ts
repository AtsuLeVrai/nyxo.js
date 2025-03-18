import {
  ApplicationRoleConnectionEntity,
  Snowflake,
  UserEntity,
} from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * Schema for modifying the current user's account settings.
 *
 * All parameters to this endpoint are optional. When changing a username,
 * it may cause the user's discriminator to be randomized.
 *
 * Fires a User Update Gateway event when successful.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export const ModifyCurrentUserSchema = z.object({
  /**
   * User's username.
   * If changed, may cause the user's discriminator to be randomized.
   */
  username: UserEntity.shape.username.optional(),

  /**
   * User's avatar image.
   * If passed, modifies the user's avatar.
   * Accepts file input which will be transformed to a data URI.
   */
  avatar: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),

  /**
   * User's banner image.
   * If passed, modifies the user's banner.
   * Accepts file input which will be transformed to a data URI.
   */
  banner: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri)
    .nullish(),
});

export type ModifyCurrentUserSchema = z.input<typeof ModifyCurrentUserSchema>;

/**
 * Schema for query parameters when getting the current user's guilds.
 *
 * This endpoint returns up to 200 guilds by default, which is the maximum number
 * of guilds a non-bot user can join. For OAuth2, this requires the `guilds` scope.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export const GetCurrentUserGuildsQuerySchema = z.object({
  /**
   * Get guilds before this guild ID.
   * Used for pagination.
   */
  before: Snowflake.optional(),

  /**
   * Get guilds after this guild ID.
   * Used for pagination.
   */
  after: Snowflake.optional(),

  /**
   * Maximum number of guilds to return (1-200).
   * Defaults to 200 if not specified.
   */
  limit: z.number().int().default(200),

  /**
   * Whether to include approximate member and presence counts in the response.
   * Defaults to false if not specified.
   */
  with_counts: z.boolean().default(false),
});

export type GetCurrentUserGuildsQuerySchema = z.input<
  typeof GetCurrentUserGuildsQuerySchema
>;

/**
 * Schema for creating a new group DM channel with multiple users.
 *
 * This endpoint was intended to be used with the now-deprecated GameBridge SDK.
 * It is limited to 10 active group DMs.
 *
 * Fires a Channel Create Gateway event when successful.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export const CreateGroupDmSchema = z.object({
  /**
   * Access tokens of users that have granted your app the `gdm.join` scope.
   * Must include at least 2 and no more than 10 users.
   */
  access_tokens: z.string().array().min(2).max(10),

  /**
   * A dictionary mapping user IDs to their respective nicknames in the group DM.
   */
  nicks: z.record(Snowflake, z.string()),
});

export type CreateGroupDmSchema = z.input<typeof CreateGroupDmSchema>;

/**
 * Schema for updating the current user's application role connection.
 *
 * Updates and returns the application role connection for the user.
 * Requires an OAuth2 access token with `role_connections.write` scope for the application.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export const UpdateCurrentUserApplicationRoleConnectionSchema = z.object({
  /**
   * The vanity name of the platform a bot has connected (max 50 characters).
   * Reuses the validation from ApplicationRoleConnectionEntity.
   */
  platform_name: ApplicationRoleConnectionEntity.shape.platform_name
    .unwrap()
    .max(50)
    .optional(),

  /**
   * The username on the platform a bot has connected (max 100 characters).
   * Reuses the validation from ApplicationRoleConnectionEntity.
   */
  platform_username: ApplicationRoleConnectionEntity.shape.platform_username
    .unwrap()
    .max(100)
    .optional(),

  /**
   * Object mapping application role connection metadata keys to their string value (max 100 characters).
   * Reuses the validation from ApplicationRoleConnectionEntity.
   */
  metadata: z.record(z.string().max(100), z.string().max(100)).optional(),
});

export type UpdateCurrentUserApplicationRoleConnectionSchema = z.input<
  typeof UpdateCurrentUserApplicationRoleConnectionSchema
>;
