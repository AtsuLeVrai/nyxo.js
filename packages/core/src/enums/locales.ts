/**
 * Discord Localization System
 *
 * This module provides comprehensive support for Discord's localization system,
 * including all officially supported languages and regional variants.
 *
 * @module Discord Locales
 * @version 1.0.0
 * @see {@link https://discord.com/developers/docs/reference#locales}
 */

/**
 * Discord Supported Locales
 *
 * Represents all officially supported language and region combinations in Discord.
 * Locales follow international standards:
 * - ISO 639-1 for language codes (e.g., 'en', 'fr')
 * - ISO 3166-1 for region codes (e.g., 'US', 'GB')
 *
 * @remarks
 * Locale Categories:
 * 1. Simple Language Codes (e.g., 'fr', 'de')
 *    - Used for languages without regional variants
 *    - Follow ISO 639-1 standard
 *
 * 2. Language-Region Combinations (e.g., 'en-US', 'es-ES')
 *    - Used when regional differences are significant
 *    - Combine language code with country/region code
 *
 * @example
 * ```typescript
 * // Setting user locale preference
 * user.setLocale(Locales.EnglishUs);
 *
 * // Checking if content is available in a specific locale
 * const hasTranslation = content.hasLocale(Locales.Japanese);
 *
 * // Loading locale-specific content
 * const messages = {
 *   [Locales.EnglishUs]: 'Hello',
 *   [Locales.French]: 'Bonjour',
 *   [Locales.Japanese]: 'こんにちは'
 * };
 * ```
 */
export enum Locales {
    /**
     * British English (en-GB)
     *
     * @remarks
     * - Primary locale for UK and Commonwealth regions
     * - Uses British spelling conventions (e.g., "colour", "centralise")
     * - Format: language-REGION using ISO codes
     */
    EnglishUk = "en-GB",

    /**
     * American English (en-US)
     *
     * @remarks
     * - Default locale for English-speaking regions
     * - Uses American spelling conventions (e.g., "color", "centralize")
     * - Recommended for international English content
     *
     * @recommended
     */
    EnglishUs = "en-US",

    /**
     * French (fr)
     *
     * @remarks
     * - Standard French locale
     * - Used in France and other French-speaking regions
     * - Follows French language academy standards
     */
    French = "fr",

    /**
     * German (de)
     *
     * @remarks
     * - Standard German locale
     * - Used in Germany, Austria, and other German-speaking regions
     * - Follows standard German orthography
     */
    German = "de",

    /**
     * Spanish - Spain (es-ES)
     *
     * @remarks
     * - European Spanish variant
     * - Uses Castilian Spanish conventions
     * - Primary locale for Spain
     */
    Spanish = "es-ES",

    /**
     * Spanish - Latin America (es-419)
     *
     * @remarks
     * - Latin American Spanish variant
     * - Uses region code 419 (Latin America and the Caribbean)
     * - Adapted for Latin American terminology and expressions
     */
    SpanishLatam = "es-419",

    /**
     * Simplified Chinese (zh-CN)
     *
     * @remarks
     * - Used in mainland China
     * - Uses simplified Chinese characters
     * - Follows mainland Chinese terminology
     */
    ChineseChina = "zh-CN",

    /**
     * Traditional Chinese (zh-TW)
     *
     * @remarks
     * - Used in Taiwan
     * - Uses traditional Chinese characters
     * - Follows Taiwanese terminology
     */
    ChineseTaiwan = "zh-TW",

    /**
     * Japanese (ja)
     *
     * @remarks
     * - Standard Japanese locale
     * - Uses Japanese writing system (Kanji, Hiragana, Katakana)
     */
    Japanese = "ja",

    /**
     * Korean (ko)
     *
     * @remarks
     * - Standard Korean locale
     * - Uses Hangul writing system
     */
    Korean = "ko",

    /** Bulgarian (bg) - Standard Bulgarian locale */
    Bulgarian = "bg",

    /** Croatian (hr) - Standard Croatian locale */
    Croatian = "hr",

    /** Czech (cs) - Standard Czech locale */
    Czech = "cs",

    /** Danish (da) - Standard Danish locale */
    Danish = "da",

    /** Dutch (nl) - Standard Dutch locale */
    Dutch = "nl",

    /** Finnish (fi) - Standard Finnish locale */
    Finnish = "fi",

    /** Greek (el) - Standard Greek locale */
    Greek = "el",

    /** Hungarian (hu) - Standard Hungarian locale */
    Hungarian = "hu",

    /** Italian (it) - Standard Italian locale */
    Italian = "it",

    /** Lithuanian (lt) - Standard Lithuanian locale */
    Lithuanian = "lt",

    /** Norwegian (no) - Standard Norwegian locale */
    Norwegian = "no",

    /** Polish (pl) - Standard Polish locale */
    Polish = "pl",

    /**
     * Portuguese - Brazil (pt-BR)
     *
     * @remarks
     * - Brazilian Portuguese variant
     * - Different from European Portuguese
     * - Follows Brazilian spelling and terminology
     */
    PortugueseBrazilian = "pt-BR",

    /** Romanian (ro) - Standard Romanian locale */
    Romanian = "ro",

    /** Russian (ru) - Standard Russian locale */
    Russian = "ru",

    /** Swedish (sv-SE) - Standard Swedish locale */
    Swedish = "sv-SE",

    /** Ukrainian (uk) - Standard Ukrainian locale */
    Ukrainian = "uk",

    /** Hindi (hi) - Standard Hindi locale */
    Hindi = "hi",

    /** Indonesian (id) - Standard Indonesian locale */
    Indonesian = "id",

    /** Thai (th) - Standard Thai locale */
    Thai = "th",

    /** Turkish (tr) - Standard Turkish locale */
    Turkish = "tr",

    /** Vietnamese (vi) - Standard Vietnamese locale */
    Vietnamese = "vi",
}

/**
 * String literal union type of all locale codes
 *
 * @remarks
 * Provides type safety when working directly with locale strings
 *
 * @example
 * ```typescript
 * function isValidLocale(locale: LocaleKeys): boolean {
 *   return Object.values(Locales).includes(locale as Locales);
 * }
 * ```
 */
export type LocaleKeys = `${Locales}`;

/**
 * Type for locale-specific content mappings
 *
 * @remarks
 * - Requires all supported locales as keys
 * - Ensures type safety in localization systems
 * - Values must be strings
 *
 * @example
 * ```typescript
 * const translations: AvailableLocales = {
 *   "en-US": "Hello World",
 *   "ja": "こんにちは世界",
 *   // ... other locales required
 * };
 *
 * function getLocalizedMessage(locale: Locales): string {
 *   return translations[locale];
 * }
 * ```
 */
export type AvailableLocales = Record<LocaleKeys, string>;
