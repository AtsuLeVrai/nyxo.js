import { type Snowflake, TeamEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { TeamMember } from "./team-member.class.js";

export class Team {
  readonly #data: TeamEntity;

  constructor(data: Partial<z.input<typeof TeamEntity>> = {}) {
    try {
      this.#data = TeamEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get members(): TeamMember[] {
    return Array.isArray(this.#data.members)
      ? this.#data.members.map((member) => new TeamMember(member))
      : [];
  }

  get name(): string {
    return this.#data.name;
  }

  get ownerUserId(): Snowflake {
    return this.#data.owner_user_id;
  }

  toJson(): TeamEntity {
    return { ...this.#data };
  }

  clone(): Team {
    return new Team(this.toJson());
  }

  validate(): boolean {
    try {
      TeamSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<TeamEntity>): Team {
    return new Team({ ...this.toJson(), ...other });
  }

  equals(other: Team): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const TeamSchema = z.instanceof(Team);
