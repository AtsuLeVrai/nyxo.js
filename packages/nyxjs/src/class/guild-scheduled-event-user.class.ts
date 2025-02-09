import { GuildScheduledEventUserEntity } from "@nyxjs/core";
import { z } from "zod";

export class GuildScheduledEventUser {
  readonly #data: GuildScheduledEventUserEntity;

  constructor(data: GuildScheduledEventUserEntity) {
    this.#data = GuildScheduledEventUserEntity.parse(data);
  }

  get guildScheduledEventId(): unknown {
    return this.#data.guild_scheduled_event_id;
  }

  get user(): object | null {
    return this.#data.user ? { ...this.#data.user } : null;
  }

  get member(): object | null {
    return this.#data.member ?? null;
  }

  static fromJson(
    json: GuildScheduledEventUserEntity,
  ): GuildScheduledEventUser {
    return new GuildScheduledEventUser(json);
  }

  toJson(): GuildScheduledEventUserEntity {
    return { ...this.#data };
  }

  clone(): GuildScheduledEventUser {
    return new GuildScheduledEventUser(this.toJson());
  }

  validate(): boolean {
    try {
      GuildScheduledEventUserSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(
    other: Partial<GuildScheduledEventUserEntity>,
  ): GuildScheduledEventUser {
    return new GuildScheduledEventUser({ ...this.toJson(), ...other });
  }

  equals(other: GuildScheduledEventUser): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const GuildScheduledEventUserSchema = z.instanceof(
  GuildScheduledEventUser,
);
