import type { MimeTypes } from "../enums/mimes";

/**
 * Represents a unique identifier used by Discord.
 * @typedef {string} Snowflake
 */
export type Snowflake = string;

/**
 * Represents an integer number.
 * @typedef {number} Integer
 */
export type Integer = number;

/**
 * Represents a floating-point number.
 * @typedef {number} Float
 */
export type Float = number;

/**
 * Represents a timestamp in ISO 8601 format.
 * @typedef {string} Iso8601Timestamp
 */
export type Iso8601Timestamp = string;

/**
 * Represents the types of authentication used by Discord.
 * @typedef {"Bearer" | "Bot"} AuthTypes
 */
export type AuthTypes = "Bearer" | "Bot";

/**
 * Represents the headers used in Discord API requests.
 * @typedef {Object} DiscordHeaders
 */
export type DiscordHeaders = {
    Authorization?: `${AuthTypes} ${string}`;
    "User-Agent"?: string;
    "Content-Type"?: MimeTypes;
    "X-Audit-Log-Reason"?: string;
    "X-Signature-Ed25519"?: string;
    "X-Signature-Timestamp"?: string;
    "X-RateLimit-Limit"?: string;
    "X-RateLimit-Remaining"?: string;
    "X-RateLimit-Reset"?: string;
    "X-RateLimit-Reset-After"?: string;
    "X-RateLimit-Bucket"?: string;
    "X-RateLimit-Global"?: string;
    "X-RateLimit-Scope"?: "user" | "global" | "shared";
};
