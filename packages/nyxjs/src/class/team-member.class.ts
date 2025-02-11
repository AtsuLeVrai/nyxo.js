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
    data: Partial<z.input<typeof TeamMemberEntity>> = {},
  ) {
    super(client, TeamMemberEntity, data);
  }

  get membershipState(): MembershipState {
    return this.data.membership_state;
  }

  get teamId(): Snowflake {
    return this.data.team_id;
  }

  get user(): User | null {
    return this.data.user ? new User(this.client, this.data.user) : null;
  }

  get role(): TeamMemberRole {
    return this.data.role;
  }

  toJson(): TeamMemberEntity {
    return { ...this.data };
  }
}

export const TeamMemberSchema = z.instanceof(TeamMember);
