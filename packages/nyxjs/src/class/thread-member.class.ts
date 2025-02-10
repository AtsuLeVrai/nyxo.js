import { BitFieldManager, type Snowflake } from "@nyxjs/core";
import { ThreadMemberUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { GuildMember } from "./guild-member.class.js";

export class ThreadMember {
  readonly #data: ThreadMemberUpdateEntity;
  readonly #flags: BitFieldManager<number>;

  constructor(data: Partial<z.input<typeof ThreadMemberUpdateEntity>> = {}) {
    try {
      this.#data = ThreadMemberUpdateEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake | null {
    return this.#data.id ?? null;
  }

  get userId(): Snowflake | null {
    return this.#data.user_id ?? null;
  }

  get joinTimestamp(): string {
    return this.#data.join_timestamp;
  }

  get flags(): BitFieldManager<number> {
    return this.#flags;
  }

  get member(): GuildMember {
    return new GuildMember(this.#data.member);
  }

  get guildId(): Snowflake {
    return this.#data.guild_id;
  }

  toJson(): ThreadMemberUpdateEntity {
    return { ...this.#data };
  }

  clone(): ThreadMember {
    return new ThreadMember(this.toJson());
  }

  validate(): boolean {
    try {
      ThreadMemberSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ThreadMemberUpdateEntity>): ThreadMember {
    return new ThreadMember({ ...this.toJson(), ...other });
  }

  equals(other: ThreadMember): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ThreadMemberSchema = z.instanceof(ThreadMember);
