import type { Snowflake } from "../common/index.js";
import type { UserObject } from "./user.js";

export enum MembershipState {
  Invited = 1,
  Accepted = 2,
}

export type TeamMemberRole = "admin" | "developer" | "read_only";

export interface TeamMemberObject {
  membership_state: MembershipState;
  team_id: Snowflake;
  user: Partial<UserObject>;
  role: TeamMemberRole;
}

export interface TeamObject {
  icon: string | null;
  id: Snowflake;
  members: TeamMemberObject[];
  name: string;
  owner_user_id: Snowflake;
}
