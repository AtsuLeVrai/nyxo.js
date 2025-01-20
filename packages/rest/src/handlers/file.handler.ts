import { open, stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import { Readable } from "node:stream";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";
import { lookup } from "mime-types";
import sharp from "sharp";
import type { Dispatcher } from "undici";
import type { z } from "zod";
import { fromError } from "zod-validation-error";
import { FileError } from "../errors/index.js";
import { FileOptions } from "../options/index.js";
import type {
  DataUri,
  FileInput,
  FileValidationOptions,
  ImageProcessingOptions,
  ProcessedFile,
} from "../types/index.js";

const DATA_URI_REGEX = /^data:(.+);base64,(.+)$/;
const FILE_URI_REGEX = /^[/.]|^[a-zA-Z]:\\/;
const FILE_NAME_REPLACE_REGEX = /\.[^/.]+$/;

function isValidSingleInput(value: unknown): value is FileInput {
  return (
    FileHandler.isBuffer(value) ||
    FileHandler.isFile(value) ||
    FileHandler.isUrl(value) ||
    FileHandler.isBlob(value) ||
    FileHandler.isArrayBuffer(value) ||
    FileHandler.isUint8Array(value) ||
    FileHandler.isReadable(value) ||
    FileHandler.isReadableStream(value) ||
    (typeof value === "string" &&
      (FileHandler.isDataUri(value) ||
        FileHandler.isFilePath(value) ||
        FileHandler.isValidUrl(value)))
  );
}

export class FileHandler {
  readonly #options: z.output<typeof FileOptions>;

  constructor(options: z.input<typeof FileOptions> = {}) {
    try {
      this.#options = FileOptions.parse(options);
    } catch (error) {
      throw new FileError(fromError(error).message);
    }
  }

  static isBuffer(input: unknown): input is Buffer {
    return Buffer.isBuffer(input);
  }

  static isFile(input: unknown): input is File {
    return typeof File !== "undefined" && input instanceof File;
  }

  static isDataUri(input: unknown): input is DataUri {
    if (typeof input !== "string") {
      return false;
    }

    return DATA_URI_REGEX.test(input);
  }

  static isUrl(input: unknown): input is URL {
    return input instanceof URL;
  }

  static isFileUrl(input: unknown): input is URL {
    return input instanceof URL && input.protocol === "file:";
  }

  static isBlobUrl(input: unknown): input is URL {
    return input instanceof URL && input.protocol === "blob:";
  }

  static isFilePath(input: unknown): input is string {
    if (typeof input !== "string") {
      return false;
    }

    return FILE_URI_REGEX.test(input);
  }

  static isReadable(input: unknown): input is Readable {
    return input instanceof Readable;
  }

  static isBlob(input: unknown): input is Blob {
    return typeof Blob !== "undefined" && input instanceof Blob;
  }

  static isArrayBuffer(input: unknown): input is ArrayBuffer {
    return input instanceof ArrayBuffer;
  }

  static isUint8Array(input: unknown): input is Uint8Array {
    return input instanceof Uint8Array;
  }

  static isReadableStream(input: unknown): input is ReadableStream {
    return (
      typeof ReadableStream !== "undefined" && input instanceof ReadableStream
    );
  }

  static isImageType(contentType: string): boolean {
    return contentType.startsWith("image/");
  }

  static isVideoType(contentType: string): boolean {
    return contentType.startsWith("video/");
  }

  static isAudioType(contentType: string): boolean {
    return contentType.startsWith("audio/");
  }

  static async isImage(input: FileInput): Promise<boolean> {
    try {
      const buffer = await FileHandler.toBuffer(input);
      const type = await fileTypeFromBuffer(buffer);
      return type?.mime?.startsWith("image/") ?? false;
    } catch {
      return false;
    }
  }

  static async isVideo(input: FileInput): Promise<boolean> {
    try {
      const buffer = await FileHandler.toBuffer(input);
      const type = await fileTypeFromBuffer(buffer);
      return type?.mime?.startsWith("video/") ?? false;
    } catch {
      return false;
    }
  }

  static async isAudio(input: FileInput): Promise<boolean> {
    try {
      const buffer = await FileHandler.toBuffer(input);
      const type = await fileTypeFromBuffer(buffer);
      return type?.mime?.startsWith("audio/") ?? false;
    } catch {
      return false;
    }
  }

  static async isText(input: FileInput): Promise<boolean> {
    try {
      const buffer = await FileHandler.toBuffer(input);
      return !buffer.includes(0);
    } catch {
      return false;
    }
  }

  static isValidUrl(value: string): boolean {
    try {
      new URL(value, "file://");
      return true;
    } catch {
      return false;
    }
  }

  static isValidFileInput(value: unknown): value is FileInput | FileInput[] {
    if (Array.isArray(value)) {
      return value.every((item) => isValidSingleInput(item));
    }

    return isValidSingleInput(value);
  }

  static async checkFileSize(
    input: FileInput,
    maxSize: number,
  ): Promise<boolean> {
    try {
      if (FileHandler.isFile(input)) {
        return input.size <= maxSize;
      }

      const buffer = await FileHandler.toBuffer(input);
      return buffer.length <= maxSize;
    } catch {
      return false;
    }
  }

  static hasValidExtension(
    filename: string,
    allowedExtensions: string[],
  ): boolean {
    const ext = FileHandler.getExtension(filename);
    return allowedExtensions.includes(ext.toLowerCase());
  }

  static getExtension(filename: string): string {
    const ext = filename.split(".").pop();
    return ext ? `.${ext}` : "";
  }

  static async getMimeType(input: FileInput): Promise<string> {
    try {
      if (FileHandler.isFile(input)) {
        return input.type || lookup(input.name) || "application/octet-stream";
      }

      if (typeof input === "string") {
        if (FileHandler.isDataUri(input)) {
          const matches = input.match(DATA_URI_REGEX);
          return matches?.[1] ?? "application/octet-stream";
        }

        return lookup(input) || "application/octet-stream";
      }

      const buffer = await FileHandler.toBuffer(input);
      const type = await fileTypeFromBuffer(buffer);
      return type?.mime ?? "application/octet-stream";
    } catch {
      return "application/octet-stream";
    }
  }

  static async toBuffer(input: FileInput): Promise<Buffer> {
    if (Buffer.isBuffer(input)) {
      return input;
    }

    if (FileHandler.isFile(input) || FileHandler.isBlob(input)) {
      return Buffer.from(await input.arrayBuffer());
    }

    if (FileHandler.isArrayBuffer(input)) {
      return Buffer.from(input);
    }

    if (FileHandler.isUint8Array(input)) {
      return Buffer.from(input);
    }

    if (FileHandler.isReadable(input)) {
      const chunks: Buffer[] = [];
      for await (const chunk of input) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    }

    if (FileHandler.isReadableStream(input)) {
      const reader = input.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        chunks.push(value);
      }

      return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
    }

    if (typeof input === "string" && FileHandler.isDataUri(input)) {
      const matches = input.match(DATA_URI_REGEX);
      if (!matches?.[2]) {
        throw new FileError("Invalid data URI format");
      }
      return Buffer.from(matches[2], "base64");
    }

    const processor = new FileHandler();
    const processed = await processor.processInput(input);
    return processed.buffer;
  }

  static async toFile(input: FileInput, filename?: string): Promise<File> {
    if (typeof File === "undefined") {
      throw new FileError("File API is not available in this environment");
    }

    if (FileHandler.isFile(input)) {
      return input;
    }

    const buffer = await FileHandler.toBuffer(input);
    let name = filename;
    let type: string;

    if (FileHandler.isUrl(input)) {
      name ??= basename(input.pathname);
      type = lookup(name) || "application/octet-stream";
    } else if (typeof input === "string" && FileHandler.isDataUri(input)) {
      const matches = input.match(DATA_URI_REGEX);
      type = matches?.[1] || "application/octet-stream";
      if (!name) {
        const ext = type.split("/")[1] || "bin";
        name = `file.${ext}`;
      }
    } else {
      name ??= "file";
      type = "application/octet-stream";
    }

    return new File([buffer], name, { type });
  }

  static async toDataUri(input: FileInput): Promise<DataUri> {
    if (typeof input === "string" && FileHandler.isDataUri(input)) {
      return input;
    }

    let contentType: string;
    const buffer = await FileHandler.toBuffer(input);

    if (input instanceof File) {
      contentType = input.type;
    } else if (typeof input === "string") {
      contentType = lookup(input) || "application/octet-stream";
    } else {
      contentType = "application/octet-stream";
    }

    return FileHandler.bufferToDataUri(buffer, contentType);
  }

  static async toUrl(input: FileInput): Promise<URL> {
    if (FileHandler.isUrl(input)) {
      return input;
    }

    if (typeof input === "string") {
      try {
        return new URL(input);
      } catch {
        return new URL(`file://${input}`);
      }
    }

    if (typeof URL.createObjectURL === "undefined") {
      throw new FileError(
        "URL.createObjectURL is not available in this environment",
      );
    }

    const file = await FileHandler.toFile(input);
    return new URL(URL.createObjectURL(file));
  }

  static toPath(input: FileInput): string {
    if (typeof input === "string" && !FileHandler.isDataUri(input)) {
      return input;
    }

    if (FileHandler.isFileUrl(input)) {
      if (input.protocol === "file:") {
        return decodeURIComponent(input.pathname);
      }

      throw new FileError("Only file:// URLs can be converted to paths");
    }

    throw new FileError(
      "Cannot convert this input to a path. Only file paths and file:// URLs are supported",
    );
  }

  static bufferToDataUri(buffer: Buffer, contentType: string): DataUri {
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  }

  static create(options: z.input<typeof FileOptions> = {}): FileHandler {
    return new FileHandler(options);
  }

  async processFile(
    input: FileInput,
    imageOptions?: ImageProcessingOptions,
  ): Promise<ProcessedFile> {
    const mergedImageOptions = {
      ...this.#options.defaultImageOptions,
      ...imageOptions,
    };

    const processedFile = await this.processInput(input);

    if (this.#options.validationOptions) {
      await this.validateFile(processedFile, this.#options.validationOptions);
    }

    if (
      FileHandler.isImageType(processedFile.contentType) &&
      mergedImageOptions
    ) {
      return await this.processImage(
        processedFile,
        mergedImageOptions as ImageProcessingOptions,
      );
    }

    return processedFile;
  }

  async createFormData(
    files: FileInput | FileInput[],
    body?: Dispatcher.RequestOptions["body"],
    imageOptions?: ImageProcessingOptions,
  ): Promise<FormData> {
    const filesArray = Array.isArray(files) ? files : [files];

    if (filesArray.length > this.#options.maxAttachments) {
      throw new FileError(
        `Too many attachments. Maximum allowed: ${this.#options.maxAttachments}`,
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
      if (totalSize > this.#options.maxTotalSize) {
        throw new FileError(
          `Total files size exceeds limit: ${this.#options.maxTotalSize} bytes`,
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
      this.addBodyToForm(form, body);
    }

    return form;
  }

  processInput(input: FileInput): Promise<ProcessedFile> | ProcessedFile {
    try {
      if (FileHandler.isBuffer(input)) {
        return this.processBuffer(input);
      }

      if (FileHandler.isFile(input) || FileHandler.isBlob(input)) {
        return this.processFileObject(input);
      }

      if (FileHandler.isArrayBuffer(input) || FileHandler.isUint8Array(input)) {
        const uint8Array =
          input instanceof ArrayBuffer ? new Uint8Array(input) : input;
        return this.processBuffer(
          Buffer.from(
            uint8Array.buffer,
            uint8Array.byteOffset,
            uint8Array.byteLength,
          ),
        );
      }

      if (FileHandler.isReadable(input)) {
        return this.processStream(input);
      }

      if (FileHandler.isReadableStream(input)) {
        return this.processWebStream(input);
      }

      if (FileHandler.isUrl(input)) {
        return this.processPath(input.pathname);
      }

      if (typeof input === "string") {
        return this.processPath(input);
      }

      throw new FileError("Invalid file input type");
    } catch (error) {
      if (error instanceof FileError) {
        throw error;
      }
      throw new FileError("File processing failed");
    }
  }

  async processImage(
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
    const contentType = options.format
      ? `image/${options.format}`
      : file.contentType;
    const filename = options.format
      ? this.changeExtension(file.filename, options.format)
      : file.filename;

    return {
      buffer,
      filename,
      contentType,
      size: buffer.length,
    };
  }

  async validateFile(
    file: ProcessedFile,
    options: FileValidationOptions,
  ): Promise<void> {
    if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
      throw new FileError(
        `File size exceeds limit: ${options.maxSizeBytes} bytes`,
      );
    }

    const ext = extname(file.filename).toLowerCase();
    if (!options.allowedExtensions?.includes(ext)) {
      throw new FileError(`File extension not allowed: ${ext}`);
    }

    if (!options.allowedTypes?.includes(file.contentType)) {
      throw new FileError(`File type not allowed: ${file.contentType}`);
    }

    if (
      options.validateImage &&
      (await FileHandler.isImage(file.contentType))
    ) {
      await this.validateImageDimensions(file.buffer, options);
    }
  }

  async validateImageDimensions(
    buffer: Buffer,
    options: FileValidationOptions,
  ): Promise<void> {
    const metadata = await sharp(buffer).metadata();
    if (!(metadata.width && metadata.height)) {
      throw new FileError("Unable to get image dimensions");
    }

    const { width, height } = metadata;

    if (options.maxWidth && width > options.maxWidth) {
      throw new FileError(
        `Image width exceeds maximum: ${width}px (max: ${options.maxWidth}px)`,
      );
    }
    if (options.maxHeight && height > options.maxHeight) {
      throw new FileError(
        `Image height exceeds maximum: ${height}px (max: ${options.maxHeight}px)`,
      );
    }
    if (options.minWidth && width < options.minWidth) {
      throw new FileError(
        `Image width below minimum: ${width}px (min: ${options.minWidth}px)`,
      );
    }
    if (options.minHeight && height < options.minHeight) {
      throw new FileError(
        `Image height below minimum: ${height}px (min: ${options.minHeight}px)`,
      );
    }
  }

  processBuffer(buffer: Buffer): ProcessedFile {
    return {
      buffer,
      filename: "file",
      contentType: "application/octet-stream",
      size: buffer.length,
    };
  }

  async processPath(path: string): Promise<ProcessedFile> {
    if (FileHandler.isDataUri(path)) {
      return this.processDataUri(path);
    }

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

  processDataUri(dataUri: string): ProcessedFile {
    const matches = dataUri.match(DATA_URI_REGEX);
    if (!(matches?.[1] && matches[2])) {
      throw new FileError("Invalid data URI format");
    }

    const [, contentType, base64Data] = matches;
    const buffer = Buffer.from(base64Data, "base64");
    const ext = contentType.split("/")[1] || "bin";

    return {
      buffer,
      filename: `file.${ext}`,
      contentType,
      size: buffer.length,
    };
  }

  async processStream(stream: Readable): Promise<ProcessedFile> {
    const buffer = await FileHandler.toBuffer(stream);
    return {
      buffer,
      filename: "stream-file",
      contentType: "application/octet-stream",
      size: buffer.length,
    };
  }

  async processWebStream(stream: ReadableStream): Promise<ProcessedFile> {
    const buffer = await FileHandler.toBuffer(stream);
    return {
      buffer,
      filename: "web-stream-file",
      contentType: "application/octet-stream",
      size: buffer.length,
    };
  }

  async processFileObject(file: File | Blob): Promise<ProcessedFile> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file instanceof File ? file.name : "blob-file";
    const contentType = file.type || "application/octet-stream";

    return {
      buffer,
      filename,
      contentType,
      size: file.size,
    };
  }

  addBodyToForm(form: FormData, body: Dispatcher.RequestOptions["body"]): void {
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

  changeExtension(filename: string, newExt: string): string {
    const basename = filename.replace(FILE_NAME_REPLACE_REGEX, "");
    return `${basename}.${newExt}`;
  }
}
