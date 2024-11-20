/**
 * @see {@link https://discord.com/developers/docs/reference#locales}
 */
export enum Locale {
  Indonesian = "id",
  Danish = "da",
  German = "de",
  EnglishUk = "en-GB",
  EnglishUs = "en-US",
  Spanish = "es-ES",
  SpanishLatam = "es-419",
  French = "fr",
  Croatian = "hr",
  Italian = "it",
  Lithuanian = "lt",
  Hungarian = "hu",
  Dutch = "nl",
  Norwegian = "no",
  Polish = "pl",
  PortugueseBrazilian = "pt-BR",
  RomanianRomania = "ro",
  Finnish = "fi",
  Swedish = "sv-SE",
  Vietnamese = "vi",
  Turkish = "tr",
  Czech = "cs",
  Greek = "el",
  Bulgarian = "bg",
  Russian = "ru",
  Ukrainian = "uk",
  Hindi = "hi",
  Thai = "th",
  ChineseChina = "zh-CN",
  Japanese = "ja",
  ChineseTaiwan = "zh-TW",
  Korean = "ko",
}

export type LocaleKey = `${Locale}`;

export type AvailableLocale = Record<LocaleKey, string>;
