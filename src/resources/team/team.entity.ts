import type { UserEntity } from "../user/index.js";

/**
 * @description Membership status of a user in a Discord developer team.
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum}
 */
export enum MembershipState {
  /** User has been invited to the team but hasn't accepted yet */
  Invited = 1,
  /** User has accepted the team invitation and is an active member */
  Accepted = 2,
}

/**
 * @description Role types for Discord team members defining their permissions and access level.
 * @see {@link https://discord.com/developers/docs/topics/teams#team-member-roles-team-member-role-types}
 */
export enum TeamMemberRole {
  /** Admin role with full access except destructive actions on team/apps */
  Admin = "admin",
  /** Developer role with access to app secrets and limited configuration actions */
  Developer = "developer",
  /** Read-only role with view access to team and app information */
  ReadOnly = "read_only",
}

/**
 * @description Represents a Discord user's membership in a developer team.
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object}
 */
export interface TeamMemberEntity {
  /** User's current membership status in the team */
  membership_state: MembershipState;
  /** Snowflake ID of the parent team */
  team_id: string;
  /** Partial user object containing avatar, discriminator, ID, and username */
  user: Pick<UserEntity, "id" | "username" | "discriminator" | "avatar">;
  /** Team member's role defining their permissions */
  role: TeamMemberRole;
}

/**
 * @description Represents a Discord developer team for collaborative app development.
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object}
 */
export interface TeamEntity {
  /** Hash of the team's icon image (null if no icon) */
  icon: string | null;
  /** Unique snowflake identifier for the team */
  id: string;
  /** Array of team members with their roles and status */
  members: TeamMemberEntity[];
  /** Human-readable name of the team */
  name: string;
  /** Snowflake ID of the current team owner */
  owner_user_id: string;
}
