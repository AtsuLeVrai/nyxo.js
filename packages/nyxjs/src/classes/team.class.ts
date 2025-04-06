import type {
  MembershipState,
  Snowflake,
  TeamEntity,
  TeamMemberEntity,
  TeamMemberRole,
  UserEntity,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../bases/index.js";
import { User } from "./user.class.js";

export class TeamMember extends BaseClass<TeamMemberEntity> {
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

export class Team extends BaseClass<TeamEntity> {
  get id(): Snowflake {
    return this.data.id;
  }

  get icon(): string | null {
    return this.data.icon;
  }

  get members(): TeamMember[] {
    return this.data.members.map((member) =>
      TeamMember.from(this.client, member),
    );
  }

  get name(): string {
    return this.data.name;
  }

  get ownerUserId(): Snowflake {
    return this.data.owner_user_id;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
