import type { Snowflake } from "@nyxjs/core";
import type { ImageFormat, ImageSize } from "../constants/index.js";

export interface BaseImageOptionsEntity {
  format?: ImageFormat;
  size?: ImageSize;
}

export interface AnimatedImageOptionsEntity extends BaseImageOptionsEntity {
  animated?: boolean;
}

export interface SignedAttachmentParametersEntity {
  ex: string;
  is: string;
  hm: string;
}

export interface AttachmentOptionsEntity extends BaseImageOptionsEntity {
  signedParameters?: SignedAttachmentParametersEntity;
  signed?: {
    signingKey: string;
  };
}

export interface StickerFormatOptionsEntity {
  format: Extract<ImageFormat, "png" | "gif" | "json">;
  useMediaUrl?: boolean;
}

export interface CdnEntity {
  attachment: (
    channelId: Snowflake | number,
    attachmentId: Snowflake | number,
    filename: string,
    options?: AttachmentOptionsEntity,
  ) => string;
  userAvatar: (
    userId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ) => string;
  userBanner: (
    userId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ) => string;
  defaultUserAvatar: (discriminator: number | string) => string;
  avatarDecoration: (assetId: Snowflake | number) => string;
  guildIcon: (
    guildId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ) => string;
  guildSplash: (
    guildId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  guildDiscoverySplash: (
    guildId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  guildMemberAvatar: (
    guildId: Snowflake | number,
    userId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ) => string;
  guildMemberBanner: (
    guildId: Snowflake | number,
    userId: Snowflake | number,
    hash: string,
    options?: AnimatedImageOptionsEntity,
  ) => string;
  guildScheduledEventCover: (
    eventId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  applicationIcon: (
    applicationId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  applicationCover: (
    applicationId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  applicationAsset: (
    applicationId: Snowflake | number,
    assetId: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  emoji: (
    emojiId: Snowflake | number,
    options?: AnimatedImageOptionsEntity,
  ) => string;
  sticker: (
    stickerId: Snowflake | number,
    options?: StickerFormatOptionsEntity,
  ) => string;
  roleIcon: (
    roleId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  teamIcon: (
    teamId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  achievementIcon: (
    applicationId: Snowflake | number,
    achievementId: Snowflake | number,
    hash: string,
    options?: BaseImageOptionsEntity,
  ) => string;
  storePageAsset: (
    applicationId: Snowflake | number,
    assetId: Snowflake,
    options?: BaseImageOptionsEntity,
  ) => string;
  stickerPackBanner: (
    bannerAssetId: Snowflake | number,
    options?: BaseImageOptionsEntity,
  ) => string;
  getDefaultAvatarIndex: (discriminator: number | string) => number;
  getNewSystemAvatarIndex: (userId: Snowflake) => number;
  getNearestValidSize: (size: number) => ImageSize;
  signUrl: (url: string, signingKey: string) => string;
  createSignedParameters: (
    path: string,
    signingKey: string,
    expiryTimestamp: number,
    issuedTimestamp: number,
  ) => SignedAttachmentParametersEntity;
  verifySignedUrl: (url: string, signingKey: string) => boolean;
  refreshSignedUrl: (url: string, signingKey: string) => string;
}
