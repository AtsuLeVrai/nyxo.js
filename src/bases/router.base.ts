import type { FileInput, Rest } from "../core/index.js";

export abstract class BaseRouter {
  protected readonly rest: Rest;

  constructor(rest: Rest) {
    this.rest = rest;
  }

  protected async processFileOptions<T extends Record<string, any>>(
    options: T,
    fileFields: (keyof T)[],
  ): Promise<T> {
    const processedOptions = { ...options };

    for (const field of fileFields) {
      const value = processedOptions[field];
      if (value && this.#isFileInput(value)) {
        // @ts-expect-error - we are ensuring the type above
        processedOptions[field] = await this.rest.toDataUri(value);
      }
    }

    return processedOptions;
  }

  #isFileInput(value: any): value is FileInput {
    return (
      value != null &&
      (typeof value === "string" ||
        value instanceof ArrayBuffer ||
        value instanceof Uint8Array ||
        (typeof File !== "undefined" && value instanceof File) ||
        (typeof Blob !== "undefined" && value instanceof Blob))
    );
  }
}
