import type { UserObject } from "./user.js";

export enum MembershipState {
  Invited = 1,

  Accepted = 2,
}

export enum TeamMemberRole {
  Admin = "admin",

  Developer = "developer",

  ReadOnly = "read_only",
}

export interface TeamMemberObject {
  readonly membership_state: MembershipState;

  readonly team_id: string;

  readonly user: Pick<UserObject, "id" | "username" | "discriminator" | "avatar">;

  readonly role: TeamMemberRole;
}

export interface TeamObject {
  readonly icon: string | null;

  readonly id: string;

  readonly members: TeamMemberObject[];

  readonly name: string;

  readonly owner_user_id: string;
}
