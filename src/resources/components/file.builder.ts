import { BaseBuilder } from "../../bases/index.js";
import {
  ComponentType,
  type FileEntity,
  type UnfurledMediaItemEntity,
} from "./components.entity.js";

export class FileBuilder extends BaseBuilder<FileEntity> {
  constructor(data?: Partial<FileEntity>) {
    super({
      type: ComponentType.File,
      ...data,
    });
  }

  static from(data: FileEntity): FileBuilder {
    return new FileBuilder(data);
  }

  setFile(file: UnfurledMediaItemEntity): this {
    return this.set("file", file);
  }

  setFileUrl(url: string): this {
    if (!url.startsWith("attachment://")) {
      throw new Error("File URL must use attachment:// protocol");
    }
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, url });
  }

  setFilename(filename: string): this {
    return this.setFileUrl(`attachment://${filename}`);
  }

  setSize(size: number): this {
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, content_type: `size:${size}` });
  }

  setName(name: string): this {
    return this.set("name", name);
  }

  setContentType(contentType: string): this {
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, content_type: contentType });
  }

  setProxyUrl(proxyUrl: string): this {
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, proxy_url: proxyUrl });
  }

  setAttachmentId(attachmentId: string): this {
    const existingFile = this.get("file") as UnfurledMediaItemEntity;
    return this.set("file", { ...existingFile, attachment_id: attachmentId });
  }

  setSpoiler(spoiler = true): this {
    return this.set("spoiler", spoiler);
  }

  setId(id: number): this {
    return this.set("id", id);
  }

  setFromAttachment(filename: string, spoiler = false): this {
    return this.setFilename(filename).setSpoiler(spoiler);
  }

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

  createDocument(filename: string, spoiler = false): this {
    return this.setFromAttachment(filename, spoiler);
  }

  createArchive(filename: string, spoiler = false): this {
    return this.setFromAttachment(filename, spoiler);
  }

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
