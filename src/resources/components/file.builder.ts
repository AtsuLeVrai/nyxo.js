import { BaseBuilder } from "../../bases/index.js";
import {
  ComponentType,
  type FileEntity,
  type UnfurledMediaItemEntity,
} from "./components.entity.js";

/**
 * @description Professional builder for Discord file attachment components in Components v2.
 * Used for displaying file attachments with metadata in modern message layouts.
 * @see {@link https://discord.com/developers/docs/components/reference#file}
 */
export class FileBuilder extends BaseBuilder<FileEntity> {
  constructor(data?: Partial<FileEntity>) {
    super({
      type: ComponentType.File,
      ...data,
    });
  }

  /**
   * @description Creates a file builder from existing data.
   * @param data - Existing file entity data
   * @returns New file builder instance
   */
  static from(data: FileEntity): FileBuilder {
    return new FileBuilder(data);
  }

  /**
   * @description Sets the complete file attachment for the component.
   * @param file - File attachment item
   * @returns This builder instance for method chaining
   */
  setFile(file: UnfurledMediaItemEntity): this {
    return this.set("file", file);
  }

  /**
   * @description Sets the file URL, creating or updating the file object.
   * @param url - File URL (must use attachment:// protocol)
   * @returns This builder instance for method chaining
   */
  setFileUrl(url: string): this {
    if (!url.startsWith("attachment://")) {
      throw new Error("File URL must use attachment:// protocol");
    }
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, url });
  }

  /**
   * @description Sets the file by attachment filename.
   * @param filename - Attachment filename (will be prefixed with attachment://)
   * @returns This builder instance for method chaining
   */
  setFilename(filename: string): this {
    return this.setFileUrl(`attachment://${filename}`);
  }

  /**
   * @description Sets the file size in bytes (auto-populated by Discord).
   * @param size - File size in bytes
   * @returns This builder instance for method chaining
   */
  setSize(size: number): this {
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, content_type: `size:${size}` });
  }

  /**
   * @description Sets the file name (auto-populated by Discord).
   * @param name - File name
   * @returns This builder instance for method chaining
   */
  setName(name: string): this {
    return this.set("name", name);
  }

  /**
   * @description Sets the file content type (auto-populated by Discord).
   * @param contentType - MIME type (e.g., "application/pdf", "text/plain")
   * @returns This builder instance for method chaining
   */
  setContentType(contentType: string): this {
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, content_type: contentType });
  }

  /**
   * @description Sets the Discord CDN proxy URL (auto-populated by Discord).
   * @param proxyUrl - Discord CDN URL
   * @returns This builder instance for method chaining
   */
  setProxyUrl(proxyUrl: string): this {
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, proxy_url: proxyUrl });
  }

  /**
   * @description Sets the attachment ID for uploaded files (auto-populated by Discord).
   * @param attachmentId - Discord attachment snowflake ID
   * @returns This builder instance for method chaining
   */
  setAttachmentId(attachmentId: string): this {
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, attachment_id: attachmentId });
  }

  /**
   * @description Sets whether the file should be blurred as a spoiler.
   * @param spoiler - Whether file is a spoiler (defaults to true)
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
   * @description Creates a file from an attachment reference.
   * @param filename - Attachment filename
   * @param spoiler - Whether file is a spoiler
   * @returns This builder instance for method chaining
   */
  setFromAttachment(filename: string, spoiler = false): this {
    return this.setFilename(filename).setSpoiler(spoiler);
  }

  /**
   * @description Gets the filename from the attachment URL.
   * @returns Filename without attachment:// prefix, or null if no file set
   */
  getFilename(): string | null {
    const file = this.get("file");
    if (!file?.url) {
      return null;
    }
    if (!file.url.startsWith("attachment://")) {
      return null;
    }
    return file.url.substring("attachment://".length);
  }

  /**
   * @description Creates a document file component.
   * @param filename - Document filename
   * @param spoiler - Whether file is a spoiler
   * @returns This builder instance for method chaining
   */
  createDocument(filename: string, spoiler = false): this {
    return this.setFromAttachment(filename, spoiler);
  }

  /**
   * @description Creates an archive file component.
   * @param filename - Archive filename
   * @param spoiler - Whether file is a spoiler
   * @returns This builder instance for method chaining
   */
  createArchive(filename: string, spoiler = false): this {
    return this.setFromAttachment(filename, spoiler);
  }

  /**
   * @description Validates file data before building.
   * @throws {Error} When file configuration is invalid
   */
  protected validate(): void {
    const data = this.rawData;

    if (!data.file) {
      throw new Error("File component must have a file");
    }

    if (!data.file.url) {
      throw new Error("File component must have a file URL");
    }

    // Validate that file uses attachment:// protocol
    if (!data.file.url.startsWith("attachment://")) {
      throw new Error("File component URL must use attachment:// protocol");
    }

    // Validate filename is not empty
    const filename = data.file.url.substring("attachment://".length);
    if (!filename) {
      throw new Error("File component must have a valid attachment filename");
    }
  }
}
