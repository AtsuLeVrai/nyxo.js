import {
  AttachmentEntity,
  type AttachmentFlags,
  BitFieldManager,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class Attachment extends BaseClass<AttachmentEntity> {
  readonly #flags: BitFieldManager<AttachmentFlags>;

  constructor(
    client: Client,
    entity: Partial<z.input<typeof AttachmentEntity>> = {},
  ) {
    super(client, AttachmentEntity, entity);
    this.#flags = new BitFieldManager(this.entity.flags);
  }

  get id(): Snowflake {
    return this.entity.id;
  }

  get filename(): string {
    return this.entity.filename;
  }

  get title(): string | null {
    return this.entity.title ?? null;
  }

  get description(): string | null {
    return this.entity.description ?? null;
  }

  get contentType(): string | null {
    return this.entity.content_type ?? null;
  }

  get size(): number {
    return this.entity.size;
  }

  get url(): string {
    return this.entity.url;
  }

  get proxyUrl(): string {
    return this.entity.proxy_url;
  }

  get height(): number | null {
    return this.entity.height ?? null;
  }

  get width(): number | null {
    return this.entity.width ?? null;
  }

  get ephemeral(): boolean {
    return Boolean(this.entity.ephemeral);
  }

  get durationSecs(): number | null {
    return this.entity.duration_secs ?? null;
  }

  get waveform(): string | null {
    return this.entity.waveform ?? null;
  }

  get flags(): BitFieldManager<AttachmentFlags> {
    return this.#flags;
  }

  toJson(): AttachmentEntity {
    return { ...this.entity };
  }
}

export const AttachmentSchema = z.instanceof(Attachment);
