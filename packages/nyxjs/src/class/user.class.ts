import { UserEntity } from "@nyxjs/core";
import { z } from "zod";

export class User {
  readonly #data: UserEntity;

  constructor(data: UserEntity) {
    this.#data = UserEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get username(): unknown {
    return this.#data.username;
  }

  get discriminator(): string {
    return this.#data.discriminator;
  }

  get globalName(): string | null {
    return this.#data.global_name ?? null;
  }

  get avatar(): string | null {
    return this.#data.avatar ?? null;
  }

  get bot(): boolean | null {
    return this.#data.bot ?? null;
  }

  get system(): boolean | null {
    return this.#data.system ?? null;
  }

  get mfaEnabled(): boolean | null {
    return this.#data.mfa_enabled ?? null;
  }

  get banner(): string | null {
    return this.#data.banner ?? null;
  }

  get accentColor(): number | null {
    return this.#data.accent_color ?? null;
  }

  get locale(): unknown | null {
    return this.#data.locale ?? null;
  }

  get verified(): boolean | null {
    return this.#data.verified ?? null;
  }

  get email(): string | null {
    return this.#data.email ?? null;
  }

  get flags(): unknown | null {
    return this.#data.flags ?? null;
  }

  get premiumType(): unknown | null {
    return this.#data.premium_type ?? null;
  }

  get publicFlags(): unknown | null {
    return this.#data.public_flags ?? null;
  }

  get avatarDecorationData(): object | null {
    return this.#data.avatar_decoration_data ?? null;
  }

  static fromJson(json: UserEntity): User {
    return new User(json);
  }

  toJson(): UserEntity {
    return { ...this.#data };
  }

  clone(): User {
    return new User(this.toJson());
  }

  validate(): boolean {
    try {
      UserSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<UserEntity>): User {
    return new User({ ...this.toJson(), ...other });
  }

  equals(other: User): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const UserSchema = z.instanceof(User);
