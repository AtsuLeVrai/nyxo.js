/**
 * @see {@link https://discord.com/developers/docs/reference#authentication}
 */
export type AuthTypes = "Bearer" | "Bot";

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

export type RateLimitScopeTypes = "global" | "shared" | "user";

export type DiscordHeaders = {
    Authorization?: `${AuthTypes} ${string}`;
    "Content-Type"?: ContentTypes;
    "User-Agent"?: string;
    "X-Audit-Log-Reason"?: string;
    "X-RateLimit-Bucket"?: string;
    "X-RateLimit-Global"?: string;
    "X-RateLimit-Limit"?: string;
    "X-RateLimit-Remaining"?: string;
    "X-RateLimit-Reset"?: string;
    "X-RateLimit-Reset-After"?: string;
    "X-RateLimit-Scope"?: RateLimitScopeTypes;
    "X-Signature-Ed25519"?: string;
    "X-Signature-Timestamp"?: string;
};
