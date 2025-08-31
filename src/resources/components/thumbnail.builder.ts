import { BaseBuilder } from "../../bases/index.js";
import {
  ComponentType,
  type ThumbnailEntity,
  type UnfurledMediaItemEntity,
} from "./components.entity.js";

export class ThumbnailBuilder extends BaseBuilder<ThumbnailEntity> {
  constructor(data?: Partial<ThumbnailEntity>) {
    super({
      type: ComponentType.Thumbnail,
      ...data,
    });
  }

  static from(data: ThumbnailEntity): ThumbnailBuilder {
    return new ThumbnailBuilder(data);
  }

  setMedia(media: UnfurledMediaItemEntity): this {
    return this.set("media", media);
  }

  setMediaUrl(url: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, url });
  }

  setWidth(width: number): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, width });
  }

  setHeight(height: number): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, height });
  }

  setContentType(contentType: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, content_type: contentType });
  }

  setProxyUrl(proxyUrl: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, proxy_url: proxyUrl });
  }

  setAttachmentId(attachmentId: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, attachment_id: attachmentId });
  }

  setDescription(description: string): this {
    if (description.length > 1024) {
      throw new Error("Thumbnail description cannot exceed 1024 characters");
    }
    return this.set("description", description);
  }

  setSpoiler(spoiler = true): this {
    return this.set("spoiler", spoiler);
  }

  setId(id: number): this {
    return this.set("id", id);
  }

  setFromAttachment(filename: string, description?: string): this {
    this.setMediaUrl(`attachment://${filename}`);
    if (description) this.setDescription(description);
    return this;
  }

  setFromUrl(url: string, description?: string): this {
    this.setMediaUrl(url);
    if (description) this.setDescription(description);
    return this;
  }

  protected validate(): void {
    const data = this.rawData;

    if (!data.media) {
      throw new Error("Thumbnail must have media");
    }

    if (!data.media.url) {
      throw new Error("Thumbnail media must have a URL");
    }

    // Validate URL format
    const url = data.media.url;
    if (!url.startsWith("http") && !url.startsWith("attachment://")) {
      throw new Error("Thumbnail URL must be a valid HTTP URL or attachment reference");
    }

    // Validate dimensions if provided
    if (data.media.width && data.media.width <= 0) {
      throw new Error("Thumbnail width must be positive");
    }
    if (data.media.height && data.media.height <= 0) {
      throw new Error("Thumbnail height must be positive");
    }
  }
}
