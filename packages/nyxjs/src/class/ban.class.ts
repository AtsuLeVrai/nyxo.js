import { BanEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";
import { User } from "./user.class.js";

export class Ban extends BaseClass<BanEntity> {
  constructor(client: Client, data: Partial<z.input<typeof BanEntity>> = {}) {
    super(client, BanEntity, data);
  }

  get reason(): string | null {
    return this.data.reason ?? null;
  }

  get user(): User {
    return new User(this.client, this.data.user);
  }

  toJson(): BanEntity {
    return { ...this.data };
  }
}

export const BanSchema = z.instanceof(Ban);
