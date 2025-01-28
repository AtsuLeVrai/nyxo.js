export type ImageFormat = "jpg" | "png" | "webp" | "gif" | "json";
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export interface BaseImageOptions {
  format?: Extract<ImageFormat, "jpeg" | "png" | "webp" | "gif">;
  size?: ImageSize;
}

export interface ImageProcessingOptions extends BaseImageOptions {
  asDataUri?: boolean;
}

export interface AnimatedImageOptionsEntity extends ImageProcessingOptions {
  animated?: boolean;
}

export interface StickerFormatOptionsEntity
  extends Omit<ImageProcessingOptions, "format"> {
  format: Extract<ImageFormat, "png" | "gif" | "json">;
  useMediaUrl?: boolean;
}
