import { InviteMetadataEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class InviteMetadata extends BaseClass<InviteMetadataEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof InviteMetadataEntity>> = {},
  ) {
    super(client, InviteMetadataEntity, data);
  }

  get uses(): number {
    return this.data.uses;
  }

  get maxUses(): number {
    return this.data.max_uses;
  }

  get maxAge(): number {
    return this.data.max_age;
  }

  get temporary(): boolean {
    return Boolean(this.data.temporary);
  }

  get createdAt(): string {
    return this.data.created_at;
  }

  toJson(): InviteMetadataEntity {
    return { ...this.data };
  }
}

export const InviteMetadataSchema = z.instanceof(InviteMetadata);
