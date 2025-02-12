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
    entity: Partial<z.input<typeof EntitlementEntity>> = {},
  ) {
    super(client, EntitlementEntity, entity);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get skuId(): Snowflake {
    return this.entity.sku_id;
  }

  get applicationId(): Snowflake {
    return this.entity.application_id;
  }

  get userId(): Snowflake | null {
    return this.entity.user_id ?? null;
  }

  get type(): EntitlementType {
    return this.entity.type;
  }

  get deleted(): boolean {
    return Boolean(this.entity.deleted);
  }

  get startsAt(): string | null {
    return this.entity.starts_at ?? null;
  }

  get endsAt(): string | null {
    return this.entity.ends_at ?? null;
  }

  get guildId(): Snowflake | null {
    return this.entity.guild_id ?? null;
  }

  get consumed(): boolean {
    return Boolean(this.entity.consumed);
  }

  toJson(): EntitlementEntity {
    return { ...this.entity };
  }
}

export const EntitlementSchema = z.instanceof(Entitlement);
