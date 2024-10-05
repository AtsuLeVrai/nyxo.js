import type { ImageFormats, Integer } from "@nyxjs/core";

/**
 * Represents the possible image formats that can be used.
 */
export type ImageType =
    | ImageFormats.GIF
    | ImageFormats.JPEG
    | ImageFormats.Lottie
    | ImageFormats.PNG
    | ImageFormats.WebP;

/**
 * Options for configuring the CDN image.
 */
export type CdnImageOptions = {
    /**
     * The format of the image.
     */
    format?: ImageType;
    /**
     * The hostname for the CDN.
     */
    hostname?: string;
    /**
     * The size of the image.
     */
    size?: Integer;
};
