import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type Locale,
  type PremiumType,
  type Snowflake,
  UserEntity,
  type UserFlags,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class User {
  readonly #data: UserEntity;
  readonly #flags: BitFieldManager<UserFlags>;
  readonly #publicFlags: BitFieldManager<UserFlags>;

  constructor(data: Partial<z.input<typeof UserEntity>> = {}) {
    try {
      this.#data = UserEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
    this.#publicFlags = new BitFieldManager(this.#data.public_flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get username(): string {
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

  get bot(): boolean {
    return Boolean(this.#data.bot);
  }

  get system(): boolean {
    return Boolean(this.#data.system);
  }

  get mfaEnabled(): boolean {
    return Boolean(this.#data.mfa_enabled);
  }

  get banner(): string | null {
    return this.#data.banner ?? null;
  }

  get accentColor(): number | null {
    return this.#data.accent_color ?? null;
  }

  get locale(): Locale | null {
    return this.#data.locale ?? null;
  }

  get verified(): boolean {
    return Boolean(this.#data.verified);
  }

  get email(): string | null {
    return this.#data.email ?? null;
  }

  get flags(): BitFieldManager<UserFlags> {
    return this.#flags;
  }

  get premiumType(): PremiumType | null {
    return this.#data.premium_type ?? null;
  }

  get publicFlags(): BitFieldManager<UserFlags> {
    return this.#publicFlags;
  }

  get avatarDecorationData(): AvatarDecorationDataEntity | null {
    return this.#data.avatar_decoration_data
      ? { ...this.#data.avatar_decoration_data }
      : null;
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
