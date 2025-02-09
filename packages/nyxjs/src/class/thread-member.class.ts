import { ThreadMemberUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";

export class ThreadMember {
  readonly #data: ThreadMemberUpdateEntity;

  constructor(data: ThreadMemberUpdateEntity) {
    this.#data = ThreadMemberUpdateEntity.parse(data);
  }

  get id(): unknown | null {
    return this.#data.id ?? null;
  }

  get userId(): unknown | null {
    return this.#data.user_id ?? null;
  }

  get joinTimestamp(): string {
    return this.#data.join_timestamp;
  }

  get flags(): number {
    return this.#data.flags;
  }

  get member(): unknown {
    return this.#data.member;
  }

  get guildId(): unknown {
    return this.#data.guild_id;
  }

  static fromJson(json: ThreadMemberUpdateEntity): ThreadMember {
    return new ThreadMember(json);
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
