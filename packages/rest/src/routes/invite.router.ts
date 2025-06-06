import type {
  InviteEntity,
  InviteMetadataEntity,
  Snowflake,
} from "@nyxojs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for the query parameters when retrieving an invite.
 * Allows requesting additional information about the invite.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export interface InviteFetchParams {
  /**
   * Whether the invite should contain approximate member counts.
   * When true, includes presence and member counts.
   */
  with_counts?: boolean;

  /**
   * Whether the invite should contain the expiration date.
   * When true, includes the expires_at field.
   */
  with_expiration?: boolean;

  /**
   * The guild scheduled event to include with the invite.
   * When provided, includes event data with the invite.
   */
  guild_scheduled_event_id?: Snowflake;
}

/**
 * Router for Discord Invite-related endpoints.
 * Provides methods to retrieve and delete invite links.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite}
 */
export class InviteRouter {
  /**
   * API route constants for invite-related endpoints.
   */
  static readonly INVITE_ROUTES = {
    /**
     * Route for invite operations.
     * @param code - The unique invite code
     */
    inviteByCodeEndpoint: (code: string) => `/invites/${code}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches detailed information about an invite by its code.
   * Retrieves invite data including target and creator information.
   *
   * @param code - The unique invite code (typically 8 characters)
   * @param query - Optional query parameters for additional data
   * @returns A Promise resolving to the invite object with metadata
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  fetchInvite(
    code: string,
    query?: InviteFetchParams,
  ): Promise<InviteEntity & InviteMetadataEntity> {
    return this.#rest.get(
      InviteRouter.INVITE_ROUTES.inviteByCodeEndpoint(code),
      {
        query,
      },
    );
  }

  /**
   * Deletes an invite by its code.
   * Permanently removes an invite link, preventing future use.
   *
   * @param code - The unique invite code to delete
   * @param reason - The reason for deleting the invite (for audit logs)
   * @returns A Promise resolving to the deleted invite object
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.#rest.delete(
      InviteRouter.INVITE_ROUTES.inviteByCodeEndpoint(code),
      {
        reason,
      },
    );
  }
}
