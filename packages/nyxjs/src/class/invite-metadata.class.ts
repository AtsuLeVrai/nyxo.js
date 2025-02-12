import { InviteMetadataEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class InviteMetadata extends BaseClass<InviteMetadataEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof InviteMetadataEntity>> = {},
  ) {
    super(client, InviteMetadataEntity, entity);
  }

  get uses(): number {
    return this.entity.uses;
  }

  get maxUses(): number {
    return this.entity.max_uses;
  }

  get maxAge(): number {
    return this.entity.max_age;
  }

  get temporary(): boolean {
    return Boolean(this.entity.temporary);
  }

  get createdAt(): string {
    return this.entity.created_at;
  }

  toJson(): InviteMetadataEntity {
    return { ...this.entity };
  }
}

export const InviteMetadataSchema = z.instanceof(InviteMetadata);
