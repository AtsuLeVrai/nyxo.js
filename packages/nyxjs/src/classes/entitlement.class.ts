import type {
  EntitlementEntity,
  EntitlementType,
  Snowflake,
} from "@nyxjs/core";
import type { CamelCasedProperties } from "type-fest";
import { BaseClass, Cacheable } from "../bases/index.js";
import type { Enforce } from "../types/index.js";

@Cacheable("entitlements")
export class Entitlement
  extends BaseClass<EntitlementEntity>
  implements Enforce<CamelCasedProperties<EntitlementEntity>>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get skuId(): Snowflake {
    return this.data.sku_id;
  }

  get applicationId(): Snowflake {
    return this.data.application_id;
  }

  get userId(): Snowflake | undefined {
    return this.data.user_id;
  }

  get type(): EntitlementType {
    return this.data.type;
  }

  get deleted(): boolean {
    return Boolean(this.data.deleted);
  }

  get startsAt(): string | null {
    return this.data.starts_at;
  }

  get endsAt(): string | null {
    return this.data.ends_at;
  }

  get guildId(): Snowflake | undefined {
    return this.data.guild_id;
  }

  get consumed(): boolean {
    return Boolean(this.data.consumed);
  }
}
