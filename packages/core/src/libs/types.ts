import type { MimeTypes } from "../enums/mimes";

/**
 * Represents a unique identifier used by Discord.
 */
export type Snowflake = string;

/**
 * Represents an integer number.
 */
export type Integer = number;

/**
 * Represents a floating-point number.
 */
export type Float = number;

/**
 * Represents a timestamp in ISO 8601 format.
 */
export type Iso8601Timestamp = string;

/**
 * Represents the types of authentication used by Discord.
 */
export type AuthTypes = "Bearer" | "Bot";

/**
 * Represents the headers used in Discord API requests.
 */
export type DiscordHeaders = {
    Authorization?: `${AuthTypes} ${string}`;
    "Content-Type"?: MimeTypes;
    "User-Agent"?: string;
    "X-Audit-Log-Reason"?: string;
    "X-RateLimit-Bucket"?: string;
    "X-RateLimit-Global"?: string;
    "X-RateLimit-Limit"?: string;
    "X-RateLimit-Remaining"?: string;
    "X-RateLimit-Reset"?: string;
    "X-RateLimit-Reset-After"?: string;
    "X-RateLimit-Scope"?: "global" | "shared" | "user";
    "X-Signature-Ed25519"?: string;
    "X-Signature-Timestamp"?: string;
};
