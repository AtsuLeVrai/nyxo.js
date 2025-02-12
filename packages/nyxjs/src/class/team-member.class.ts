import {
  type MembershipState,
  type Snowflake,
  TeamMemberEntity,
  type TeamMemberRole,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class TeamMember extends BaseClass<TeamMemberEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof TeamMemberEntity>> = {},
  ) {
    super(client, TeamMemberEntity, entity);
  }

  get membershipState(): MembershipState {
    return this.entity.membership_state;
  }

  get teamId(): Snowflake {
    return this.entity.team_id;
  }

  get user(): User | null {
    return this.entity.user ? new User(this.client, this.entity.user) : null;
  }

  get role(): TeamMemberRole {
    return this.entity.role;
  }

  toJson(): TeamMemberEntity {
    return { ...this.entity };
  }
}

export const TeamMemberSchema = z.instanceof(TeamMember);
