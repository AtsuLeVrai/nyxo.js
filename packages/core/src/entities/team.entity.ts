import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { UserEntity } from "./user.entity.js";

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
export const TeamMemberEntity = z.object({
  /** The user's membership state on the team */
  membership_state: z.nativeEnum(MembershipState),

  /** The ID of the team that the user is a member of */
  team_id: Snowflake,

  /** A partial user object containing information about the team member */
  user: UserEntity.partial(),

  /** The role of the user in the team */
  role: z.nativeEnum(TeamMemberRole),
});

export type TeamMemberEntity = z.infer<typeof TeamMemberEntity>;

/**
 * Represents a team on Discord that can own applications.
 * Teams help multiple users work together on applications and share management rights.
 * Teams can have a maximum of 25 apps.
 * @see {@link https://github.com/discord/discord-api-docs/blob/main/docs/topics/Teams.md#team-object}
 */
export const TeamEntity = z
  .object({
    /** The team's icon hash */
    icon: z.string().nullable(),

    /** The unique ID of the team */
    id: Snowflake,

    /** The members of the team */
    members: TeamMemberEntity.array(),

    /** The name of the team */
    name: z.string(),

    /** The user ID of the team owner */
    owner_user_id: Snowflake,
  })
  .refine(
    (team) => {
      // Validate that owner_user_id is one of the member's user.id
      return team.members.some(
        (member) =>
          member.user.id === team.owner_user_id &&
          member.membership_state === MembershipState.Accepted,
      );
    },
    {
      message:
        "The owner_user_id must match one of the accepted team member's user id",
      path: ["owner_user_id"],
    },
  );

export type TeamEntity = z.infer<typeof TeamEntity>;
