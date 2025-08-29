/**
 * @description Supported locales for Discord application internationalization.
 * @see {@link https://discord.com/developers/docs/reference#locales}
 */
export enum Locale {
  /** Indonesian */
  Indonesian = "id",
  /** Danish */
  Danish = "da",
  /** German */
  German = "de",
  /** English, UK */
  EnglishUk = "en-GB",
  /** English, US */
  EnglishUs = "en-US",
  /** Spanish */
  Spanish = "es-ES",
  /** Spanish, LATAM */
  SpanishLatam = "es-419",
  /** French */
  French = "fr",
  /** Croatian */
  Croatian = "hr",
  /** Italian */
  Italian = "it",
  /** Lithuanian */
  Lithuanian = "lt",
  /** Hungarian */
  Hungarian = "hu",
  /** Dutch */
  Dutch = "nl",
  /** Norwegian */
  Norwegian = "no",
  /** Polish */
  Polish = "pl",
  /** Portuguese, Brazilian */
  PortugueseBrazilian = "pt-BR",
  /** Romanian, Romania */
  RomanianRomania = "ro",
  /** Finnish */
  Finnish = "fi",
  /** Swedish */
  Swedish = "sv-SE",
  /** Vietnamese */
  Vietnamese = "vi",
  /** Turkish */
  Turkish = "tr",
  /** Czech */
  Czech = "cs",
  /** Greek */
  Greek = "el",
  /** Bulgarian */
  Bulgarian = "bg",
  /** Russian */
  Russian = "ru",
  /** Ukrainian */
  Ukrainian = "uk",
  /** Hindi */
  Hindi = "hi",
  /** Thai */
  Thai = "th",
  /** Chinese, China */
  ChineseChina = "zh-CN",
  /** Japanese */
  Japanese = "ja",
  /** Chinese, Taiwan */
  ChineseTaiwan = "zh-TW",
  /** Korean */
  Korean = "ko",
}

/**
 * @description Union type of all supported Discord locale values.
 */
export type LocaleValues = (typeof Locale)[keyof typeof Locale];
