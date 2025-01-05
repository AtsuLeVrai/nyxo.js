import { PremiumTier } from "@nyxjs/core";

export const FileConstants = {
  limits: {
    [PremiumTier.none]: 10 * 1024 * 1024, // 10MB
    [PremiumTier.tier1]: 25 * 1024 * 1024, // 25MB
    [PremiumTier.tier2]: 50 * 1024 * 1024, // 50MB
    [PremiumTier.tier3]: 100 * 1024 * 1024, // 100MB
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
