import type { Snowflake, TeamEntity } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";
import { TeamMember } from "./team-member.class.js";

export class Team
  extends BaseClass<TeamEntity>
  implements EnforceCamelCase<TeamEntity>
{
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
