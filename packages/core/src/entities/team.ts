import type { Snowflake } from "../utils/index.js";
import type { UserEntity } from "./user.js";

/**
 * Represents the state of a user's membership in a team.
 *
 * @remarks
 * Indicates whether a user has been invited to join a team
 * or has accepted their invitation.
 *
 * @example
 * ```typescript
 * const memberState: MembershipState = MembershipState.Accepted;
 * ```
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum}
 */
export enum MembershipState {
  /** User has been invited to the team but hasn't accepted yet */
  Invited = 1,
  /** User has accepted the team invitation */
  Accepted = 2,
}

/**
 * Represents a member of a Discord team.
 *
 * @remarks
 * Team members can have different roles (owner, admin, developer, read-only) that determine
 * their permissions within the team. Each role inherits the access of those below it.
 * The owner role is not represented in the role field - use owner_user_id in TeamEntity instead.
 *
 * @example
 * ```typescript
 * const teamMember: TeamMemberEntity = {
 *   membership_state: MembershipState.Accepted,
 *   team_id: "123456789",
 *   user: { id: "987654321", username: "johndoe" },
 *   role: "admin"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object}
 */
export interface TeamMemberEntity {
  /** User's membership state on the team */
  membership_state: MembershipState;
  /** ID of the parent team */
  team_id: Snowflake;
  /** Partial user object containing avatar, discriminator, ID, and username */
  user: Partial<UserEntity>;
  /** Role of the team member: "admin", "developer", or "read_only" */
  role: string;
}

/**
 * Represents a team of Discord users who collaborate on applications.
 *
 * @remarks
 * Teams can own and manage applications collectively. Teams are limited to 25 applications.
 * All team members must have 2FA enabled to participate.
 * Once an application is transferred to a team, it cannot be transferred back to individual ownership.
 *
 * @example
 * ```typescript
 * const team: TeamEntity = {
 *   icon: "1234567890abcdef",
 *   id: "123456789",
 *   members: [],
 *   name: "My Awesome Team",
 *   owner_user_id: "987654321"
 * };
 * ```
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object}
 */
export interface TeamEntity {
  /** Hash of the team's icon image */
  icon: string | null;
  /** Unique identifier of the team */
  id: Snowflake;
  /** Array of team members */
  members: TeamMemberEntity[];
  /** Name of the team */
  name: string;
  /** User ID of the current team owner */
  owner_user_id: Snowflake;
}
