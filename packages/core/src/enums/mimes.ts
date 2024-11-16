/**
 * MIME Types Management System
 *
 * This module provides a comprehensive collection of MIME (Multipurpose Internet Mail Extensions) types
 * used for content type identification in web applications, file handling, and HTTP communications.
 *
 * @module MIME Types
 * @version 1.0.0
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types}
 */

/**
 * Complete collection of MIME types
 *
 * Groups MIME types by their primary categories:
 * - Application: Generic binary or application-specific data
 * - Audio: Sound and music files
 * - Image: Visual content and graphics
 * - Text: Human-readable content
 * - Video: Motion picture content
 * - Font: Typography and text display
 *
 * @remarks
 * MIME Type Structure:
 * - Format: type/subtype
 * - Type: Main category (e.g., application, audio)
 * - Subtype: Specific format (e.g., json, mp3)
 *
 * Common Use Cases:
 * - HTTP Content-Type headers
 * - File type validation
 * - API response formatting
 * - Upload handling
 *
 * @example
 * ```typescript
 * // Setting HTTP headers
 * response.setHeader('Content-Type', MimeTypes.Json);
 *
 * // File type validation
 * const isImage = (mimeType: string) =>
 *   [MimeTypes.Jpeg, MimeTypes.Png, MimeTypes.Gif].includes(mimeType);
 *
 * // API response formatting
 * const sendJson = (data: unknown) => ({
 *   contentType: MimeTypes.Json,
 *   body: JSON.stringify(data)
 * });
 * ```
 */
export enum MimeTypes {
    /**
     * Advanced Audio Coding format.
     *
     * @remarks Used for audio files with AAC encoding
     */
    Aac = "audio/aac",

    /**
     * AbiWord document format.
     *
     * @remarks Proprietary word processing format
     */
    Abw = "application/x-abiword",

    /**
     * Audio Video Interleave format.
     *
     * @remarks Microsoft's multimedia container format
     */
    Avi = "video/x-msvideo",

    /**
     * Amazon Kindle eBook format.
     *
     * @remarks Proprietary eBook format used by Amazon Kindle devices
     */
    Azw = "application/vnd.amazon.ebook",

    /**
     * Binary data.
     *
     * @remarks Generic binary data or files where the content type is unknown
     */
    Bin = "application/octet-stream",

    /**
     * Bitmap image format.
     *
     * @remarks Uncompressed raster image format
     */
    Bmp = "image/bmp",

    /**
     * Bzip compression format.
     *
     * @remarks Single-file compression format
     */
    Bz = "application/x-bzip",

    /**
     * Bzip2 compression format.
     *
     * @remarks Improved version of bzip compression
     */
    Bz2 = "application/x-bzip2",

    /**
     * C-Shell script.
     *
     * @remarks Unix shell script format
     */
    Csh = "application/x-csh",

    /**
     * Cascading Style Sheets.
     *
     * @remarks Style sheet language for describing document presentation
     */
    Css = "text/css",

    /**
     * Comma-separated values.
     *
     * @remarks Plain text format for storing tabular data
     */
    Csv = "text/csv",

    /**
     * Microsoft Word document.
     *
     * @remarks Legacy Microsoft Word format
     */
    Doc = "application/msword",

    /**
     * Microsoft Word Open XML document.
     *
     * @remarks Modern Microsoft Word format (Office 2007+)
     */
    Docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    /**
     * Embedded OpenType font.
     *
     * @remarks Compressed font format for web use
     */
    Eot = "application/vnd.ms-fontobject",

    /**
     * Electronic publication format.
     *
     * @remarks Standard eBook format
     */
    Epub = "application/epub+zip",

    /**
     * Graphics Interchange Format.
     *
     * @remarks Commonly used for animations and simple images
     */
    Gif = "image/gif",

    /**
     * HyperText Markup Language.
     *
     * @remarks Standard markup language for web pages
     */
    Html = "text/html",

    /**
     * Icon format.
     *
     * @remarks Used for website favicons and small system icons
     */
    Ico = "image/x-icon",

    /**
     * iCalendar format.
     *
     * @remarks Calendar and scheduling format
     */
    Ics = "text/calendar",

    /**
     * Java Archive.
     *
     * @remarks Package file format for Java applications
     */
    Jar = "application/java-archive",

    /**
     * JPEG image format.
     *
     * @remarks Compressed image format for photographs
     */
    Jpeg = "image/jpeg",

    /**
     * JavaScript.
     *
     * @remarks Script format for web browsers
     */
    Js = "application/javascript",

    /**
     * JSON (JavaScript Object Notation).
     *
     * @remarks Lightweight data interchange format
     */
    Json = "application/json",

    /**
     * MIDI audio.
     *
     * @remarks Musical instrument digital interface format
     */
    Midi = "audio/midi",

    /**
     * MPEG video.
     *
     * @remarks Standard digital video format
     */
    Mpeg = "video/mpeg",

    /**
     * Apple Installer Package.
     *
     * @remarks macOS installation package format
     */
    Mpkg = "application/vnd.apple.installer+xml",

