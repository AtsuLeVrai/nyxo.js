import {
  type GuildStageVoiceChannelEntity,
  type GuildVoiceChannelEntity,
  GuildWidgetEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class GuildWidget extends BaseClass<GuildWidgetEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildWidgetEntity>> = {},
  ) {
    super(client, GuildWidgetEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get instantInvite(): string | null {
    return this.entity.instant_invite ?? null;
  }

  get channels(): (
    | Partial<GuildVoiceChannelEntity>
    | Partial<GuildStageVoiceChannelEntity>
  )[] {
    return Array.isArray(this.entity.channels) ? [...this.entity.channels] : [];
  }

  get members(): User[] {
    return Array.isArray(this.entity.members)
      ? this.entity.members.map((member) => new User(this.client, member))
      : [];
  }

  get presenceCount(): number {
    return this.entity.presence_count;
  }

  toJson(): GuildWidgetEntity {
    return { ...this.entity };
  }
}

export const GuildWidgetSchema = z.instanceof(GuildWidget);
