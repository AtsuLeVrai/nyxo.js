import {
  BitFieldManager,
  RoleEntity,
  type RoleFlags,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { RoleTags } from "./role-tags.class.js";

export class Role extends BaseClass<RoleEntity> {
  readonly #flags: BitFieldManager<RoleFlags>;

  constructor(client: Client, data: Partial<z.input<typeof RoleEntity>> = {}) {
    super(client, RoleEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get color(): number {
    return this.data.color;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get hoist(): boolean {
    return Boolean(this.data.hoist);
  }

  get icon(): string | null {
    return this.data.icon ?? null;
  }

  get unicodeEmoji(): string | null {
    return this.data.unicode_emoji ?? null;
  }

  get position(): number {
    return this.data.position;
  }

  get permissions(): string {
    return this.data.permissions;
  }

  get managed(): boolean {
    return Boolean(this.data.managed);
  }

  get mentionable(): boolean {
    return Boolean(this.data.mentionable);
  }

  get tags(): RoleTags | null {
    return this.data.tags ? new RoleTags(this.client, this.data.tags) : null;
  }

  get flags(): BitFieldManager<RoleFlags> {
    return this.#flags;
  }

  toJson(): RoleEntity {
    return { ...this.data };
  }
}

export const RoleSchema = z.instanceof(Role);
