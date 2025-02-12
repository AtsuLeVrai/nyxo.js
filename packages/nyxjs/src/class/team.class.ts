import { type Snowflake, TeamEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { TeamMember } from "./team-member.class.js";

export class Team extends BaseClass<TeamEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof TeamEntity>> = {},
  ) {
    super(client, TeamEntity, entity);
  }

  get icon(): string | null {
    return this.entity.icon ?? null;
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get members(): TeamMember[] {
    return Array.isArray(this.entity.members)
      ? this.entity.members.map((member) => new TeamMember(this.client, member))
      : [];
  }

  get name(): string {
    return this.entity.name;
  }

  get ownerUserId(): Snowflake {
    return this.entity.owner_user_id;
  }

  toJson(): TeamEntity {
    return { ...this.entity };
  }
}

export const TeamSchema = z.instanceof(Team);
