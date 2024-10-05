/**
 * @see {@link https://discord.com/developers/docs/reference#signed-attachment-cdn-urls-attachment-cdn-url-parameters}
 */
export type AttachmentCdnUrlParameters = {
    /**
     * Hex timestamp indicating when an attachment CDN URL will expire
     */
    ex: string;
    /**
     * Unique signature that remains valid until the URL's expiration
     */
    hm: string;
    /**
     * Hex timestamp indicating when the URL was issued
     */
    is: string;
};
