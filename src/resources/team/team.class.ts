import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type { TeamEntity, TeamMemberEntity } from "./team.entity.js";

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
