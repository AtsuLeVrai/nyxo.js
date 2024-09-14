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
    Aac = "audio/aac",
    Abiword = "application/x-abiword",
    Apng = "image/apng",
    Appleinstaller = "application/vnd.apple.installer+xml",
    Arc = "application/x-freearc",
    Avi = "video/x-msvideo",
    Avif = "image/avif",
    Azw = "application/vnd.amazon.ebook",
    Bin = "application/octet-stream",
    Bmp = "image/bmp",
    Bzip = "application/x-bzip",
    Bzip2 = "application/x-bzip2",
    Cda = "application/x-cdf",
    Csh = "application/x-csh",
    Css = "text/css",
    Csv = "text/csv",
    Doc = "application/msword",
    Docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    Eot = "application/vnd.ms-fontobject",
    Epub = "application/epub+zip",
    Gif = "image/gif",
    Gzip = "application/gzip",
    Html = "text/html",
    Ico = "image/vnd.microsoft.icon",
    Ics = "text/calendar",
    Jar = "application/java-archive",
    Jpeg = "image/jpeg",
    Js = "text/javascript",
    Json = "application/json",
    Jsonld = "application/ld+json",
    Midi = "audio/midi",
    Mp3 = "audio/mpeg",
    Mp4 = "video/mp4",
    Mpeg = "video/mpeg",
    Odp = "application/vnd.oasis.opendocument.presentation",
    Ods = "application/vnd.oasis.opendocument.spreadsheet",
    Odt = "application/vnd.oasis.opendocument.text",
    Ogv = "video/ogg",
    Ogx = "application/ogg",
    Opus = "audio/ogg",
    Otf = "font/otf",
    Pdf = "application/pdf",
    Php = "application/x-httpd-php",
    Png = "image/png",
    Ppt = "application/vnd.ms-powerpoint",
    Pptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    Rar = "application/vnd.rar",
    Rtf = "application/rtf",
    Sevenz = "application/x-7z-compressed",
    Sh = "application/x-sh",
    Svg = "image/svg+xml",
    Tar = "application/x-tar",
    Threeg2 = "video/3gpp2",
    Threegp = "video/3gpp",
    Tiff = "image/tiff",
    Ts = "video/mp2t",
    Ttf = "font/ttf",
    Txt = "text/plain",
    Vsd = "application/vnd.visio",
    Wav = "audio/wav",
    Weba = "audio/webm",
    Webm = "video/webm",
    Webp = "image/webp",
    Woff = "font/woff",
    Woff2 = "font/woff2",
    Xhtml = "application/xhtml+xml",
    Xls = "application/vnd.ms-excel",
    Xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    Xml = "application/xml",
    Xul = "application/vnd.mozilla.xul+xml",
    Zip = "application/zip",
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
