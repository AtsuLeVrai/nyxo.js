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
    data: Partial<z.input<typeof AttachmentEntity>> = {},
  ) {
    super(client, AttachmentEntity, data);
    this.#flags = new BitFieldManager(this.data.flags);
  }

  get id(): Snowflake {
    return this.data.id;
  }

  get filename(): string {
    return this.data.filename;
  }

  get title(): string | null {
    return this.data.title ?? null;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get contentType(): string | null {
    return this.data.content_type ?? null;
  }

  get size(): number {
    return this.data.size;
  }

  get url(): string {
    return this.data.url;
  }

  get proxyUrl(): string {
    return this.data.proxy_url;
  }

  get height(): number | null {
    return this.data.height ?? null;
  }

  get width(): number | null {
    return this.data.width ?? null;
  }

  get ephemeral(): boolean {
    return Boolean(this.data.ephemeral);
  }

  get durationSecs(): number | null {
    return this.data.duration_secs ?? null;
  }

  get waveform(): string | null {
    return this.data.waveform ?? null;
  }

  get flags(): BitFieldManager<AttachmentFlags> {
    return this.#flags;
  }

  toJson(): AttachmentEntity {
    return { ...this.data };
  }
}

export const AttachmentSchema = z.instanceof(Attachment);
