import type { InviteTargetType, Snowflake } from "@nyxjs/core";
import { InviteCreateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Application } from "./application.class.js";
import { User } from "./user.class.js";

export class InviteCreate extends BaseClass<InviteCreateEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof InviteCreateEntity>> = {},
  ) {
    super(client, InviteCreateEntity, data);
  }

  get channelId(): Snowflake {
    return this.data.channel_id;
  }

  get code(): string {
    return this.data.code;
  }

  get createdAt(): string {
    return this.data.created_at;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get inviter(): User | null {
    return this.data.inviter ? new User(this.client, this.data.inviter) : null;
  }

  get maxAge(): number {
    return this.data.max_age;
  }

  get maxUses(): number {
    return this.data.max_uses;
  }

  get targetType(): InviteTargetType | null {
    return this.data.target_type ?? null;
  }

  get targetUser(): User | null {
    return this.data.target_user
      ? new User(this.client, this.data.target_user)
      : null;
  }

  get targetApplication(): Application | null {
    return this.data.target_application
      ? new Application(this.client, this.data.target_application)
      : null;
  }

  get temporary(): boolean {
    return Boolean(this.data.temporary);
  }

  get uses(): number {
    return this.data.uses;
  }

  toJson(): InviteCreateEntity {
    return { ...this.data };
  }
}

export const InviteCreateSchema = z.instanceof(InviteCreate);
