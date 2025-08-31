import type { UserEntity } from "../user/index.js";

export enum MembershipState {
  Invited = 1,
  Accepted = 2,
}

export enum TeamMemberRole {
  Admin = "admin",
  Developer = "developer",
  ReadOnly = "read_only",
}

export interface TeamMemberEntity {
  membership_state: MembershipState;
  team_id: string;
  user: Pick<UserEntity, "id" | "username" | "discriminator" | "avatar">;
  role: TeamMemberRole;
}

export interface TeamEntity {
  icon: string | null;
  id: string;
  members: TeamMemberEntity[];
  name: string;
  owner_user_id: string;
}
