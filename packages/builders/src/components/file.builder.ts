import {
  ComponentType,
  type FileEntity,
  type UnfurledMediaItemEntity,
} from "@nyxojs/core";

/**
 * Builder for file components.
 *
 * File components allow you to display an uploaded file as an attachment.
 *
 * @example
 * ```typescript
 * const file = new FileBuilder()
 *   .setFile({ url: 'attachment://document.pdf' })
 *   .build();
 * ```
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
  constructor(data?: Partial<FileEntity>) {
    if (data) {
      this.#data = {
        ...data,
        type: ComponentType.File, // Ensure type is set correctly
      };
    }
  }

  /**
   * Creates a new FileBuilder from existing file data.
   *
   * @param data - The file data to use
   * @returns A new FileBuilder instance with the provided data
   */
  static from(data: Partial<FileEntity>): FileBuilder {
    return new FileBuilder(data);
  }

  /**
   * Sets the file reference using attachment syntax.
   *
   * @param file - The file reference with attachment URL
   * @returns The file builder instance for method chaining
   */
  setFile(file: UnfurledMediaItemEntity): this {
    if (!file.url.startsWith("attachment://")) {
      throw new Error("File URL must use the attachment:// syntax");
    }

    this.#data.file = file;
    return this;
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
   * Builds the final file entity object.
   *
   * @returns The complete file entity
   * @throws Error if the file configuration is invalid
   */
  build(): FileEntity {
    if (!this.#data.file?.url) {
      throw new Error("File component must have a file with a URL");
    }

    if (!this.#data.file.url.startsWith("attachment://")) {
      throw new Error("File URL must use the attachment:// syntax");
    }

    return this.#data as FileEntity;
  }

  /**
   * Returns a JSON representation of the file.
   *
   * @returns A read-only copy of the file data
   */
  toJson(): Readonly<Partial<FileEntity>> {
    return Object.freeze({ ...this.#data });
  }
}
