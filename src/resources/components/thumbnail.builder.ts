import { BaseBuilder } from "../../bases/index.js";
import {
  ComponentType,
  type ThumbnailEntity,
  type UnfurledMediaItemEntity,
} from "./components.entity.js";

/**
 * @description Professional builder for Discord thumbnail components in Components v2.
 * Used as small image accessories in section layouts.
 * @see {@link https://discord.com/developers/docs/components/reference#thumbnail}
 */
export class ThumbnailBuilder extends BaseBuilder<ThumbnailEntity> {
  constructor(data?: Partial<ThumbnailEntity>) {
    super({
      type: ComponentType.Thumbnail,
      ...data,
    });
  }

  /**
   * @description Creates a thumbnail builder from existing data.
   * @param data - Existing thumbnail entity data
   * @returns New thumbnail builder instance
   */
  static from(data: ThumbnailEntity): ThumbnailBuilder {
    return new ThumbnailBuilder(data);
  }

  /**
   * @description Sets the complete media item for the thumbnail.
   * @param media - Media item with URL and metadata
   * @returns This builder instance for method chaining
   */
  setMedia(media: UnfurledMediaItemEntity): this {
    return this.set("media", media);
  }

  /**
   * @description Sets the media URL, creating or updating the media object.
   * @param url - Image URL or attachment reference (attachment://filename)
   * @returns This builder instance for method chaining
   */
  setMediaUrl(url: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, url });
  }

  /**
   * @description Sets the media width in pixels (usually auto-populated by Discord).
   * @param width - Image width in pixels
   * @returns This builder instance for method chaining
   */
  setWidth(width: number): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, width });
  }

  /**
   * @description Sets the media height in pixels (usually auto-populated by Discord).
   * @param height - Image height in pixels
   * @returns This builder instance for method chaining
   */
  setHeight(height: number): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, height });
  }

  /**
   * @description Sets the content type (usually auto-populated by Discord).
   * @param contentType - MIME type (e.g., "image/png", "image/jpeg")
   * @returns This builder instance for method chaining
   */
  setContentType(contentType: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, content_type: contentType });
  }

  /**
   * @description Sets the Discord CDN proxy URL (auto-populated by Discord).
   * @param proxyUrl - Discord CDN URL
   * @returns This builder instance for method chaining
   */
  setProxyUrl(proxyUrl: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, proxy_url: proxyUrl });
  }

  /**
   * @description Sets the attachment ID for uploaded files (auto-populated by Discord).
   * @param attachmentId - Discord attachment snowflake ID
   * @returns This builder instance for method chaining
   */
  setAttachmentId(attachmentId: string): this {
    const existingMedia = this.get("media") as UnfurledMediaItemEntity;
    return this.set("media", { ...existingMedia, attachment_id: attachmentId });
  }

  /**
   * @description Sets the alt text description for accessibility.
   * @param description - Alt text description (max 1024 characters)
   * @returns This builder instance for method chaining
   */
  setDescription(description: string): this {
    if (description.length > 1024) {
      throw new Error("Thumbnail description cannot exceed 1024 characters");
    }
    return this.set("description", description);
  }

  /**
   * @description Sets whether the image should be blurred as a spoiler.
   * @param spoiler - Whether image is a spoiler (defaults to true)
   * @returns This builder instance for method chaining
   */
  setSpoiler(spoiler = true): this {
    return this.set("spoiler", spoiler);
  }

  /**
   * @description Sets the unique component identifier within the message.
   * @param id - Component identifier
   * @returns This builder instance for method chaining
   */
  setId(id: number): this {
    return this.set("id", id);
  }

  /**
   * @description Creates a thumbnail from an attachment reference.
   * @param filename - Attachment filename (will be prefixed with attachment://)
   * @param description - Alt text description
   * @returns This builder instance for method chaining
   */
  setFromAttachment(filename: string, description?: string): this {
    this.setMediaUrl(`attachment://${filename}`);
    if (description) this.setDescription(description);
    return this;
  }

  /**
   * @description Creates a thumbnail from a direct image URL.
   * @param url - Direct image URL
   * @param description - Alt text description
   * @returns This builder instance for method chaining
   */
  setFromUrl(url: string, description?: string): this {
    this.setMediaUrl(url);
    if (description) this.setDescription(description);
    return this;
  }

  /**
   * @description Validates thumbnail data before building.
   * @throws {Error} When thumbnail configuration is invalid
   */
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
