import {
  type AvatarDecorationDataEntity,
  BitFieldManager,
  type PremiumType,
  UserEntity,
  type UserFlags,
} from "@nyxjs/core";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import type { Client } from "../core/index.js";

export class User {
  readonly #client: Client;
  readonly #data: UserEntity;
  readonly #flags: BitFieldManager<UserFlags>;
  readonly #publicFlags: BitFieldManager<UserFlags>;

  constructor(client: Client, data: z.input<typeof UserEntity>) {
    this.#client = client;

    try {
      this.#data = UserEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager<UserFlags>(this.#data.flags);
    this.#publicFlags = new BitFieldManager<UserFlags>(this.#data.public_flags);
  }

  get id(): string {
    return this.#data.id;
  }

  get username(): string {
    return this.#data.username;
  }

  get discriminator(): string {
    return this.#data.discriminator;
  }

  get globalName(): string | null {
    return this.#data.global_name;
  }

  get avatar(): string | null {
    return this.#data.avatar;
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

  get locale(): string | null {
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
    return this.#data.avatar_decoration_data ?? null;
  }

  fetch(): Promise<UserEntity> {
    return this.#client.rest.users.getCurrentUser();
  }
}
