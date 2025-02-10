import { RoleTagsEntity, type Snowflake } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class RoleTags {
  readonly #data: RoleTagsEntity;

  constructor(data: Partial<z.input<typeof RoleTagsEntity>> = {}) {
    try {
      this.#data = RoleTagsEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get botId(): Snowflake | null {
    return this.#data.bot_id ?? null;
  }

  get integrationId(): Snowflake | null {
    return this.#data.integration_id ?? null;
  }

  get premiumSubscriber(): null {
    return this.#data.premium_subscriber ?? null;
  }

  get subscriptionListingId(): Snowflake | null {
    return this.#data.subscription_listing_id ?? null;
  }

  get availableForPurchase(): null {
    return this.#data.available_for_purchase ?? null;
  }

  get guildConnections(): null {
    return this.#data.guild_connections ?? null;
  }

  toJson(): RoleTagsEntity {
    return { ...this.#data };
  }

  clone(): RoleTags {
    return new RoleTags(this.toJson());
  }

  validate(): boolean {
    try {
      RoleTagsSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<RoleTagsEntity>): RoleTags {
    return new RoleTags({ ...this.toJson(), ...other });
  }

  equals(other: RoleTags): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const RoleTagsSchema = z.instanceof(RoleTags);
