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
    entity: Partial<z.input<typeof GuildMemberEntity>> = {},
  ) {
    super(client, GuildMemberEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get user(): User {
    return new User(this.client, this.entity.user);
  }

  get nick(): string | null {
    return this.entity.nick ?? null;
  }

  get avatar(): string | null {
    return this.entity.avatar ?? null;
  }

  get banner(): string | null {
    return this.entity.banner ?? null;
  }

  get roles(): Snowflake[] {
    return Array.isArray(this.entity.roles) ? [...this.entity.roles] : [];
  }

  get joinedAt(): string {
    return this.entity.joined_at;
  }

  get premiumSince(): string | null {
    return this.entity.premium_since ?? null;
  }

  get deaf(): boolean {
    return Boolean(this.entity.deaf);
  }

  get mute(): boolean {
    return Boolean(this.entity.mute);
  }

  get flags(): BitFieldManager<GuildMemberFlags> {
    return this.#flags;
  }

  get pending(): boolean {
    return Boolean(this.entity.pending);
  }

  get permissions(): string | null {
    return this.entity.permissions ?? null;
  }

  get communicationDisabledUntil(): string | null {
    return this.entity.communication_disabled_until ?? null;
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.entity.avatar_decoration_data ?? null;
  }

  toJson(): GuildMemberEntity {
    return { ...this.entity };
  }
}

export const GuildMemberSchema = z.instanceof(GuildMember);
