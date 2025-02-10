import {
  type GuildStageVoiceChannelEntity,
  type GuildVoiceChannelEntity,
  GuildWidgetEntity,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { User } from "./user.class.js";

export class GuildWidget {
  readonly #data: GuildWidgetEntity;

  constructor(data: Partial<z.input<typeof GuildWidgetEntity>> = {}) {
    try {
      this.#data = GuildWidgetEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get instantInvite(): string | null {
    return this.#data.instant_invite ?? null;
  }

  get channels(): (
    | Partial<GuildVoiceChannelEntity>
    | Partial<GuildStageVoiceChannelEntity>
  )[] {
    return Array.isArray(this.#data.channels) ? [...this.#data.channels] : [];
  }

  get members(): User[] {
    return Array.isArray(this.#data.members)
      ? this.#data.members.map((member) => new User(member))
      : [];
  }

  get presenceCount(): number {
    return this.#data.presence_count;
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
