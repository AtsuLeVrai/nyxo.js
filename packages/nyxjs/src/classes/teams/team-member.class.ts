import type {
  MembershipState,
  Snowflake,
  TeamMemberEntity,
  TeamMemberRole,
  UserEntity,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";
import { User } from "../users/index.js";

export class TeamMember
  extends BaseClass<TeamMemberEntity>
  implements EnforceCamelCase<TeamMemberEntity>
{
  get membershipState(): MembershipState {
    return this.data.membership_state;
  }

  get teamId(): Snowflake {
    return this.data.team_id;
  }

  get user(): User {
    return User.from(this.client, this.data.user as UserEntity);
  }

  get role(): TeamMemberRole {
    return this.data.role;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
