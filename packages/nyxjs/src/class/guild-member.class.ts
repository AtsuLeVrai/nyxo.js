import { GuildMemberEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildMember {
  readonly #data: GuildMemberEntity;

  constructor(data: GuildMemberEntity) {
    this.#data = GuildMemberEntity.parse(data);
  }

  get user(): unknown {
    return this.#data.user;
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

  get roles(): unknown[] {
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

  get flags(): unknown {
    return this.#data.flags;
  }

  get pending(): boolean | null {
    return this.#data.pending ?? null;
  }

  get permissions(): string | null {
    return this.#data.permissions ?? null;
  }

  get communicationDisabledUntil(): string | null {
    return this.#data.communication_disabled_until ?? null;
  }

  get avatarDecorationData(): unknown | null {
    return this.#data.avatar_decoration_data ?? null;
  }

  static fromJson(json: GuildMemberEntity): GuildMember {
    return new GuildMember(json);
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
