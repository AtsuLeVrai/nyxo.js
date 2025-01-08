import { PremiumTier } from "@nyxjs/core";
import { FileConstants } from "../constants/index.js";
import type { FileValidationResult } from "../types/index.js";

export class FileValidatorService {
  #maxFileSize: number;

  constructor(boostTier: PremiumTier = PremiumTier.None) {
    this.#maxFileSize = FileConstants.limits[boostTier];
  }

  setBoostTier(tier: PremiumTier): void {
    this.#maxFileSize = FileConstants.limits[tier];
  }

  validateFileCount(count: number): FileValidationResult {
    if (count > FileConstants.maxFiles) {
      return {
        isValid: false,
        error: `Maximum number of files (${FileConstants.maxFiles}) exceeded`,
      };
    }
    return { isValid: true };
  }

  validateTotalSize(totalSize: number): FileValidationResult {
    const maxTotalSize = this.#maxFileSize * FileConstants.maxFiles;
    if (totalSize > maxTotalSize) {
      return {
        isValid: false,
        error: `Total file size ${totalSize} bytes exceeds maximum allowed ${maxTotalSize} bytes`,
      };
    }
    return { isValid: true };
  }

  validateFileSize(size: number): FileValidationResult {
    if (size > this.#maxFileSize) {
      return {
        isValid: false,
        error: `File size ${size} bytes exceeds maximum size ${this.#maxFileSize} bytes`,
      };
    }
    return { isValid: true };
  }

  validateContentType(contentType: string): FileValidationResult {
    if (
      !FileConstants.validMimeTypes.includes(
        contentType as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp"
          | "application/json"
          | "text/plain"
          | "application/pdf",
      )
    ) {
      return {
        isValid: false,
        error: `Invalid content type: ${contentType}`,
      };
    }
    return { isValid: true };
  }
}
