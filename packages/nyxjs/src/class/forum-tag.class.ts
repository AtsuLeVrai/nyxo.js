import { ForumTagEntity } from "@nyxjs/core";
import { z } from "zod";

export class ForumTag {
  readonly #data: ForumTagEntity;

  constructor(data: ForumTagEntity) {
    this.#data = ForumTagEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get moderated(): boolean {
    return Boolean(this.#data.moderated);
  }

  get emojiId(): unknown | null {
    return this.#data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.#data.emoji_name ?? null;
  }

  static fromJson(json: ForumTagEntity): ForumTag {
    return new ForumTag(json);
  }

  toJson(): ForumTagEntity {
    return { ...this.#data };
  }

  clone(): ForumTag {
    return new ForumTag(this.toJson());
  }

  validate(): boolean {
    try {
      ForumTagSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ForumTagEntity>): ForumTag {
    return new ForumTag({ ...this.toJson(), ...other });
  }

  equals(other: ForumTag): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ForumTagSchema = z.instanceof(ForumTag);
