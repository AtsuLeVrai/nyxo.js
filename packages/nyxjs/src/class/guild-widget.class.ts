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
    data: Partial<z.input<typeof GuildWidgetEntity>> = {},
  ) {
    super(client, GuildWidgetEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get instantInvite(): string | null {
    return this.data.instant_invite ?? null;
  }

  get channels(): (
    | Partial<GuildVoiceChannelEntity>
    | Partial<GuildStageVoiceChannelEntity>
  )[] {
    return Array.isArray(this.data.channels) ? [...this.data.channels] : [];
  }

  get members(): User[] {
    return Array.isArray(this.data.members)
      ? this.data.members.map((member) => new User(this.client, member))
      : [];
  }

  get presenceCount(): number {
    return this.data.presence_count;
  }

  toJson(): GuildWidgetEntity {
    return { ...this.data };
  }
}

export const GuildWidgetSchema = z.instanceof(GuildWidget);
