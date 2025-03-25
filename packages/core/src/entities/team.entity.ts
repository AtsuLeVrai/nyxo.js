import type { Snowflake } from "../managers/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the possible states of a user's membership in a team.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/topics/Teams.md#membership-state-enum}
 */
export enum MembershipState {
  /** User has been invited to the team but has not yet accepted */
  Invited = 1,

  /** User has accepted the invitation and is a member of the team */
  Accepted = 2,
}

/**
 * Represents the possible roles a user can have within a team.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/topics/Teams.md#team-member-role-types}
 */
export enum TeamMemberRole {
  /** Team owner with administrative privileges */
  Admin = "admin",

  /** Team member with developer permissions */
  Developer = "developer",

  /** Team member with read-only permissions */
  ReadOnly = "read_only",
}

/**
 * Represents a member of a team within Discord, typically used for applications owned by teams.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/topics/Teams.md#team-member-object}
 */
export interface TeamMemberEntity {
  /** The user's membership state on the team */
  membership_state: MembershipState;

  /** The ID of the team that the user is a member of */
  team_id: Snowflake;

  /** A partial user object containing information about the team member */
  user: Partial<UserEntity>;

  /** The role of the user in the team */
  role: TeamMemberRole;
}

/**
 * Represents a team on Discord that can own applications.
 * Teams help multiple users work together on applications and share management rights.
 * Teams can have a maximum of 25 apps.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/topics/Teams.md#team-object}
 * @validate The owner_user_id must match one of the accepted team member's user id
 */
export interface TeamEntity {
  /** The team's icon hash */
  icon: string | null;

  /** The unique ID of the team */
  id: Snowflake;

  /** The members of the team */
  members: TeamMemberEntity[];

  /** The name of the team */
  name: string;

  /** The user ID of the team owner */
  owner_user_id: Snowflake;
}
