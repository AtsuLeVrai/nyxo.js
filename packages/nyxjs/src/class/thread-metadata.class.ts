import { ThreadMetadataEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ThreadMetadata extends BaseClass<ThreadMetadataEntity> {
  constructor(
    client: Client,
    data: Partial<z.input<typeof ThreadMetadataEntity>> = {},
  ) {
    super(client, ThreadMetadataEntity, data);
  }

  get archived(): boolean {
    return Boolean(this.data.archived);
  }

  get autoArchiveDuration(): 60 | 1440 | 4320 | 10080 {
    return this.data.auto_archive_duration;
  }

  get archiveTimestamp(): string {
    return this.data.archive_timestamp;
  }

  get locked(): boolean {
    return Boolean(this.data.locked);
  }

  get invitable(): boolean {
    return Boolean(this.data.invitable);
  }

  get createTimestamp(): string | null {
    return this.data.create_timestamp ?? null;
  }

  toJson(): ThreadMetadataEntity {
    return { ...this.data };
  }
}

export const ThreadMetadataSchema = z.instanceof(ThreadMetadata);
