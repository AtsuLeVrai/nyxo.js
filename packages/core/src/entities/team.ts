import type { Snowflake } from "../formatting/index.js";
import type { UserEntity } from "./user.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum}
 */
export enum MembershipState {
  Invited = 1,
  Accepted = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object}
 */
export interface TeamMemberEntity {
  membership_state: MembershipState;
  team_id: Snowflake;
  user: Partial<UserEntity>;
  role: string;
}

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object}
 */
export interface TeamEntity {
  icon: string | null;
  id: Snowflake;
  members: TeamMemberEntity[];
  name: string;
  owner_user_id: Snowflake;
}
