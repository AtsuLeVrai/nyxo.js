export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

export interface BaseImageOptions {
  /**  image size */
  size?: ImageSize;
}

export interface ImageOptions extends BaseImageOptions {
  format?: "png" | "jpeg" | "webp";
}

export interface AnimatedImageOptions extends BaseImageOptions {
  format?: "png" | "jpeg" | "webp" | "gif";
  animated?: boolean;
}

export interface StickerFormatOptions extends BaseImageOptions {
  format?: "png" | "gif" | "json";
  useMediaProxy?: boolean;
}
