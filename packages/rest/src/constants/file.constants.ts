export const FILE_CONSTANTS = {
  PATTERNS: {
    DATA_URI: /^data:(.+);base64,(.+)$/,
    FILE_PATH: /^[/.]|^[a-zA-Z]:\\/,
  },
  LIMITS: {
    MAX_ASSET_SIZE: 256 * 1024, // 256KB
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES: 10,
  },
  IMAGE: {
    COMPRESSION_QUALITIES: [80, 60, 40] as const,
    SUPPORTED_TYPES: new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
    ]),
  },
  DEFAULTS: {
    FILENAME: "file" as const,
    CONTENT_TYPE: "application/octet-stream" as const,
  },
  CONTEXTS: {
    ATTACHMENT: "attachment" as const,
    ASSET: "asset" as const,
  },
} as const;

export type FileConstants =
  (typeof FILE_CONSTANTS)[keyof typeof FILE_CONSTANTS];
