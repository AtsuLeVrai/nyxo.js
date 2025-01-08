import { PremiumTier } from "@nyxjs/core";

export const FileConstants = {
  limits: {
    [PremiumTier.None]: 10 * 1024 * 1024, // 10MB
    [PremiumTier.Tier1]: 25 * 1024 * 1024, // 25MB
    [PremiumTier.Tier2]: 50 * 1024 * 1024, // 50MB
    [PremiumTier.Tier3]: 100 * 1024 * 1024, // 100MB
  },
  maxFiles: 10,
  defaultContentTypes: "application/octet-stream",
  validMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/json",
    "text/plain",
    "application/pdf",
  ],
} as const;
