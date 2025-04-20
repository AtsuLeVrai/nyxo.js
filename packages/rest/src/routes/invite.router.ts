import type {
  InviteEntity,
  InviteMetadataEntity,
  Snowflake,
} from "@nyxjs/core";
import type { Rest } from "../core/index.js";

/**
 * Interface for the query parameters when retrieving an invite.
 *
 * These parameters allow you to request additional information about the invite
 * when fetching it, such as member counts, expiration time, and associated events.
 *
 * @see {@link https://discord.com/developers/docs/resources/invite#get-invite-query-string-params}
 */
export interface GetInviteQuerySchema {
  /**
   * Whether the invite should contain approximate member counts.
   *
   * When true, the response will include:
   * - approximate_presence_count: Number of online members
   * - approximate_member_count: Total number of members
   *
   * This is useful for displaying information about guild activity
   * to potential new members.
   */
  with_counts?: boolean;

  /**
   * Whether the invite should contain the expiration date.
   *
   * When true, the response will include the expires_at field,
   * which contains an ISO8601 timestamp for when the invite expires.
   * Useful for displaying time-limited invites.
   */
  with_expiration?: boolean;

  /**
   * The guild scheduled event to include with the invite.
   *
   * When provided and valid, the response will include guild_scheduled_event data
   * for the specified event. This allows linking directly to a scheduled event
   * when someone joins through this invite.
   */
  guild_scheduled_event_id?: Snowflake;
}

/**
 * Router for Discord Invite-related endpoints.
 *
 * This class provides methods to interact with Discord's invite system,
 * allowing you to retrieve information about invites and delete them.
 * Invites are a key mechanism for users to join guilds, channels, and events.
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
     *
     * @param code - The unique invite code (typically 8 characters)
     * @returns The formatted API route string
     * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
     */
    inviteByCodeEndpoint: (code: string) => `/invites/${code}` as const,
  } as const;

  /** The REST client used to make API requests */
  readonly #rest: Rest;

  /**
   * Creates a new Invite Router instance.
   *
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Fetches detailed information about an invite by its code.
   *
   * This method retrieves comprehensive information about a Discord invite,
   * including its target (guild, channel, and optionally an event),
   * the user who created it, and optionally member counts and expiration time.
   *
   * @param code - The unique invite code (typically 8 characters)
   * @param query - Optional query parameters to include additional data
   * @returns A Promise resolving to the invite object with metadata
   * @throws {Error} Error if the invite doesn't exist or query parameters are invalid
   *
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  fetchInvite(
    code: string,
    query?: GetInviteQuerySchema,
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
   *
   * This method permanently removes an invite link, preventing it from being used
   * for future guild or channel access. Useful for managing access or removing
   * outdated invites.
   *
   * @param code - The unique invite code to delete
   * @param reason - The reason for deleting the invite (for audit logs)
   * @returns A Promise resolving to the deleted invite object
   * @throws {Error} Will throw an error if the invite doesn't exist or you lack permissions
   *
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   *
   * @remarks
   * Requires the MANAGE_CHANNELS permission in the channel or MANAGE_GUILD
   * permission in the guild the invite belongs to.
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
