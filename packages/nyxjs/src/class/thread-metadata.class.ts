import { ThreadMetadataEntity } from "@nyxjs/core";
import { z } from "zod";
import { BaseClass } from "../base/index.js";
import type { Client } from "../core/index.js";

export class ThreadMetadata extends BaseClass<ThreadMetadataEntity> {
  constructor(
    client: Client,
    entity: Partial<z.input<typeof ThreadMetadataEntity>> = {},
  ) {
    super(client, ThreadMetadataEntity, entity);
  }

  get archived(): boolean {
    return Boolean(this.entity.archived);
  }

  get autoArchiveDuration(): 60 | 1440 | 4320 | 10080 {
    return this.entity.auto_archive_duration;
  }

  get archiveTimestamp(): string {
    return this.entity.archive_timestamp;
  }

  get locked(): boolean {
    return Boolean(this.entity.locked);
  }

  get invitable(): boolean {
    return Boolean(this.entity.invitable);
  }

  get createTimestamp(): string | null {
    return this.entity.create_timestamp ?? null;
  }

  toJson(): ThreadMetadataEntity {
    return { ...this.entity };
  }
}

export const ThreadMetadataSchema = z.instanceof(ThreadMetadata);
