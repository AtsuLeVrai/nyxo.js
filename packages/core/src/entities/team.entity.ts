import type { Snowflake } from "../managers/index.js";
import type { UserEntity } from "./user.entity.js";

/**
 * Represents the possible states of a user's membership in a team.
 * Indicates whether a user has accepted an invitation to join a team.
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum}
 */
export enum MembershipState {
  /**
   * User has been invited to the team but has not yet accepted (1)
   * The user will need to accept the invitation to become an active team member
   */
  Invited = 1,

  /**
   * User has accepted the invitation and is a member of the team (2)
   * The user is now an active team member with their assigned role's permissions
   */
  Accepted = 2,
}

/**
 * Represents the possible roles a user can have within a team.
 * Each role inherits the access of those below it in the hierarchy.
 * Note: The Owner role is not represented in this enum, but is identified through
 * the owner_user_id field in the TeamEntity object.
 * @see {@link https://discord.com/developers/docs/topics/teams#team-member-roles-team-member-role-types}
 */
export enum TeamMemberRole {
  /**
   * Team admin with extensive privileges
   * Admins have similar access as owners, except they cannot take destructive actions
   * on the team or team-owned apps.
   */
  Admin = "admin",

  /**
   * Team member with developer permissions
   * Developers can access information about team-owned apps, like the client secret or public key.
   * They can also take limited actions on team-owned apps, like configuring interaction endpoints
   * or resetting the bot token. Members with the Developer role cannot manage the team or its members,
   * or take destructive actions on team-owned apps.
   */
  Developer = "developer",

  /**
   * Team member with read-only permissions
   * Read-only members can access information about a team and any team-owned apps.
   * Some examples include getting the IDs of applications and exporting payout records.
   * Members can also invite bots associated with team-owned apps that are marked private.
   */
  ReadOnly = "read_only",
}

/**
 * Represents a member of a team within Discord, typically used for applications owned by teams.
 * Team members can have different roles that determine their permissions for managing the team
 * and its applications.
 *
 * @remarks
 * - To create or be a member on a team, users must enable 2FA for their Discord account
 * - Only the team Owner and team Admins can invite or remove additional users
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object}
 */
export interface TeamMemberEntity {
  /**
   * The user's membership state on the team
   * Indicates whether the user has accepted their invitation
   */
  membership_state: MembershipState;

  /**
   * The ID of the team that the user is a member of
   * Unique identifier of the parent team
   */
  team_id: Snowflake;

  /**
   * A partial user object containing information about the team member
   * Includes the user's avatar, discriminator, ID, and username
   */
  user: Partial<UserEntity>;

  /**
   * The role of the user in the team
   * Determines the level of access and permissions the user has
   * Note: The team owner is not represented by this field, but by the owner_user_id in the TeamEntity
   */
  role: TeamMemberRole;
}

/**
 * Represents a team on Discord that can own applications.
 * Teams help multiple users work together on applications and share management rights.
 * Team members can have different roles (owner, admin, developer, read-only),
 * each with different permissions for managing the team and its applications.
 *
 * @remarks
 * - Teams require all members to have 2FA enabled on their Discord accounts
 * - Teams can have a maximum of 25 apps
 * - Only the Owner and Admins can invite or remove team members
 * - Teams are limited to 1 owner, who has the most permissive role and can take destructive actions
 * - Once an app has been transferred to a team, it cannot be transferred back to individual ownership
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object}
 * @validate The owner_user_id must match one of the accepted team member's user id
 */
export interface TeamEntity {
  /**
   * The team's icon hash
   * Hash of the image used as the team's icon
   * Can be null if the team has no icon
   */
  icon: string | null;

  /**
   * The unique ID of the team
   * Snowflake identifier for the team
   */
  id: Snowflake;

  /**
   * The members of the team
   * Array of TeamMemberEntity objects representing all members of the team
   */
  members: TeamMemberEntity[];

  /**
   * The name of the team
   * Display name shown in the Discord developer portal
   */
  name: string;

  /**
   * The user ID of the team owner
   * Identifies which user has the owner role for the team
   * The owner has the most permissive role and can take destructive actions like
   * deleting team-owned apps or the team itself
   */
  owner_user_id: Snowflake;
}
