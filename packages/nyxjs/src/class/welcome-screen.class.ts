import { WelcomeScreenEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class WelcomeScreen {
  readonly #data: WelcomeScreenEntity;

  constructor(data: Partial<z.input<typeof WelcomeScreenEntity>> = {}) {
    try {
      this.#data = WelcomeScreenEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get welcomeChannels(): object[] {
    return Array.isArray(this.#data.welcome_channels)
      ? [...this.#data.welcome_channels]
      : [];
  }

  static fromJson(json: WelcomeScreenEntity): WelcomeScreen {
    return new WelcomeScreen(json);
  }

  toJson(): WelcomeScreenEntity {
    return { ...this.#data };
  }

  clone(): WelcomeScreen {
    return new WelcomeScreen(this.toJson());
  }

  validate(): boolean {
    try {
      WelcomeScreenSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<WelcomeScreenEntity>): WelcomeScreen {
    return new WelcomeScreen({ ...this.toJson(), ...other });
  }

  equals(other: WelcomeScreen): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const WelcomeScreenSchema = z.instanceof(WelcomeScreen);
