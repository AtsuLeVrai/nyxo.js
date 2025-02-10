import { type Snowflake, WelcomeScreenChannelEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class WelcomeScreenChannel {
  readonly #data: WelcomeScreenChannelEntity;

  constructor(data: Partial<z.input<typeof WelcomeScreenChannelEntity>> = {}) {
    try {
      this.#data = WelcomeScreenChannelEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get channelId(): Snowflake {
    return this.#data.channel_id;
  }

  get description(): string {
    return this.#data.description;
  }

  get emojiId(): Snowflake | null {
    return this.#data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.#data.emoji_name ?? null;
  }

  toJson(): WelcomeScreenChannelEntity {
    return { ...this.#data };
  }

  clone(): WelcomeScreenChannel {
    return new WelcomeScreenChannel(this.toJson());
  }

  validate(): boolean {
    try {
      WelcomeScreenChannelSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<WelcomeScreenChannelEntity>): WelcomeScreenChannel {
    return new WelcomeScreenChannel({ ...this.toJson(), ...other });
  }

  equals(other: WelcomeScreenChannel): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const WelcomeScreenChannelSchema = z.instanceof(WelcomeScreenChannel);
