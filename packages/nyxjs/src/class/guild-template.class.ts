import { GuildTemplateEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { Guild } from "./guild.class.js";
import { User } from "./user.class.js";

export class GuildTemplate {
  readonly #data: GuildTemplateEntity;

  constructor(data: Partial<z.input<typeof GuildTemplateEntity>> = {}) {
    try {
      this.#data = GuildTemplateEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get code(): string {
    return this.#data.code;
  }

  get name(): string {
    return this.#data.name;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get usageCount(): number {
    return this.#data.usage_count;
  }

  get creatorId(): Snowflake {
    return this.#data.creator_id;
  }

  get creator(): User | null {
    return this.#data.creator ? new User(this.#data.creator) : null;
  }

  get createdAt(): string {
    return this.#data.created_at;
  }

  get updatedAt(): string {
    return this.#data.updated_at;
  }

  get sourceGuildId(): Snowflake {
    return this.#data.source_guild_id;
  }

  get serializedSourceGuild(): Guild | null {
    return this.#data.serialized_source_guild
      ? new Guild(this.#data.serialized_source_guild)
      : null;
  }

  get isDirty(): boolean {
    return Boolean(this.#data.is_dirty);
  }

  toJson(): GuildTemplateEntity {
    return { ...this.#data };
  }

  clone(): GuildTemplate {
    return new GuildTemplate(this.toJson());
  }

  validate(): boolean {
    try {
      GuildTemplateSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildTemplateEntity>): GuildTemplate {
    return new GuildTemplate({ ...this.toJson(), ...other });
  }

  equals(other: GuildTemplate): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildTemplateSchema = z.instanceof(GuildTemplate);
