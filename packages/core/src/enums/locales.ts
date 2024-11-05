/**
 * Enum representing various locales supported by Discord.
 *
 * @see {@link https://discord.com/developers/docs/reference#locales|Locales}
 */
export enum Locales {
    Bulgarian = "bg",
    ChineseChina = "zh-CN",
    ChineseTaiwan = "zh-TW",
    Croatian = "hr",
    Czech = "cs",
    Danish = "da",
    Dutch = "nl",
    EnglishUk = "en-GB",
    EnglishUs = "en-US",
    Finnish = "fi",
    French = "fr",
    German = "de",
    Greek = "el",
    Hindi = "hi",
    Hungarian = "hu",
    Indonesian = "id",
    Italian = "it",
    Japanese = "ja",
    Korean = "ko",
    Lithuanian = "lt",
    Norwegian = "no",
    Polish = "pl",
    PortugueseBrazilian = "pt-BR",
    Romanian = "ro",
    Russian = "ru",
    Spanish = "es-ES",
    SpanishLatam = "es-419",
    Swedish = "sv-SE",
    Thai = "th",
    Turkish = "tr",
    Ukrainian = "uk",
    Vietnamese = "vi",
}

/**
 * Type representing the keys of the Locales enum.
 */
export type LocaleKeys = `${Locales}`;

/**
 * Represents the available locales as a record with locale keys and their corresponding string values.
 */
export type AvailableLocales = Record<LocaleKeys, string>;
