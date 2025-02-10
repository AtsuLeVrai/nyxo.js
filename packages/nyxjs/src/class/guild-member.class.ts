import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  GuildMemberEntity,
  type GuildMemberFlags,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class GuildMember {
  readonly #data: GuildMemberEntity;
  readonly #flags: BitFieldManager<GuildMemberFlags>;

  constructor(data: Partial<z.input<typeof GuildMemberEntity>> = {}) {
    try {
      this.#data = GuildMemberEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get user(): User {
    return new User(this.#data.user);
  }

  get nick(): string | null {
    return this.#data.nick ?? null;
  }

  get avatar(): string | null {
    return this.#data.avatar ?? null;
  }

  get banner(): string | null {
    return this.#data.banner ?? null;
  }

  get roles(): Snowflake[] {
    return Array.isArray(this.#data.roles) ? [...this.#data.roles] : [];
  }

  get joinedAt(): string {
    return this.#data.joined_at;
  }

  get premiumSince(): string | null {
    return this.#data.premium_since ?? null;
  }

  get deaf(): boolean {
    return Boolean(this.#data.deaf);
  }

  get mute(): boolean {
    return Boolean(this.#data.mute);
  }

  get flags(): BitFieldManager<GuildMemberFlags> {
    return this.#flags;
  }

  get pending(): boolean {
    return Boolean(this.#data.pending);
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
  }

  get communicationDisabledUntil(): string | null {
    return this.#data.communication_disabled_until ?? null;
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.#data.avatar_decoration_data ?? null;
  }

  toJson(): GuildMemberEntity {
    return { ...this.#data };
  }

  clone(): GuildMember {
    return new GuildMember(this.toJson());
  }

  validate(): boolean {
    try {
      GuildMemberSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildMemberEntity>): GuildMember {
    return new GuildMember({ ...this.toJson(), ...other });
  }

  equals(other: GuildMember): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildMemberSchema = z.instanceof(GuildMember);
