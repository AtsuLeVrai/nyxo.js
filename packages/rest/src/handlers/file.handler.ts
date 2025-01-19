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

  static async checkFileSize(
    input: FileInput,
    maxSize: number,
  ): Promise<boolean> {
    try {
      if (input instanceof File) {
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

  static async getMimeType(input: FileInput): Promise<string | undefined> {
    try {
      if (input instanceof File) {
        return input.type || lookup(input.name) || undefined;
      }

      if (typeof input === "string") {
        if (FileHandler.isDataUri(input)) {
          const matches = input.match(DATA_URI_REGEX);
          return matches?.[1];
        }
        return lookup(input) || undefined;
      }

      const buffer = await FileHandler.toBuffer(input);
      const type = await fileTypeFromBuffer(buffer);
      return type?.mime;
    } catch {
      return undefined;
    }
  }

  static async toBuffer(input: FileInput): Promise<Buffer> {
    if (Buffer.isBuffer(input)) {
      return input;
    }

    if (input instanceof File) {
      return Buffer.from(await input.arrayBuffer());
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

    if (input instanceof File) {
      return input;
    }

    const buffer = await FileHandler.toBuffer(input);
    let name = filename;
    let type: string;

    if (input instanceof URL) {
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
    if (input instanceof URL) {
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

    if (input instanceof URL) {
      if (input.protocol === "file:") {
        return decodeURIComponent(input.pathname);
      }

      throw new FileError("Only file:// URLs can be converted to paths");
    }

    throw new FileError(
      "Cannot convert this input to a path. Only file paths and file:// URLs are supported",
    );
  }

  static isValidFileInput(value: unknown): value is FileInput {
    if (Buffer.isBuffer(value)) {
      return true;
    }

    if (typeof File !== "undefined" && value instanceof File) {
      return true;
    }

    if (value instanceof URL) {
      return true;
    }

    if (typeof value === "string") {
      if (FileHandler.isDataUri(value)) {
        return true;
      }
      try {
        new URL(value, "file://");
        return true;
      } catch {
        return FILE_URI_REGEX.test(value);
      }
    }

    return false;
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

    if (this.isImage(processedFile.contentType) && mergedImageOptions) {
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

  async toDataUri(input: FileInput): Promise<string> {
    if (typeof input === "string" && FileHandler.isDataUri(input)) {
      return input;
    }

    const file = await this.processFile(input);
    return FileHandler.bufferToDataUri(file.buffer, file.contentType);
  }

  processInput(input: FileInput): Promise<ProcessedFile> | ProcessedFile {
    try {
      if (Buffer.isBuffer(input)) {
        return this.processBuffer(input);
      }
      if (input instanceof File) {
        return this.processFileObject(input);
      }
      if (input instanceof URL) {
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

    if (options.validateImage && this.isImage(file.contentType)) {
      await this.validateImageDimensions(file.buffer, options);
    }
  }

  isImage(contentType: string): boolean {
    return contentType.startsWith("image/");
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

  async processFileObject(file: File): Promise<ProcessedFile> {
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
      buffer,
      filename: file.name,
      contentType: file.type || lookup(file.name) || "application/octet-stream",
      size: file.size,
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
