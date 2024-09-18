/**
 * Enum representing the different API versions supported by Discord.
 * @see {@link https://discord.com/developers/docs/reference#api-versioning-api-versions|API Versions}
 */
export enum ApiVersions {
    /**
     * Version 3 of the API.
     * @deprecated ApiVersions.V3 is deprecated. Use `ApiVersions.V10` instead.
     */
    V3 = 3,
    /**
     * Version 4 of the API.
     * @deprecated ApiVersions.V4 is deprecated. Use `ApiVersions.V10` instead.
     */
    V4 = 4,
    /**
     * Version 5 of the API.
     * @deprecated ApiVersions.V5 is deprecated. Use `ApiVersions.V10` instead.
     */
    V5 = 5,
    /**
     * Version 6 of the API.
     * @deprecated ApiVersions.V6 is deprecated. Use `ApiVersions.V10` instead.
     */
    V6 = 6,
    /**
     * Version 7 of the API.
     * @deprecated ApiVersions.V7 is deprecated. Use `ApiVersions.V10` instead.
     */
    V7 = 7,
    /**
     * Version 8 of the API.
     * @deprecated ApiVersions.V8 is deprecated. Use `ApiVersions.V10` instead.
     */
    V8 = 8,
    /**
     * Version 9 of the API.
     */
    V9 = 9,
    /**
     * Version 10 of the API.
     */
    V10 = 10,
}
