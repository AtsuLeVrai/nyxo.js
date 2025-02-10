import {
  AttachmentEntity,
  type AttachmentFlags,
  BitFieldManager,
  type Snowflake,
} from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class Attachment {
  readonly #data: AttachmentEntity;
  readonly #flags: BitFieldManager<AttachmentFlags>;

  constructor(data: Partial<z.input<typeof AttachmentEntity>> = {}) {
    try {
      this.#data = AttachmentEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#flags = new BitFieldManager(this.#data.flags);
  }

  get id(): Snowflake {
    return this.#data.id;
  }

  get filename(): string {
    return this.#data.filename;
  }

  get title(): string | null {
    return this.#data.title ?? null;
  }

  get description(): string | null {
    return this.#data.description ?? null;
  }

  get contentType(): string | null {
    return this.#data.content_type ?? null;
  }

  get size(): number {
    return this.#data.size;
  }

  get url(): string {
    return this.#data.url;
  }

  get proxyUrl(): string {
    return this.#data.proxy_url;
  }

  get height(): number | null {
    return this.#data.height ?? null;
  }

  get width(): number | null {
    return this.#data.width ?? null;
  }

  get ephemeral(): boolean {
    return Boolean(this.#data.ephemeral);
  }

  get durationSecs(): number | null {
    return this.#data.duration_secs ?? null;
  }

  get waveform(): string | null {
    return this.#data.waveform ?? null;
  }

  get flags(): BitFieldManager<AttachmentFlags> {
    return this.#flags;
  }

  toJson(): AttachmentEntity {
    return { ...this.#data };
  }

  clone(): Attachment {
    return new Attachment(this.toJson());
  }

  validate(): boolean {
    try {
      AttachmentSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<AttachmentEntity>): Attachment {
    return new Attachment({ ...this.toJson(), ...other });
  }

  equals(other: Attachment): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const AttachmentSchema = z.instanceof(Attachment);
