import { GuildTemplateEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

export class GuildTemplate extends BaseClass<GuildTemplateEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof GuildTemplateEntity>> = {},
  ) {
    super(client, GuildTemplateEntity, entity);
  }

  get code(): string {
    return this.entity.code;
  }

  get name(): string {
    return this.entity.name;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get usageCount(): number {
    return this.entity.usage_count;
  }

  get creatorId(): Snowflake {
    return this.entity.creator_id;
  }

  get creator(): User | null {
    return this.entity.creator
      ? new User(this.client, this.entity.creator)
      : null;
  }

  get createdAt(): string {
    return this.entity.created_at;
  }

  get updatedAt(): string {
    return this.entity.updated_at;
  }

  get sourceGuildId(): Snowflake {
    return this.entity.source_guild_id;
  }

  get serializedSourceGuild(): Guild | null {
    return this.entity.serialized_source_guild
      ? new Guild(this.client, this.entity.serialized_source_guild)
      : null;
  }

  get isDirty(): boolean {
    return Boolean(this.entity.is_dirty);
  }

  toJson(): GuildTemplateEntity {
    return { ...this.entity };
  }
}

export const GuildTemplateSchema = z.instanceof(GuildTemplate);
