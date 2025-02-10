import type { Snowflake } from "@nyxjs/core";
import { ChannelPinsUpdateEntity } from "@nyxjs/gateway";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class ChannelPins {
  readonly #data: ChannelPinsUpdateEntity;

  constructor(data: Partial<z.input<typeof ChannelPinsUpdateEntity>> = {}) {
    try {
      this.#data = ChannelPinsUpdateEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get guildId(): Snowflake | null {
    return this.#data.guild_id ?? null;
  }

  get channelId(): Snowflake {
    return this.#data.channel_id;
  }

  get lastPinTimestamp(): string | null {
    return this.#data.last_pin_timestamp ?? null;
  }

  toJson(): ChannelPinsUpdateEntity {
    return { ...this.#data };
  }

  clone(): ChannelPins {
    return new ChannelPins(this.toJson());
  }

  validate(): boolean {
    try {
      ChannelPinsSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ChannelPinsUpdateEntity>): ChannelPins {
    return new ChannelPins({ ...this.toJson(), ...other });
  }

  equals(other: ChannelPins): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ChannelPinsSchema = z.instanceof(ChannelPins);
