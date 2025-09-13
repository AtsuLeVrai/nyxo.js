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

export class TeamMember
  extends BaseClass<TeamMemberEntity>
  implements CamelCaseKeys<TeamMemberEntity>
{
  readonly membershipState = this.rawData.membership_state;
  readonly teamId = this.rawData.team_id;
  readonly user = this.rawData.user;
  readonly role = this.rawData.role;
}

export class Team extends BaseClass<TeamEntity> implements CamelCaseKeys<TeamEntity> {
  readonly icon = this.rawData.icon;
  readonly id = this.rawData.id;
  readonly members = this.rawData.members.map((member) => new TeamMember(this.client, member));
  readonly name = this.rawData.name;
  readonly ownerUserId = this.rawData.owner_user_id;
}
