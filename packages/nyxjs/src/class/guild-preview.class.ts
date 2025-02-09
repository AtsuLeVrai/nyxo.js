import { GuildPreviewEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildPreview {
  readonly #data: GuildPreviewEntity;

  constructor(data: GuildPreviewEntity) {
    this.#data = GuildPreviewEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get splash(): string | null {
    return this.#data.splash ?? null;
  }

  get discoverySplash(): string | null {
    return this.#data.discovery_splash ?? null;
  }

  get emojis(): unknown[] {
    return Array.isArray(this.#data.emojis) ? [...this.#data.emojis] : [];
  }

  get features(): unknown[] {
    return Array.isArray(this.#data.features) ? [...this.#data.features] : [];
  }

  get approximateMemberCount(): number {
    return this.#data.approximate_member_count;
  }

  get approximatePresenceCount(): number {
    return this.#data.approximate_presence_count;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get stickers(): unknown[] {
    return Array.isArray(this.#data.stickers) ? [...this.#data.stickers] : [];
  }

  static fromJson(json: GuildPreviewEntity): GuildPreview {
    return new GuildPreview(json);
  }

  toJson(): GuildPreviewEntity {
    return { ...this.#data };
  }

  clone(): GuildPreview {
    return new GuildPreview(this.toJson());
  }

  validate(): boolean {
    try {
      GuildPreviewSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildPreviewEntity>): GuildPreview {
    return new GuildPreview({ ...this.toJson(), ...other });
  }

  equals(other: GuildPreview): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildPreviewSchema = z.instanceof(GuildPreview);
