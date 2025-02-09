import { InviteMetadataEntity } from "@nyxjs/core";
import { z } from "zod";

export class InviteMetadata {
  readonly #data: InviteMetadataEntity;

  constructor(data: InviteMetadataEntity) {
    this.#data = InviteMetadataEntity.parse(data);
  }

  get uses(): number {
    return this.#data.uses;
  }

  get maxUses(): number {
    return this.#data.max_uses;
  }

  get maxAge(): number {
    return this.#data.max_age;
  }

  get temporary(): boolean {
    return Boolean(this.#data.temporary);
  }

  get createdAt(): string {
    return this.#data.created_at;
  }

  static fromJson(json: InviteMetadataEntity): InviteMetadata {
    return new InviteMetadata(json);
  }

  toJson(): InviteMetadataEntity {
    return { ...this.#data };
  }

  clone(): InviteMetadata {
    return new InviteMetadata(this.toJson());
  }

  validate(): boolean {
    try {
      InviteMetadataSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<InviteMetadataEntity>): InviteMetadata {
    return new InviteMetadata({ ...this.toJson(), ...other });
  }

  equals(other: InviteMetadata): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const InviteMetadataSchema = z.instanceof(InviteMetadata);
