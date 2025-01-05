export const ImageFormat = {
  jpeg: "jpg",
  jpg: "jpg",
  png: "png",
  webp: "webp",
  gif: "gif",
  lottie: "json",
} as const;

export type ImageFormat = (typeof ImageFormat)[keyof typeof ImageFormat];

export const ImageSize = {
  size16: 16,
  size32: 32,
  size64: 64,
  size128: 128,
  size256: 256,
  size512: 512,
  size1024: 1024,
  size2048: 2048,
  size4096: 4096,
} as const;

export type ImageSize = (typeof ImageSize)[keyof typeof ImageSize];
