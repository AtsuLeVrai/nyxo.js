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
    entity: Partial<z.input<typeof InviteCreateEntity>> = {},
  ) {
    super(client, InviteCreateEntity, entity);
  }

  get channelId(): Snowflake {
    return this.entity.channel_id;
  }

  get code(): string {
    return this.entity.code;
  }

  get createdAt(): string {
    return this.entity.created_at;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get inviter(): User | null {
    return this.entity.inviter
      ? new User(this.client, this.entity.inviter)
      : null;
  }

  get maxAge(): number {
    return this.entity.max_age;
  }

  get maxUses(): number {
    return this.entity.max_uses;
  }

  get targetType(): InviteTargetType | null {
    return this.entity.target_type ?? null;
  }

  get targetUser(): User | null {
    return this.entity.target_user
      ? new User(this.client, this.entity.target_user)
      : null;
  }

  get targetApplication(): Application | null {
    return this.entity.target_application
      ? new Application(this.client, this.entity.target_application)
      : null;
  }

  get temporary(): boolean {
    return Boolean(this.entity.temporary);
  }

  get uses(): number {
    return this.entity.uses;
  }

  toJson(): InviteCreateEntity {
    return { ...this.entity };
  }
}

export const InviteCreateSchema = z.instanceof(InviteCreate);