    /**
     * OpenDocument presentation.
     *
     * @remarks Open format for presentations
     */
    Odp = "application/vnd.oasis.opendocument.presentation",

    /**
     * OpenDocument spreadsheet.
     *
     * @remarks Open format for spreadsheets
     */
    Ods = "application/vnd.oasis.opendocument.spreadsheet",

    /**
     * OpenDocument text document.
     *
     * @remarks Open format for text documents
     */
    Odt = "application/vnd.oasis.opendocument.text",

    /**
     * Ogg audio.
     *
     * @remarks Free and open audio container format
     */
    Oga = "audio/ogg",

    /**
     * Ogg video.
     *
     * @remarks Free and open video container format
     */
    Ogv = "video/ogg",

    /**
     * Ogg multimedia.
     *
     * @remarks Generic Ogg container format
     */
    Ogx = "application/ogg",

    /**
     * OpenType font.
     *
     * @remarks Modern font format for digital typography
     */
    Otf = "font/otf",

    /**
     * Portable Document Format.
     *
     * @remarks Fixed-layout document format
     */
    Pdf = "application/pdf",

    /**
     * Portable Network Graphics.
     *
     * @remarks Lossless image compression format
     */
    Png = "image/png",

    /**
     * PowerPoint presentation.
     *
     * @remarks Legacy Microsoft PowerPoint format
     */
    Ppt = "application/vnd.ms-powerpoint",

    /**
     * PowerPoint Open XML presentation.
     *
     * @remarks Modern Microsoft PowerPoint format (Office 2007+)
     */
    Pptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    /**
     * RAR archive.
     *
     * @remarks Proprietary archive format
     */
    Rar = "application/x-rar-compressed",

    /**
     * Rich Text Format.
     *
     * @remarks Formatted text document format
     */
    Rtf = "application/rtf",

    /**
     * Shell script.
     *
     * @remarks Unix/Linux shell script
     */
    Sh = "application/x-sh",

    /**
     * Scalable Vector Graphics.
     *
     * @remarks XML-based vector image format
     */
    Svg = "image/svg+xml",

    /**
     * Adobe Flash.
     *
     * @remarks Legacy multimedia platform format
     * @deprecated Adobe Flash is no longer supported by modern browsers
     */
    Swf = "application/x-shockwave-flash",

    /**
     * Tape Archive.
     *
     * @remarks Unix file archiving format
     */
    Tar = "application/x-tar",

    /**
     * Tagged Image File Format.
     *
     * @remarks High-quality image format often used in professional photography
     */
    Tiff = "image/tiff",

    /**
     * TypeScript.
     *
     * @remarks Microsoft's typed superset of JavaScript
     */
    Ts = "application/typescript",

    /**
     * TrueType Font.
     *
     * @remarks Common digital font format
     */
    Ttf = "font/ttf",

    /**
     * Microsoft Visio.
     *
     * @remarks Microsoft's diagramming and vector graphics format
     */
    Vsd = "application/vnd.visio",

    /**
     * Waveform Audio Format.
     *
     * @remarks Uncompressed audio format
     */
    Wav = "audio/x-wav",

    /**
     * WebM audio.
     *
     * @remarks Open web audio format
     */
    Weba = "audio/webm",

    /**
     * WebM video.
     *
     * @remarks Open web video format
     */
    Webm = "video/webm",

    /**
     * WebP image.
     *
     * @remarks Modern image format for the web with both lossy and lossless compression
     */
    Webp = "image/webp",

    /**
     * Web Open Font Format.
     *
     * @remarks Compressed font format for web use
     */
    Woff = "font/woff",

    /**
     * Web Open Font Format 2.
     *
     * @remarks Improved version of WOFF with better compression
     */
    Woff2 = "font/woff2",

    /**
     * XHTML.
     *
     * @remarks XML-based version of HTML
     */
    Xhtml = "application/xhtml+xml",

    /**
     * Microsoft Excel spreadsheet.
     *
     * @remarks Legacy Microsoft Excel format
     */
    Xls = "application/vnd.ms-excel",

    /**
     * Excel Open XML spreadsheet.
     *
     * @remarks Modern Microsoft Excel format (Office 2007+)
     */
    Xlsx = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    /**
     * XML.
     *
     * @remarks Extensible Markup Language format
     */
    Xml = "application/xml",

    /**
     * XUL.
     *
     * @remarks XML User Interface Language format
     */
    Xul = "application/vnd.mozilla.xul+xml",

    /**
     * ZIP archive.
     *
     * @remarks Common compression and archive format
     */
    Zip = "application/zip",

    /**
     * 3GPP2 multimedia.
     *
     * @remarks Multimedia container format for 3G mobile phones
     */
    "3g2" = "video/3gpp2",

    /**
     * 3GPP multimedia.
     *
     * @remarks Multimedia container format for 3G mobile phones
     */
    "3gp" = "video/3gpp",

    /**
     * 7-Zip archive.
     *
     * @remarks Open source compression format
     */
    "7z" = "application/x-7z-compressed",
}
