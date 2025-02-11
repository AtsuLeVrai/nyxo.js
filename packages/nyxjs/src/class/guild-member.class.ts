import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  GuildMemberEntity,
  type GuildMemberFlags,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class GuildMember extends BaseClass<GuildMemberEntity> {
  readonly #flags: BitFieldManager<GuildMemberFlags>;

  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildMemberEntity>> = {},
  ) {
    super(client, GuildMemberEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get user(): User {
    return new User(this.client, this.data.user);
  }

  get nick(): string | null {
    return this.data.nick ?? null;
  }

  get avatar(): string | null {
    return this.data.avatar ?? null;
  }

  get banner(): string | null {
    return this.data.banner ?? null;
  }

  get roles(): Snowflake[] {
    return Array.isArray(this.data.roles) ? [...this.data.roles] : [];
  }

  get joinedAt(): string {
    return this.data.joined_at;
  }

  get premiumSince(): string | null {
    return this.data.premium_since ?? null;
  }

  get deaf(): boolean {
    return Boolean(this.data.deaf);
  }

  get mute(): boolean {
    return Boolean(this.data.mute);
  }

  get flags(): BitFieldManager<GuildMemberFlags> {
    return this.#flags;
  }

  get pending(): boolean {
    return Boolean(this.data.pending);
  }

  get permissions(): string | null {
    return this.data.permissions ?? null;
  }

  get communicationDisabledUntil(): string | null {
    return this.data.communication_disabled_until ?? null;
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.data.avatar_decoration_data ?? null;
  }

  toJson(): GuildMemberEntity {
    return { ...this.data };
  }
}

export const GuildMemberSchema = z.instanceof(GuildMember);
