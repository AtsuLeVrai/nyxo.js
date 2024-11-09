import type { Snowflake } from "../markdown/index.js";
import type { UserStructure } from "./users.js";

/**
 * Enumeration representing the membership state of a team member.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum|Membership State}
 */
export enum MembershipState {
    /**
     * The user has been invited to the team.
     */
    Invited = 1,
    /**
     * The user has accepted the invitation to the team.
     */
    Accepted = 2,
}

/**
 * Type representing the structure of a team member.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object|Team Member Object}
 */
export interface TeamMemberStructure {
    /**
     * User's membership state on the team.
     */
    membership_state: MembershipState;
    /**
     * Role of the team member.
     */
    role: string;
    /**
     * ID of the parent team of which they are a member.
     */
    team_id: Snowflake;
    /**
     * Avatar, discriminator, ID, and username of the user.
     */
    user: Pick<UserStructure, "avatar" | "discriminator" | "id" | "username">;
}

/**
 * Type representing the structure of a team.
 *
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object|Team Object}
 */
export interface TeamStructure {
    /**
     * Hash of the image of the team's icon.
     */
    icon: string | null;
    /**
     * Unique ID of the team.
     */
    id: Snowflake;
    /**
     * Members of the team.
     */
    members: TeamMemberStructure[];
    /**
     * Name of the team.
     */
    name: string;
    /**
     * User ID of the current team owner.
     */
    owner_user_id: Snowflake;
}
