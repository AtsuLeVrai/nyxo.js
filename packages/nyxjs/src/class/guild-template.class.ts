import { GuildTemplateEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildTemplate {
  readonly #data: GuildTemplateEntity;

  constructor(data: GuildTemplateEntity) {
    this.#data = GuildTemplateEntity.parse(data);
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

  get creatorId(): unknown {
    return this.#data.creator_id;
  }

  get creator(): object | null {
    return this.#data.creator ? { ...this.#data.creator } : null;
  }

  get createdAt(): string {
    return this.#data.created_at;
  }

  get updatedAt(): string {
    return this.#data.updated_at;
  }

  get sourceGuildId(): unknown {
    return this.#data.source_guild_id;
  }

  get serializedSourceGuild(): object | null {
    return this.#data.serialized_source_guild
      ? { ...this.#data.serialized_source_guild }
      : null;
  }

  get isDirty(): boolean | null {
    return this.#data.is_dirty ?? null;
  }

  static fromJson(json: GuildTemplateEntity): GuildTemplate {
    return new GuildTemplate(json);
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
