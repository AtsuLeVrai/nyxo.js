import { GuildWidgetEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildWidget {
  readonly #data: GuildWidgetEntity;

  constructor(data: GuildWidgetEntity) {
    this.#data = GuildWidgetEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get instantInvite(): string | null {
    return this.#data.instant_invite ?? null;
  }

  get channels(): unknown[] {
    return Array.isArray(this.#data.channels) ? [...this.#data.channels] : [];
  }

  get members(): unknown[] {
    return Array.isArray(this.#data.members) ? [...this.#data.members] : [];
  }

  get presenceCount(): number {
    return this.#data.presence_count;
  }

  static fromJson(json: GuildWidgetEntity): GuildWidget {
    return new GuildWidget(json);
  }

  toJson(): GuildWidgetEntity {
    return { ...this.#data };
  }

  clone(): GuildWidget {
    return new GuildWidget(this.toJson());
  }

  validate(): boolean {
    try {
      GuildWidgetSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<GuildWidgetEntity>): GuildWidget {
    return new GuildWidget({ ...this.toJson(), ...other });
  }

  equals(other: GuildWidget): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildWidgetSchema = z.instanceof(GuildWidget);
