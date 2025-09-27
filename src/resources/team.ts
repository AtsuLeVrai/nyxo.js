import type { UserObject } from "./user.js";

/**
 * User membership status within a Discord developer team.
 * Indicates whether a team invitation has been accepted or is still pending.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum} for membership state specification
 */
export enum MembershipState {
  /** User has been invited to the team but has not yet accepted */
  Invited = 1,
  /** User has accepted the team invitation and is an active member */
  Accepted = 2,
}

/**
 * Role types that define access levels and permissions within a Discord developer team.
 * Each role inherits permissions from roles below it in the hierarchy.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#team-member-roles-team-member-role-types} for role permissions specification
 */
export enum TeamMemberRole {
  /**
   * Admin role with extensive permissions except destructive actions.
   * Can manage team members and configure team-owned applications.
   */
  Admin = "admin",
  /**
   * Developer role with application access and limited configuration permissions.
   * Can access secrets and configure interaction endpoints but cannot manage team.
   */
  Developer = "developer",
  /**
   * Read-only role with view-only access to team and application information.
   * Can export payout records and invite bots from private team-owned apps.
   */
  ReadOnly = "read_only",
}

/**
 * Individual team member information including user details, role, and membership status.
 * Contains partial user data and team-specific membership information.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object} for team member specification
 */
export interface TeamMemberObject {
  /** Current membership status indicating invitation or acceptance state */
  readonly membership_state: MembershipState;
  /** Unique identifier of the parent team */
  readonly team_id: string;
  /** Partial user object containing essential identity information */
  readonly user: Pick<UserObject, "id" | "username" | "discriminator" | "avatar">;
  /** Team role determining permissions and access level */
  readonly role: TeamMemberRole;
}

/**
 * Discord developer team containing collaborative access to applications and settings.
 * Teams enable multiple developers to share app management, configuration, and payout access.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object} for team object specification
 */
export interface TeamObject {
  /** Team icon hash for image formatting (null if no icon set) */
  readonly icon: string | null;
  /** Unique identifier for the team */
  readonly id: string;
  /** Array of all team members with their roles and status */
  readonly members: TeamMemberObject[];
  /** Display name of the team */
  readonly name: string;
  /** User ID of the team owner with full administrative privileges */
  readonly owner_user_id: string;
}
