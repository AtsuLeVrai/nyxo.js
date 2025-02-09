import { WelcomeScreenChannelEntity } from "@nyxjs/core";
import { z } from "zod";

export class WelcomeScreenChannel {
  readonly #data: WelcomeScreenChannelEntity;

  constructor(data: WelcomeScreenChannelEntity) {
    this.#data = WelcomeScreenChannelEntity.parse(data);
  }

  get channelId(): unknown {
    return this.#data.channel_id;
  }

  get description(): string {
    return this.#data.description;
  }

  get emojiId(): unknown | null {
    return this.#data.emoji_id ?? null;
  }

  get emojiName(): string | null {
    return this.#data.emoji_name ?? null;
  }

  static fromJson(json: WelcomeScreenChannelEntity): WelcomeScreenChannel {
    return new WelcomeScreenChannel(json);
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
