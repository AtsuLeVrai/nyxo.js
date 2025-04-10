import type {
  EmbedAuthorEntity,
  EmbedEntity,
  EmbedFieldEntity,
  EmbedFooterEntity,
  EmbedImageEntity,
  EmbedProviderEntity,
  EmbedThumbnailEntity,
  EmbedType,
  EmbedVideoEntity,
} from "@nyxjs/core";
import { BaseClass, type CacheEntityInfo } from "../../bases/index.js";
import type { EnforceCamelCase } from "../../types/index.js";

export class EmbedFooter
  extends BaseClass<EmbedFooterEntity>
  implements EnforceCamelCase<EmbedFooterEntity>
{
  get text(): string {
    return this.data.text;
  }

  get iconUrl(): string | undefined {
    return this.data.icon_url;
  }

  get proxyIconUrl(): string | undefined {
    return this.data.proxy_icon_url;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedImage
  extends BaseClass<EmbedImageEntity>
  implements EnforceCamelCase<EmbedImageEntity>
{
  get url(): string {
    return this.data.url;
  }

  get proxyUrl(): string | undefined {
    return this.data.proxy_url;
  }

  get height(): number | undefined {
    return this.data.height;
  }

  get width(): number | undefined {
    return this.data.width;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedThumbnail
  extends BaseClass<EmbedThumbnailEntity>
  implements EnforceCamelCase<EmbedThumbnailEntity>
{
  get url(): string {
    return this.data.url;
  }

  get proxyUrl(): string | undefined {
    return this.data.proxy_url;
  }

  get height(): number | undefined {
    return this.data.height;
  }

  get width(): number | undefined {
    return this.data.width;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedVideo
  extends BaseClass<EmbedVideoEntity>
  implements EnforceCamelCase<EmbedVideoEntity>
{
  get url(): string | undefined {
    return this.data.url;
  }

  get proxyUrl(): string | undefined {
    return this.data.proxy_url;
  }

  get height(): number | undefined {
    return this.data.height;
  }

  get width(): number | undefined {
    return this.data.width;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedProvider
  extends BaseClass<EmbedProviderEntity>
  implements EnforceCamelCase<EmbedProviderEntity>
{
  get name(): string | undefined {
    return this.data.name;
  }

  get url(): string | undefined {
    return this.data.url;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedAuthor
  extends BaseClass<EmbedAuthorEntity>
  implements EnforceCamelCase<EmbedAuthorEntity>
{
  get name(): string {
    return this.data.name;
  }

  get url(): string | undefined {
    return this.data.url;
  }

  get iconUrl(): string | undefined {
    return this.data.icon_url;
  }

  get proxyIconUrl(): string | undefined {
    return this.data.proxy_icon_url;
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class EmbedField
  extends BaseClass<EmbedFieldEntity>
  implements EnforceCamelCase<EmbedFieldEntity>
{
  get name(): string {
    return this.data.name;
  }

  get value(): string {
    return this.data.value;
  }

  get inline(): boolean {
    return Boolean(this.data.inline);
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}

export class Embed
  extends BaseClass<EmbedEntity>
  implements EnforceCamelCase<EmbedEntity>
{
  get title(): string | undefined {
    return this.data.title;
  }

  get type(): EmbedType {
    return this.data.type;
  }

  get description(): string | undefined {
    return this.data.description;
  }

  get url(): string | undefined {
    return this.data.url;
  }

  get timestamp(): string | undefined {
    return this.data.timestamp;
  }

  get color(): number | undefined {
    return this.data.color;
  }

  get footer(): EmbedFooter | undefined {
    if (!this.data.footer) {
      return undefined;
    }

    return EmbedFooter.from(this.client, this.data.footer);
  }

  get image(): EmbedImage | undefined {
    if (!this.data.image) {
      return undefined;
    }

    return EmbedImage.from(this.client, this.data.image);
  }

  get thumbnail(): EmbedThumbnail | undefined {
    if (!this.data.thumbnail) {
      return undefined;
    }

    return EmbedThumbnail.from(this.client, this.data.thumbnail);
  }

  get video(): EmbedVideo | undefined {
    if (!this.data.video) {
      return undefined;
    }

    return EmbedVideo.from(this.client, this.data.video);
  }

  get provider(): EmbedProvider | undefined {
    if (!this.data.provider) {
      return undefined;
    }

    return EmbedProvider.from(this.client, this.data.provider);
  }

  get author(): EmbedAuthor | undefined {
    if (!this.data.author) {
      return undefined;
    }

    return EmbedAuthor.from(this.client, this.data.author);
  }

  get fields(): EmbedField[] | undefined {
    if (!this.data.fields) {
      return undefined;
    }

    return this.data.fields.map((field) => EmbedField.from(this.client, field));
  }

  protected override getCacheInfo(): CacheEntityInfo | null {
    return null;
  }
}
