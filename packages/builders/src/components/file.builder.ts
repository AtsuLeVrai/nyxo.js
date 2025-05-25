import {
  ComponentType,
  type FileEntity,
  type UnfurledMediaItemEntity,
} from "@nyxojs/core";

/**
 * A builder for creating Discord file components.
 *
 * File components allow you to display an uploaded file as an attachment.
 * This component only supports the attachment:// syntax for referencing files
 * that have been uploaded as part of the same message.
 */
export class FileBuilder {
  /** The internal file data being constructed */
  readonly #data: Partial<FileEntity> = {
    type: ComponentType.File,
  };

  /**
   * Creates a new FileBuilder instance.
   *
   * @param data - Optional initial data to populate the file with
   */
  constructor(data?: FileEntity) {
    if (data) {
      this.#data = { ...data };
    }
  }

  /**
   * Creates a new FileBuilder from existing file data.
   *
   * @param data - The file data to use
   * @returns A new FileBuilder instance with the provided data
   */
  static from(data: FileEntity): FileBuilder {
    return new FileBuilder(data);
  }

  /**
   * Sets the file reference using attachment syntax.
   * The URL must use the attachment:// prefix.
   *
   * @param file - The file reference with attachment URL
   * @returns The file builder instance for method chaining
   */
  setFile(file: UnfurledMediaItemEntity): this {
    this.#data.file = file;
    return this;
  }

  /**
   * Sets the filename for the file component.
   * This is a convenience method that automatically prefixes the filename with attachment://.
   *
   * @param filename - The filename of the attachment (without the attachment:// prefix)
   * @returns The file builder instance for method chaining
   */
  setFilename(filename: string): this {
    return this.setFile({ url: `attachment://${filename}` });
  }

  /**
   * Sets whether the file should be a spoiler (blurred out).
   *
   * @param spoiler - Whether the file should be a spoiler
   * @returns The file builder instance for method chaining
   */
  setSpoiler(spoiler = true): this {
    this.#data.spoiler = spoiler;
    return this;
  }

  /**
   * Sets the optional identifier for the component.
   *
   * @param id - The identifier to set
   * @returns The file builder instance for method chaining
   */
  setId(id: number): this {
    this.#data.id = id;
    return this;
  }

  /**
   * Gets the filename part from the attachment URL.
   * This extracts the filename without the attachment:// prefix.
   *
   * @returns The filename or null if no file has been set
   */
  getFilename(): string | null {
    if (!this.#data.file?.url) {
      return null;
    }

    return this.#data.file.url.substring("attachment://".length);
  }

  /**
   * Builds the final file entity object.
   * @returns The complete file entity
   */
  build(): FileEntity {
    return this.#data as FileEntity;
  }

  /**
   * Converts the file data to an immutable object.
   * @returns A read-only copy of the file data
   */
  toJson(): Readonly<FileEntity> {
    return Object.freeze({ ...this.#data }) as FileEntity;
  }
}
