export type ImageFormat = "jpg" | "png" | "webp" | "gif" | "json";
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export interface ImageProcessingOptions {
  format?: "jpeg" | "png" | "webp" | "gif";
  size?: ImageSize;
  asDataUri?: boolean;
}

export interface AnimatedImageOptionsEntity extends ImageProcessingOptions {
  animated?: boolean;
}

export interface StickerFormatOptionsEntity {
  format: Extract<ImageFormat, "png" | "gif" | "json">;
  useMediaUrl?: boolean;
}
