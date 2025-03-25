import type { Snowflake } from "@nyxjs/core";
import type { FileInput } from "../handlers/index.js";

/**
 * Interface for modifying the current user's account settings.
 *
 * All parameters to this endpoint are optional. When changing a username,
 * it may cause the user's discriminator to be randomized.
 *
 * Fires a User Update Gateway event when successful.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#modify-current-user-json-params}
 */
export interface ModifyCurrentUserSchema {
  /**
   * User's username.
   * If changed, may cause the user's discriminator to be randomized.
   *
   * @minLength 2
   * @maxLength 32
   * @validate Username contains forbidden characters or is a reserved name
   */
  username?: string;

  /**
   * User's avatar image.
   * If passed, modifies the user's avatar.
   * Accepts file input which will be transformed to a data URI.
   *
   * @transform Converted to data URI
   * @nullable
   */
  avatar?: FileInput | null;

  /**
   * User's banner image.
   * If passed, modifies the user's banner.
   * Accepts file input which will be transformed to a data URI.
   *
   * @transform Converted to data URI
   * @nullable
   */
  banner?: FileInput | null;
}

/**
 * Interface for query parameters when getting the current user's guilds.
 *
 * This endpoint returns up to 200 guilds by default, which is the maximum number
 * of guilds a non-bot user can join. For OAuth2, this requires the `guilds` scope.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#get-current-user-guilds-query-string-params}
 */
export interface GetCurrentUserGuildsQuerySchema {
  /**
   * Get guilds before this guild ID.
   * Used for pagination.
   */
  before?: Snowflake;

  /**
   * Get guilds after this guild ID.
   * Used for pagination.
   */
  after?: Snowflake;

  /**
   * Maximum number of guilds to return (1-200).
   * Defaults to 200 if not specified.
   *
   * @default 200
   */
  limit?: number;

  /**
   * Whether to include approximate member and presence counts in the response.
   * Defaults to false if not specified.
   *
   * @default false
   */
  with_counts?: boolean;
}

/**
 * Interface for creating a new group DM channel with multiple users.
 *
 * This endpoint was intended to be used with the now-deprecated GameBridge SDK.
 * It is limited to 10 active group DMs.
 *
 * Fires a Channel Create Gateway event when successful.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#create-group-dm-json-params}
 */
export interface CreateGroupDmSchema {
  /**
   * Access tokens of users that have granted your app the `gdm.join` scope.
   * Must include at least 2 and no more than 10 users.
   *
   * @minItems 2
   * @maxItems 10
   */
  access_tokens: string[];

  /**
   * A dictionary mapping user IDs to their respective nicknames in the group DM.
   */
  nicks: Record<Snowflake, string>;
}

/**
 * Interface for updating the current user's application role connection.
 *
 * Updates and returns the application role connection for the user.
 * Requires an OAuth2 access token with `role_connections.write` scope for the application.
 *
 * @see {@link https://discord.com/developers/docs/resources/user#update-current-user-application-role-connection-json-params}
 */
export interface UpdateCurrentUserApplicationRoleConnectionSchema {
  /**
   * The vanity name of the platform a bot has connected (max 50 characters).
   *
   * @maxLength 50
   * @nullable
   */
  platform_name?: string | null;

  /**
   * The username on the platform a bot has connected (max 100 characters).
   *
   * @maxLength 100
   * @nullable
   */
  platform_username?: string | null;

  /**
   * Object mapping application role connection metadata keys to their string value.
   * Both keys and values have a maximum length of 100 characters.
   *
   * @elementMaxLength 100
   */
  metadata?: Record<string, string>;
}
