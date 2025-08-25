import {
  ComponentType,
  type FileEntity,
  type UnfurledMediaItemEntity,
} from "./message-components.entity.js";

export class FileBuilder {
  readonly #data: Partial<FileEntity> = {
    type: ComponentType.File,
  };
  constructor(data?: FileEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }
  static from(data: FileEntity): FileBuilder {
    return new FileBuilder(data);
  }
  setFile(file: UnfurledMediaItemEntity): this {
    this.#data.file = file;
    return this;
  }
  setFilename(filename: string): this {
    return this.setFile({ url: `attachment://${filename}` });
  }
  setSpoiler(spoiler = true): this {
    this.#data.spoiler = spoiler;
    return this;
  }
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }
  getFilename(): string | null {
    if (!this.#data.file?.url) {
      return null;
    }
    return this.#data.file.url.substring("attachment://".length);
  }
  build(): FileEntity {
    return this.#data as FileEntity;
  }
  toJson(): Readonly<FileEntity> {
    return Object.freeze({ ...this.#data }) as FileEntity;
  }
}
