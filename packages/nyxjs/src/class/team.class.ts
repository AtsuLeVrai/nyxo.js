import { type Snowflake, TeamEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { TeamMember } from "./team-member.class.js";

export class Team extends BaseClass<TeamEntity> {
  constructor(client: Client, data: Partial<z.input<typeof TeamEntity>> = {}) {
    super(client, TeamEntity, data);
  }

  get icon(): string | null {
    return this.data.icon ?? null;
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get members(): TeamMember[] {
    return Array.isArray(this.data.members)
      ? this.data.members.map((member) => new TeamMember(this.client, member))
      : [];
  }

  get name(): string {
    return this.data.name;
  }

  get ownerUserId(): Snowflake {
    return this.data.owner_user_id;
  }

  toJson(): TeamEntity {
    return { ...this.data };
  }
}

export const TeamSchema = z.instanceof(Team);
