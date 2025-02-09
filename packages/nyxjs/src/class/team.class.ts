import { TeamEntity } from "@nyxjs/core";
import { z } from "zod";

export class Team {
  readonly #data: TeamEntity;

  constructor(data: TeamEntity) {
    this.#data = TeamEntity.parse(data);
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get id(): unknown {
    return this.#data.id;
  }

  get members(): object[] {
    return Array.isArray(this.#data.members) ? [...this.#data.members] : [];
  }

  get name(): string {
    return this.#data.name;
  }

  get ownerUserId(): unknown {
    return this.#data.owner_user_id;
  }

  static fromJson(json: TeamEntity): Team {
    return new Team(json);
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
