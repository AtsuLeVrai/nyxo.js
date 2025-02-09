import { IntegrationAccountEntity } from "@nyxjs/core";
import { z } from "zod";

export class IntegrationAccount {
  readonly #data: IntegrationAccountEntity;

  constructor(data: IntegrationAccountEntity) {
    this.#data = IntegrationAccountEntity.parse(data);
  }

  get id(): string {
    return this.#data.id;
  }

  get name(): string {
    return this.#data.name;
  }

  static fromJson(json: IntegrationAccountEntity): IntegrationAccount {
    return new IntegrationAccount(json);
  }

  toJson(): IntegrationAccountEntity {
    return { ...this.#data };
  }

  clone(): IntegrationAccount {
    return new IntegrationAccount(this.toJson());
  }

  validate(): boolean {
    try {
      IntegrationAccountSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<IntegrationAccountEntity>): IntegrationAccount {
    return new IntegrationAccount({ ...this.toJson(), ...other });
  }

  equals(other: IntegrationAccount): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const IntegrationAccountSchema = z.instanceof(IntegrationAccount);
