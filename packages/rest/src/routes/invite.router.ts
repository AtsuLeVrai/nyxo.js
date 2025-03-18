import type { InviteEntity, InviteMetadataEntity } from "@nyxjs/core";
import { fromZodError } from "zod-validation-error";
import type { Rest } from "../core/index.js";
import { GetInviteQuerySchema } from "../schemas/index.js";

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

  /** The REST client used to make requests to the Discord API */
  readonly #rest: Rest;

  /**
   * Creates a new InviteRouter instance
   * @param rest - The REST client used to make requests to the Discord API
   */
  constructor(rest: Rest) {
    this.#rest = rest;
  }

  /**
   * Retrieves an invite by its code
   * Returns information about the invite including guild and channel data
   *
   * @param code - The unique invite code
   * @param query - Optional query parameters to include additional data
   * @param query.with_counts - Whether to include approximate member counts
   * @param query.with_expiration - Whether to include the expiration date
   * @param query.guild_scheduled_event_id - The guild scheduled event to include
   * @returns A Promise resolving to the invite object with metadata
   * @throws Error if validation of query parameters fails
   * @see {@link https://discord.com/developers/docs/resources/invite#get-invite}
   */
  getInvite(
    code: string,
    query: GetInviteQuerySchema = {},
  ): Promise<InviteEntity & InviteMetadataEntity> {
    const result = GetInviteQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error(fromZodError(result.error).message);
    }

    return this.#rest.get(InviteRouter.ROUTES.inviteBase(code), {
      query: result.data,
    });
  }

  /**
   * Deletes an invite by its code
   * Requires the MANAGE_CHANNELS permission in the channel or MANAGE_GUILD
   * permission in the guild the invite belongs to
   *
   * @param code - The unique invite code to delete
   * @param reason - The reason for deleting the invite (for audit logs)
   * @returns A Promise resolving to the deleted invite object
   * @see {@link https://discord.com/developers/docs/resources/invite#delete-invite}
   */
  deleteInvite(code: string, reason?: string): Promise<InviteEntity> {
    return this.#rest.delete(InviteRouter.ROUTES.inviteBase(code), {
      reason,
    });
  }
}
