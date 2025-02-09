import { RoleEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Role {
  readonly #data: RoleEntity;

  constructor(data: Partial<z.input<typeof RoleEntity>> = {}) {
    try {
      this.#data = RoleEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get id(): unknown {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  get color(): number {
    return this.#data.color;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get hoist(): boolean {
    return Boolean(this.#data.hoist);
  }

  get icon(): string | null {
    return this.#data.icon ?? null;
  }

  get unicodeEmoji(): string | null {
    return this.#data.unicode_emoji ?? null;
  }

  get position(): number {
    return this.#data.position;
  }

  get permissions(): string {
    return this.#data.permissions;
  }

  get managed(): boolean {
    return Boolean(this.#data.managed);
  }

  get mentionable(): boolean {
    return Boolean(this.#data.mentionable);
  }

  get tags(): object | null {
    return this.#data.tags ?? null;
  }

  get flags(): unknown {
    return this.#data.flags;
  }

  static fromJson(json: RoleEntity): Role {
    return new Role(json);
  }

  toJson(): RoleEntity {
    return { ...this.#data };
  }

  clone(): Role {
    return new Role(this.toJson());
  }

  validate(): boolean {
    try {
      RoleSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<RoleEntity>): Role {
    return new Role({ ...this.toJson(), ...other });
  }

  equals(other: Role): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const RoleSchema = z.instanceof(Role);
