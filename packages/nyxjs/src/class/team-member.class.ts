import {
  type MembershipState,
  type Snowflake,
  TeamMemberEntity,
  type TeamMemberRole,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class TeamMember {
  readonly #data: TeamMemberEntity;

  constructor(data: Partial<z.input<typeof TeamMemberEntity>> = {}) {
    try {
      this.#data = TeamMemberEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get membershipState(): MembershipState {
    return this.#data.membership_state;
  }

  get teamId(): Snowflake {
    return this.#data.team_id;
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  get role(): TeamMemberRole {
    return this.#data.role;
  }

  toJson(): TeamMemberEntity {
    return { ...this.#data };
  }

  clone(): TeamMember {
    return new TeamMember(this.toJson());
  }

  validate(): boolean {
    try {
      TeamMemberSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<TeamMemberEntity>): TeamMember {
    return new TeamMember({ ...this.toJson(), ...other });
  }

  equals(other: TeamMember): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const TeamMemberSchema = z.instanceof(TeamMember);
