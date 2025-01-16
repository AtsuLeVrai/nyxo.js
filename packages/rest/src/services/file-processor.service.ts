import { open, stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import { Readable } from "node:stream";
import FormData from "form-data";
import { lookup } from "mime-types";
import sharp from "sharp";
import type { Dispatcher } from "undici";
import { FileProcessingError } from "../errors/index.js";
import type {
  DataUri,
  FileInput,
  FileValidationOptions,
  ImageProcessingOptions,
  ProcessedFile,
} from "../types/index.js";

const DATA_URI_REGEX = /^data:(.+);base64,(.+)$/;
const MAX_ATTACHMENTS_PER_MESSAGE = 10;
const DEFAULT_MAX_TOTAL_SIZE = 10 * 1024 * 1024;

export class FileProcessorService {
  async createFormData(
    files: FileInput | FileInput[],
    body?: Dispatcher.RequestOptions["body"],
    imageOptions?: ImageProcessingOptions,
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new FileProcessingError(
        `Too many attachments. Maximum allowed: ${MAX_ATTACHMENTS_PER_MESSAGE}`,
      );
    }

    const form = new FormData();
    let totalSize = 0;

    for (let i = 0; i < filesArray.length; i++) {
      const processedFile = await this.processFile(
        filesArray[i] as FileInput,
        imageOptions,
      );

      totalSize += processedFile.size;
      if (totalSize > DEFAULT_MAX_TOTAL_SIZE) {
        throw new FileProcessingError(
          `Total files size exceeds limit: ${DEFAULT_MAX_TOTAL_SIZE} bytes`,
        );
      }

      const fieldName = filesArray.length === 1 ? "file" : `files[${i}]`;
      form.append(fieldName, processedFile.buffer, {
        filename: processedFile.filename,
        contentType: processedFile.contentType,
        knownLength: processedFile.size,
      });
    }

    if (body) {
      if (body instanceof Readable) {
        form.append("payload_json", body);
      } else if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
        form.append("payload_json", Buffer.from(body));
      } else if (typeof body === "string") {
        form.append("payload_json", body);
      } else {
        form.append("payload_json", JSON.stringify(body));
      }
    }

    return form;
  }

  async processFile(
    input: FileInput,
    imageOptions?: ImageProcessingOptions,
    validationOptions?: FileValidationOptions,
  ): Promise<ProcessedFile> {
    let processedFile: ProcessedFile;

    try {
      if (Buffer.isBuffer(input)) {
        processedFile = this.#processBuffer(input);
      } else if (input instanceof File) {
        processedFile = await this.#processFileObject(input);
      } else if (input instanceof URL) {
        processedFile = await this.#processFilePath(input.pathname);
      } else if (typeof input === "string") {
        if (this.#isDataUri(input)) {
          processedFile = this.#processDataUri(input);
        } else {
          processedFile = await this.#processFilePath(input);
        }
      } else {
        throw new FileProcessingError("Invalid file input type");
      }

      await this.#validateFile(processedFile, validationOptions);

      if (this.#isImage(processedFile.contentType) && imageOptions) {
        processedFile = await this.#processImage(processedFile, imageOptions);
      }

      if (imageOptions?.asDataUri) {
        processedFile.dataUri = this.#createDataUri(
          processedFile.buffer,
          processedFile.contentType,
        );
      }

      return processedFile;
    } catch (error) {
      if (error instanceof FileProcessingError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new FileProcessingError(
          `File processing failed: ${error.message}`,
          { cause: error },
        );
      }

      throw new FileProcessingError("File processing failed");
    }
  }

  async #validateFile(
    file: ProcessedFile,
    options: FileValidationOptions = {},
  ): Promise<void> {
    if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
      throw new FileProcessingError(
        `File size exceeds limit: ${options.maxSizeBytes} bytes`,
      );
    }

    const ext = extname(file.filename).toLowerCase();
    if (!options.allowedExtensions?.includes(ext)) {
      throw new FileProcessingError(`File extension not allowed: ${ext}`);
    }

    if (!options.allowedTypes?.includes(file.contentType)) {
      throw new FileProcessingError(
        `File type not allowed: ${file.contentType}`,
      );
    }

    if (options.validateImage && this.#isImage(file.contentType)) {
      await this.#validateImageDimensions(file.buffer, options);
    }
  }

  async #validateImageDimensions(
    buffer: Buffer,
    options: FileValidationOptions,
  ): Promise<void> {
    const metadata = await sharp(buffer).metadata();

    if (!(metadata.width && metadata.height)) {
      throw new FileProcessingError("Unable to get image dimensions");
    }

    if (options.maxWidth && metadata.width > options.maxWidth) {
      throw new FileProcessingError(
        `Image width exceeds maximum: ${metadata.width}px (max: ${options.maxWidth}px)`,
      );
    }

    if (options.maxHeight && metadata.height > options.maxHeight) {
      throw new FileProcessingError(
        `Image height exceeds maximum: ${metadata.height}px (max: ${options.maxHeight}px)`,
      );
    }

    if (options.minWidth && metadata.width < options.minWidth) {
      throw new FileProcessingError(
        `Image width below minimum: ${metadata.width}px (min: ${options.minWidth}px)`,
      );
    }

    if (options.minHeight && metadata.height < options.minHeight) {
      throw new FileProcessingError(
        `Image height below minimum: ${metadata.height}px (min: ${options.minHeight}px)`,
      );
    }
  }

  async #processImage(
    file: ProcessedFile,
    options: ImageProcessingOptions,
  ): Promise<ProcessedFile> {
    let transformer = sharp(file.buffer);

    if (options.format) {
      transformer = transformer.toFormat(options.format);
    }

    // biome-ignore lint/style/useExplicitLengthCheck: <explanation>
    if (options.size && options.size > 0) {
      transformer = transformer.resize(options.size, options.size, {
        fit: "contain",
        withoutEnlargement: true,
      });
    }

    const buffer = await transformer.toBuffer();

    let contentType = file.contentType;
    let filename = file.filename;

    if (options.format) {
      contentType = `image/${options.format}`;
      filename = this.#changeExtension(filename, options.format);
    }

    return {
      buffer,
      filename,
      contentType,
      size: buffer.length,
    };
  }

  #processBuffer(buffer: Buffer): ProcessedFile {
    return {
      buffer,
      filename: "file",
      contentType: "application/octet-stream",
      size: buffer.length,
    };
  }

  async #processFileObject(file: File): Promise<ProcessedFile> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
      buffer,
      filename: file.name,
      contentType: file.type || lookup(file.name) || "application/octet-stream",
      size: file.size,
    };
  }

  async #processFilePath(path: string): Promise<ProcessedFile> {
    const stats = await stat(path);
    const handle = await open(path);

    try {
      const buffer = await handle.readFile();
      const filename = basename(path);
      return {
        buffer,
        filename,
        contentType: lookup(filename) || "application/octet-stream",
        size: stats.size,
      };
    } finally {
      await handle.close();
    }
  }

  #processDataUri(dataUri: DataUri): ProcessedFile {
    const matches = dataUri.match(DATA_URI_REGEX);
    if (!matches) {
      throw new FileProcessingError("Invalid data URI format");
    }

    const [, contentType, base64Data] = matches;
    if (!(contentType && base64Data)) {
      throw new FileProcessingError("Missing content type or data in data URI");
    }

    const buffer = Buffer.from(base64Data, "base64");
    return {
      buffer,
      filename: `file.${this.#getExtensionFromMime(contentType)}`,
      contentType,
      size: buffer.length,
    };
  }

  #changeExtension(filename: string, newExt: string): string {
    const basename = filename.replace(/\.[^/.]+$/, "");
    return `${basename}.${newExt}`;
  }

  #getExtensionFromMime(mime: string): string {
    return mime.split("/")[1] || "bin";
  }

  #createDataUri(buffer: Buffer, contentType: string): string {
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  }

  #isDataUri(input: string): input is DataUri {
    return DATA_URI_REGEX.test(input);
  }

  #isImage(contentType: string): boolean {
    return contentType.startsWith("image/");
  }
}
