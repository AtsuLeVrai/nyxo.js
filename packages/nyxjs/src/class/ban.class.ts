import { BanEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class Ban extends BaseClass<BanEntity> {
  constructor(client: Client, entity: Partial<z.input<typeof BanEntity>> = {}) {
    super(client, BanEntity, entity);
  }

  get reason(): string | null {
    return this.entity.reason ?? null;
  }

  get user(): User {
    return new User(this.client, this.entity.user);
  }

  toJson(): BanEntity {
    return { ...this.entity };
  }
}

export const BanSchema = z.instanceof(Ban);
