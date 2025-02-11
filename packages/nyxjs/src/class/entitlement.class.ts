import {
  EntitlementEntity,
  type EntitlementType,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class Entitlement extends BaseClass<EntitlementEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof EntitlementEntity>> = {},
  ) {
    super(client, EntitlementEntity, data);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get skuId(): Snowflake {
    return this.data.sku_id;
  }

  get applicationId(): Snowflake {
    return this.data.application_id;
  }

  get userId(): Snowflake | null {
    return this.data.user_id ?? null;
  }

  get type(): EntitlementType {
    return this.data.type;
  }

  get deleted(): boolean {
    return Boolean(this.data.deleted);
  }

  get startsAt(): string | null {
    return this.data.starts_at ?? null;
  }

  get endsAt(): string | null {
    return this.data.ends_at ?? null;
  }

  get guildId(): Snowflake | null {
    return this.data.guild_id ?? null;
  }

  get consumed(): boolean {
    return Boolean(this.data.consumed);
  }

  toJson(): EntitlementEntity {
    return { ...this.data };
  }
}

export const EntitlementSchema = z.instanceof(Entitlement);
