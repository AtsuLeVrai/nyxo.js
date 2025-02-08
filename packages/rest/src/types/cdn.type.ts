/**
 * Valid image sizes for CDN assets (in pixels)
 */
export type ImageSize = 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096;

/**
 * Base options for image requests
 */
export interface BaseImageOptions {
  /** Desired image size */
  size?: ImageSize;
}

/**
 * Options for static image requests
 */
export interface ImageOptions extends BaseImageOptions {
  /** Image format */
  format?: "png" | "jpeg" | "webp";
}

/**
 * Options for potentially animated image requests
 */
export interface AnimatedImageOptions extends BaseImageOptions {
  /** Image format, including GIF support */
  format?: "png" | "jpeg" | "webp" | "gif";
  /** Whether to preserve animation */
  animated?: boolean;
}

/**
 * Options for sticker requests
 */
export interface StickerFormatOptions extends BaseImageOptions {
  /** Sticker format */
  format?: "png" | "gif" | "json";
  /** Whether to use Discord's media proxy */
  useMediaProxy?: boolean;
}
