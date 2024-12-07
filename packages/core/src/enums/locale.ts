/**
 * Represents the available locales in Discord.
 * These locales are used for content localization across the Discord platform.
 *
 * @remarks
 * The values are ISO 639-1 language codes, sometimes combined with ISO 3166-1 country codes.
 * For example: 'en-US' represents English (United States).
 *
 * @see {@link https://discord.com/developers/docs/reference#locales}
 */
export enum Locale {
  /** Bahasa Indonesia (Indonesian) */
  Indonesian = "id",

  /** Dansk (Danish) */
  Danish = "da",

  /** Deutsch (German) */
  German = "de",

  /** English, UK */
  EnglishUk = "en-GB",

  /** English, US */
  EnglishUs = "en-US",

  /** Español (Spanish) */
  Spanish = "es-ES",

  /** Español, LATAM (Spanish, Latin America) */
  SpanishLatam = "es-419",

  /** Français (French) */
  French = "fr",

  /** Hrvatski (Croatian) */
  Croatian = "hr",

  /** Italiano (Italian) */
  Italian = "it",

  /** Lietuviškai (Lithuanian) */
  Lithuanian = "lt",

  /** Magyar (Hungarian) */
  Hungarian = "hu",

  /** Nederlands (Dutch) */
  Dutch = "nl",

  /** Norsk (Norwegian) */
  Norwegian = "no",

  /** Polski (Polish) */
  Polish = "pl",

  /** Português do Brasil (Brazilian Portuguese) */
  PortugueseBrazilian = "pt-BR",

  /** Română (Romanian) */
  RomanianRomania = "ro",

  /** Suomi (Finnish) */
  Finnish = "fi",

  /** Svenska (Swedish) */
  Swedish = "sv-SE",

  /** Tiếng Việt (Vietnamese) */
  Vietnamese = "vi",

  /** Türkçe (Turkish) */
  Turkish = "tr",

  /** Čeština (Czech) */
  Czech = "cs",

  /** Ελληνικά (Greek) */
  Greek = "el",

  /** български (Bulgarian) */
  Bulgarian = "bg",

  /** Русский (Russian) */
  Russian = "ru",

  /** Українська (Ukrainian) */
  Ukrainian = "uk",

  /** हद (Hindi) */
  Hindi = "hi",

  /** ไทย (Thai) */
  Thai = "th",

  /** 中文 (Chinese, Simplified) */
  ChineseChina = "zh-CN",

  /** 日本語 (Japanese) */
  Japanese = "ja",

  /** 繁體中文 (Chinese, Traditional) */
  ChineseTaiwan = "zh-TW",

  /** 한국어 (Korean) */
  Korean = "ko",
}

/**
 * Represents a string literal union type of all available locale codes.
 * This type ensures type safety when working with locale strings.
 *
 * @example
 * ```typescript
 * const locale: LocaleKey = "en-US"; // Valid
 * const invalid: LocaleKey = "invalid"; // Type error
 * ```
 */
export type LocaleKey = `${Locale}`;

/**
 * Represents a record mapping locale codes to their localized strings.
 * Used for storing translations or localized content.
 *
 * @example
 * ```typescript
 * const translations: AvailableLocale = {
 *   "en-US": "Hello",
 *   "fr": "Bonjour",
 *   // ... other translations
 * };
 * ```
 */
export type AvailableLocale = Record<LocaleKey, string>;
