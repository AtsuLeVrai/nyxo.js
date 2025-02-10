import { GuildScheduledEventUserEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { GuildMember } from "./guild-member.class.js";
import { User } from "./user.class.js";

export class GuildScheduledEventUser {
  readonly #data: GuildScheduledEventUserEntity;

  constructor(
    data: Partial<z.input<typeof GuildScheduledEventUserEntity>> = {},
  ) {
    try {
      this.#data = GuildScheduledEventUserEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get guildScheduledEventId(): Snowflake {
    return this.#data.guild_scheduled_event_id;
  }

  get user(): User | null {
    return this.#data.user ? new User(this.#data.user) : null;
  }

  get member(): GuildMember | null {
    return this.#data.member ? new GuildMember(this.#data.member) : null;
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
