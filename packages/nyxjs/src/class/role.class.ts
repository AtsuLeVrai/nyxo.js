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

  constructor(
    client: Client,
    entity: Partial<z.input<typeof RoleEntity>> = {},
  ) {
    super(client, RoleEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get name(): string {
    return this.entity.name;
  }

  get color(): number {
    return this.entity.color;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get hoist(): boolean {
    return Boolean(this.entity.hoist);
  }

  get icon(): string | null {
    return this.entity.icon ?? null;
  }

  get unicodeEmoji(): string | null {
    return this.entity.unicode_emoji ?? null;
  }

  get position(): number {
    return this.entity.position;
  }

  get permissions(): string {
    return this.entity.permissions;
  }

  get managed(): boolean {
    return Boolean(this.entity.managed);
  }

  get mentionable(): boolean {
    return Boolean(this.entity.mentionable);
  }

  get tags(): RoleTags | null {
    return this.entity.tags
      ? new RoleTags(this.client, this.entity.tags)
      : null;
  }

  get flags(): BitFieldManager<RoleFlags> {
    return this.#flags;
  }

  toJson(): RoleEntity {
    return { ...this.entity };
  }
}

export const RoleSchema = z.instanceof(Role);
