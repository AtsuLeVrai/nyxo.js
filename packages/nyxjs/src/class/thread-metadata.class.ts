import { ThreadMetadataEntity } from "@nyxjs/core";
import { z } from "zod";
import { fromError } from "zod-validation-error";

export class ThreadMetadata {
  readonly #data: ThreadMetadataEntity;

  constructor(data: Partial<z.input<typeof ThreadMetadataEntity>> = {}) {
    try {
      this.#data = ThreadMetadataEntity.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  get archived(): boolean {
    return Boolean(this.#data.archived);
  }

  get autoArchiveDuration(): unknown {
    return this.#data.auto_archive_duration;
  }

  get archiveTimestamp(): string {
    return this.#data.archive_timestamp;
  }

  get locked(): boolean {
    return Boolean(this.#data.locked);
  }

  get invitable(): boolean | null {
    return this.#data.invitable ?? null;
  }

  get createTimestamp(): string | null {
    return this.#data.create_timestamp ?? null;
  }

  static fromJson(json: ThreadMetadataEntity): ThreadMetadata {
    return new ThreadMetadata(json);
  }

  toJson(): ThreadMetadataEntity {
    return { ...this.#data };
  }

  clone(): ThreadMetadata {
    return new ThreadMetadata(this.toJson());
  }

  validate(): boolean {
    try {
      ThreadMetadataSchema.parse(this.toJson());
      return true;
    } catch {
      return false;
    }
  }

  merge(other: Partial<ThreadMetadataEntity>): ThreadMetadata {
    return new ThreadMetadata({ ...this.toJson(), ...other });
  }

  equals(other: ThreadMetadata): boolean {
    return JSON.stringify(this.#data) === JSON.stringify(other.toJson());
  }
}

export const ThreadMetadataSchema = z.instanceof(ThreadMetadata);
