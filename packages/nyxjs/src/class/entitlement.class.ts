import { EntitlementEntity } from "@nyxjs/core";
import { z } from "zod";

export class Entitlement {
  readonly #data: EntitlementEntity;

  constructor(data: EntitlementEntity) {
    this.#data = EntitlementEntity.parse(data);
  }

  get id(): unknown {
    return this.#data.id;
  }

  get skuId(): unknown {
    return this.#data.sku_id;
  }

  get applicationId(): unknown {
    return this.#data.application_id;
  }

  get userId(): unknown | null {
    return this.#data.user_id ?? null;
  }

  get type(): unknown {
    return this.#data.type;
  }

  get deleted(): boolean {
    return Boolean(this.#data.deleted);
  }

  get startsAt(): string | null {
    return this.#data.starts_at ?? null;
  }

  get endsAt(): string | null {
    return this.#data.ends_at ?? null;
  }

  get guildId(): unknown | null {
    return this.#data.guild_id ?? null;
  }

  get consumed(): boolean | null {
    return this.#data.consumed ?? null;
  }

  static fromJson(json: EntitlementEntity): Entitlement {
    return new Entitlement(json);
  }

  toJson(): EntitlementEntity {
    return { ...this.#data };
  }

  clone(): Entitlement {
    return new Entitlement(this.toJson());
  }

  validate(): boolean {
    try {
      EntitlementSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<EntitlementEntity>): Entitlement {
    return new Entitlement({ ...this.toJson(), ...other });
  }

  equals(other: Entitlement): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const EntitlementSchema = z.instanceof(Entitlement);
