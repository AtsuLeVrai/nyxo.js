import type { Snowflake } from "../libs/formats";
import type { UserStructure } from "./users";

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum}
 */
export enum MembershipState {
    Invited = 1,
    Accepted = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#team-member-roles-team-member-role-types}
 */
export type TeamMemberRoles = "admin" | "developer" | "owner" | "read_only";

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object}
 */
export type TeamMemberStructure = {
    /**
     * User's membership state on the team
     */
    membership_state: MembershipState;
    /**
     * Role of the team member
     */
    role: TeamMemberRoles;
    /**
     * ID of the parent team of which they are a member
     */
    team_id: Snowflake;
    /**
     * Avatar, discriminator, ID, and username of the user
     */
    user: Pick<UserStructure, "avatar" | "discriminator" | "id" | "username">;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object}
 */
export type TeamStructure = {
    /**
     * Hash of the image of the team's icon
     */
    icon: string | null;
    /**
     * Unique ID of the team
     */
    id: Snowflake;
    /**
     * Members of the team
     */
    members: TeamMemberStructure[];
    /**
     * Name of the team
     */
    name: string;
    /**
     * User ID of the current team owner
     */
    owner_user_id: Snowflake;
};
