import type {
  InviteEntity,
  InviteMetadataEntity,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for the query parameters when retrieving an invite.
 * Defines the optional parameters that can be provided when getting
 * invite details from Discord's API.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export interface GetInviteQuerySchema {
  /**
   * Whether the invite should contain approximate member counts.
   * When true, the response will include approximate_presence_count and approximate_member_count fields.
   */
  with_counts?: boolean;

  /**
   * Whether the invite should contain the expiration date.
   * When true, the response will include the expires_at field.
   */
  with_expiration?: boolean;

  /**
   * The guild scheduled event to include with the invite.
   * When provided and valid, the response will include guild_scheduled_event data.
   */
  guild_scheduled_event_id?: Snowflake;
}

/**
 * Router class for Discord Invite-related endpoints
 * Provides methods to get and delete invites for guilds and channels
 *
 * @see {@link https://discord.com/developers/docs/resources/invite}
 */
export class InviteRouter {
  /**
   * Collection of route URLs for invite-related endpoints
   */
  static readonly ROUTES = {
    /**
     * Route for invite operations
     * @param code - The unique invite code
     * @returns `/invites/{invite.code}` route
     * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
     */
    inviteBase: (code: string) => `/invites/${code}` as const,
  } as const;

  readonly #rest: Rest;

  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Retrieves an invite by its code.
   * Returns information about the invite including guild and channel data.
   *
   * @param code - The unique invite code.
   * @param query - Optional query parameters to include additional data.
   * @returns A Promise resolving to the invite object with metadata.
   * @throws Error if validation of query parameters fails.
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  getInvite(
    code: string,
    query: GetInviteQuerySchema = {},
  ): Promise<InviteEntity & InviteMetadataEntity> {
    return this.#rest.get(InviteRouter.ROUTES.inviteBase(code), {
      query,
    });
  }

  /**
   * Deletes an invite by its code.
   * Requires the MANAGE_CHANNELS permission in the channel or MANAGE_GUILD
   * permission in the guild the invite belongs to.
   *
   * @param code - The unique invite code to delete.
   * @param reason - The reason for deleting the invite (for audit logs).
   * @returns A Promise resolving to the deleted invite object.
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.#rest.delete(InviteRouter.ROUTES.inviteBase(code), {
      reason,
    });
  }
}
