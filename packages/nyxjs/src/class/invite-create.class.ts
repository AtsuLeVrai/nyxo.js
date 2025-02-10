import type { InviteTargetType, Snowflake } from "@nyxjs/core";
import { InviteCreateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Application } from "./application.class.js";
import { User } from "./user.class.js";

export class InviteCreate {
  readonly #data: InviteCreateEntity;

  constructor(data: Partial<z.input<typeof InviteCreateEntity>> = {}) {
    try {
      this.#data = InviteCreateEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get channelId(): Snowflake {
    return this.#data.channel_id;
  }

  get code(): string {
    return this.#data.code;
  }

  get createdAt(): string {
    return this.#data.created_at;
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get inviter(): User | null {
    return this.#data.inviter ? new User(this.#data.inviter) : null;
  }

  get maxAge(): number {
    return this.#data.max_age;
  }

  get maxUses(): number {
    return this.#data.max_uses;
  }

  get targetType(): InviteTargetType | null {
    return this.#data.target_type ?? null;
  }

  get targetUser(): User | null {
    return this.#data.target_user ? new User(this.#data.target_user) : null;
  }

  get targetApplication(): Application | null {
    return this.#data.target_application
      ? new Application(this.#data.target_application)
      : null;
  }

  get temporary(): boolean {
    return Boolean(this.#data.temporary);
  }

  get uses(): number {
    return this.#data.uses;
  }

  toJson(): InviteCreateEntity {
    return { ...this.#data };
  }

  clone(): InviteCreate {
    return new InviteCreate(this.toJson());
  }

  validate(): boolean {
    try {
      InviteCreateSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<InviteCreateEntity>): InviteCreate {
    return new InviteCreate({ ...this.toJson(), ...other });
  }

  equals(other: InviteCreate): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const InviteCreateSchema = z.instanceof(InviteCreate);
