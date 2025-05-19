import { ComponentType, type FileEntity } from "@nyxojs/core";
import { z } from "zod/v4";
import { FileSchema, UnfurledMediaItemSchema } from "../schemas/index.js";

/**
 * A builder for creating Discord file components.
 *
 * File components allow you to display an uploaded file as an attachment.
 * This component only supports the attachment:// syntax for referencing files
 * that have been uploaded as part of the same message.
 *
 * This class follows the builder pattern with validation through Zod schemas
 * to ensure all elements meet Discord's requirements.
 */
export class FileBuilder {
  /** The internal file data being constructed */
  readonly #data: Partial<z.input<typeof FileSchema>> = {
    type: ComponentType.File,
  };

  /**
   * Creates a new FileBuilder instance.
   *
   * @param data - Optional initial data to populate the file with
   */
  constructor(data?: z.input<typeof FileSchema>) {
    if (data) {
      // Validate the initial data
      const result = FileSchema.safeParse(data);
      if (!result.success) {
        throw new Error(z.prettifyError(result.error));
      }

      this.#data = result.data;
    }
  }

  /**
   * Creates a new FileBuilder from existing file data.
   *
   * @param data - The file data to use
   * @returns A new FileBuilder instance with the provided data
   */
  static from(data: z.input<typeof FileSchema>): FileBuilder {
    return new FileBuilder(data);
  }

  /**
   * Sets the file reference using attachment syntax.
   * The URL must use the attachment:// prefix.
   *
   * @param file - The file reference with attachment URL
   * @returns The file builder instance for method chaining
   */
  setFile(file: z.input<typeof UnfurledMediaItemSchema>): this {
    const mediaItem = typeof file === "string" ? { url: file } : file;

    // Pre-validate that the URL uses the attachment:// syntax
    if (!mediaItem.url.startsWith("attachment://")) {
      throw new Error("File URL must use the attachment:// syntax");
    }

    // Ensure there's a filename after the prefix
    if (mediaItem.url.length <= "attachment://".length) {
      throw new Error("File URL must include a filename after attachment://");
    }

    const result = UnfurledMediaItemSchema.safeParse(mediaItem);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.file = result.data;
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
    if (!filename || filename.trim() === "") {
      throw new Error("Filename cannot be empty");
    }

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
    const result = FileSchema.shape.id.safeParse(id);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    this.#data.id = result.data;
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
   *
   * @returns The complete file entity
   * @throws Error if the file configuration is invalid
   */
  build(): FileEntity {
    // Validate the entire file component
    const result = FileSchema.safeParse(this.#data);
    if (!result.success) {
      throw new Error(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * Returns a JSON representation of the file.
   *
   * @returns A read-only copy of the file data
   */
  toJson(): Readonly<Partial<z.input<typeof FileSchema>>> {
    return Object.freeze({ ...this.#data });
  }
}
