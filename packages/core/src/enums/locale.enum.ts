/**
 * Represents supported locales in the Discord API for internationalization.
 *
 * Discord provides support for various languages and regional variants.
 * This enum contains the language codes that can be used when interacting with
 * the Discord API for localization purposes.
 *
 * Each enum value corresponds to an ISO language code or a combination of
 * language and region codes (e.g., "en-US" for American English).
 *
 * @see {@link https://discord.com/developers/docs/reference#locales}
 */
export enum Locale {
  /**
   * Indonesian language
   * ISO code: id
   */
  Indonesian = "id",

  /**
   * Danish language
   * ISO code: da
   */
  Danish = "da",

  /**
   * German language
   * ISO code: de
   */
  German = "de",

  /**
   * British English
   * ISO code: en-GB
   */
  EnglishUk = "en-GB",

  /**
   * American English
   * ISO code: en-US
   */
  EnglishUs = "en-US",

  /**
   * Spanish (Spain)
   * ISO code: es-ES
   */
  Spanish = "es-ES",

  /**
   * Spanish (Latin America)
   * ISO code: es-419
   */
  SpanishLatam = "es-419",

  /**
   * French language
   * ISO code: fr
   */
  French = "fr",

  /**
   * Croatian language
   * ISO code: hr
   */
  Croatian = "hr",

  /**
   * Italian language
   * ISO code: it
   */
  Italian = "it",

  /**
   * Lithuanian language
   * ISO code: lt
   */
  Lithuanian = "lt",

  /**
   * Hungarian language
   * ISO code: hu
   */
  Hungarian = "hu",

  /**
   * Dutch language
   * ISO code: nl
   */
  Dutch = "nl",

  /**
   * Norwegian language
   * ISO code: no
   * @note There appears to be a typo in the enum key name (Norwegian), but the ISO code is correct
   */
  Norwegian = "no",

  /**
   * Polish language
   * ISO code: pl
   */
  Polish = "pl",

  /**
   * Brazilian Portuguese
   * ISO code: pt-BR
   */
  PortugueseBrazilian = "pt-BR",

  /**
   * Romanian (Romania)
   * ISO code: ro
   */
  RomanianRomania = "ro",

  /**
   * Finnish language
   * ISO code: fi
   */
  Finnish = "fi",

  /**
   * Swedish (Sweden)
   * ISO code: sv-SE
   */
  Swedish = "sv-SE",

  /**
   * Vietnamese language
   * ISO code: vi
   */
  Vietnamese = "vi",

  /**
   * Turkish language
   * ISO code: tr
   */
  Turkish = "tr",

  /**
   * Czech language
   * ISO code: cs
   */
  Czech = "cs",

  /**
   * Greek language
   * ISO code: el
   */
  Greek = "el",

  /**
   * Bulgarian language
   * ISO code: bg
   */
  Bulgarian = "bg",

  /**
   * Russian language
   * ISO code: ru
   */
  Russian = "ru",

  /**
   * Ukrainian language
   * ISO code: uk
   */
  Ukrainian = "uk",

  /**
   * Hindi language
   * ISO code: hi
   */
  Hindi = "hi",

  /**
   * Thai language
   * ISO code: th
   */
  Thai = "th",

  /**
   * Chinese (Simplified, China)
   * ISO code: zh-CN
   */
  ChineseChina = "zh-CN",

  /**
   * Japanese language
   * ISO code: ja
   */
  Japanese = "ja",

  /**
   * Chinese (Traditional, Taiwan)
   * ISO code: zh-TW
   */
  ChineseTaiwan = "zh-TW",

  /**
   * Korean language
   * ISO code: ko
   */
  Korean = "ko",
}
