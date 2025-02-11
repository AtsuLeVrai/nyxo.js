import { GuildTemplateEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

export class GuildTemplate extends BaseClass<GuildTemplateEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof GuildTemplateEntity>> = {},
  ) {
    super(client, GuildTemplateEntity, data);
  }

  get code(): string {
    return this.data.code;
  }

  get name(): string {
    return this.data.name;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get usageCount(): number {
    return this.data.usage_count;
  }

  get creatorId(): Snowflake {
    return this.data.creator_id;
  }

  get creator(): User | null {
    return this.data.creator ? new User(this.client, this.data.creator) : null;
  }

  get createdAt(): string {
    return this.data.created_at;
  }

  get updatedAt(): string {
    return this.data.updated_at;
  }

  get sourceGuildId(): Snowflake {
    return this.data.source_guild_id;
  }

  get serializedSourceGuild(): Guild | null {
    return this.data.serialized_source_guild
      ? new Guild(this.client, this.data.serialized_source_guild)
      : null;
  }

  get isDirty(): boolean {
    return Boolean(this.data.is_dirty);
  }

  toJson(): GuildTemplateEntity {
    return { ...this.data };
  }
}

export const GuildTemplateSchema = z.instanceof(GuildTemplate);
