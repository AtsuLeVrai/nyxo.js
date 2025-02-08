export const CDN_CONSTANTS = {
  BASE_URL: "https://cdn.discordapp.com",
  MEDIA_PROXY_URL: "https://media.discordapp.net",
  FORMATS: {
    DEFAULT: "png" as const,
    SUPPORTED: {
      RASTER: ["png", "jpeg", "webp"] as const,
      ANIMATED: ["gif"] as const,
      VECTOR: ["json"] as const,
    },
  },
  PATTERNS: {
    HASH: /^[a-fA-F0-9_]+$/,
    ANIMATED_HASH: /^a_/,
  },
} as const;

export type CdnConstants = (typeof CDN_CONSTANTS)[keyof typeof CDN_CONSTANTS];
