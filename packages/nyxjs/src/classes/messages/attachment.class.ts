import type { AttachmentEntity, AttachmentFlags, Snowflake } from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class Attachment
  extends BaseClass<AttachmentEntity>
  implements EnforceCamelCase<AttachmentEntity>
{
  get id(): Snowflake {
    return this.data.id;
  }

  get filename(): string {
    return this.data.filename;
  }

  get title(): string | undefined {
    return this.data.title;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get contentType(): string | undefined {
    return this.data.content_type;
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

  get height(): number | null | undefined {
    return this.data.height;
  }

  get width(): number | null | undefined {
    return this.data.width;
  }

  get ephemeral(): boolean {
    return Boolean(this.data.ephemeral);
  }

  get durationSecs(): number | undefined {
    return this.data.duration_secs;
  }

  get waveform(): string | undefined {
    return this.data.waveform;
  }

  get flags(): AttachmentFlags | undefined {
    return this.data.flags;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
