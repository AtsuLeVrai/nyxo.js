/**
 * Represents the types of authentication used in Discord API
 *
 * @see {@link https://discord.com/developers/docs/reference#authentication}
 */
export type AuthTypes = "Bearer" | "Bot";

/**
 * Enum representing different content types used in Discord API
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types}
 */
export enum ContentTypes {
    ApiJson = "application/vnd.api+json",
    Avif = "image/avif",
    Css = "text/css",
    Csv = "text/csv",
    DocxDocument = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    Excel = "application/vnd.ms-excel",
    Exe = "application/vnd.microsoft.portable-executable",
    FormData = "multipart/form-data",
    FormUrlEncoded = "application/x-www-form-urlencoded",
    Html = "text/html",
    JavaScript = "text/javascript",
    Jpeg = "image/jpeg",
    Json = "application/json",
    LdJson = "application/ld+json",
    Mp3 = "audio/mpeg",
    Obj = "model/obj",
    Ogg = "audio/ogg",
    OpenDocText = "application/vnd.oasis.opendocument.text",
    Pdf = "application/pdf",
    Png = "image/png",
    PowerPoint = "application/vnd.ms-powerpoint",
    PptxPresentation = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    Sql = "application/sql",
    Stream = "application/octet-stream",
    Svg = "image/svg+xml",
    Text = "text/plain",
    Tiff = "image/tiff",
    Word = "application/msword",
    XlsxSheet = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    Xml = "application/xml",
    XmlText = "text/xml",
    Zip = "application/zip",
    Zstd = "application/zstd",
}

/**
 * Represents the types of rate limit scopes in Discord API
 */
export type RateLimitScopeTypes = "global" | "shared" | "user";

/**
 * Represents the headers used in Discord API requests and responses
 */
export type DiscordHeaders = {
    /**
     * The authorization header
     */
    Authorization?: `${AuthTypes} ${string}`;
    /**
     * The content type of the request or response
     */
    "Content-Type"?: ContentTypes;
    /**
     * The user agent string
     */
    "User-Agent"?: string;
    /**
     * The reason for the audit log entry
     */
    "X-Audit-Log-Reason"?: string;
    /**
     * The rate limit bucket
     */
    "X-RateLimit-Bucket"?: string;
    /**
     * Indicates if the rate limit is global
     */
    "X-RateLimit-Global"?: string;
    /**
     * The rate limit for the current endpoint
     */
    "X-RateLimit-Limit"?: string;
    /**
     * The number of requests that can be made
     */
    "X-RateLimit-Remaining"?: string;
    /**
     * The timestamp when the rate limit resets
     */
    "X-RateLimit-Reset"?: string;
    /**
     * The number of seconds until the rate limit resets
     */
    "X-RateLimit-Reset-After"?: string;
    /**
     * The scope of the rate limit
     */
    "X-RateLimit-Scope"?: RateLimitScopeTypes;
    /**
     * The signature for webhook requests
     */
    "X-Signature-Ed25519"?: string;
    /**
     * The timestamp of the webhook request
     */
    "X-Signature-Timestamp"?: string;
};
