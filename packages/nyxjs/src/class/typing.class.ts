import { TypingEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Typing {
  readonly #data: TypingEntity;

  constructor(data: Partial<z.input<typeof TypingEntity>> = {}) {
    try {
      this.#data = TypingEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get channelId(): unknown {
    return this.#data.channel_id;
  }

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
  }

  get userId(): unknown {
    return this.#data.user_id;
  }

  get timestamp(): number {
    return this.#data.timestamp;
  }

  get member(): object | null {
    return this.#data.member ?? null;
  }

  static fromJson(json: TypingEntity): Typing {
    return new Typing(json);
  }

  toJson(): TypingEntity {
    return { ...this.#data };
  }

  clone(): Typing {
    return new Typing(this.toJson());
  }

  validate(): boolean {
    try {
      TypingSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<TypingEntity>): Typing {
    return new Typing({ ...this.toJson(), ...other });
  }

  equals(other: Typing): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const TypingSchema = z.instanceof(Typing);
