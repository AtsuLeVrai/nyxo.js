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
 * @enum {string}
 */
export enum Locale {
  /**
   * Indonesian language
   * ISO code: id
   * @type {string}
   */
  Indonesian = "id",

  /**
   * Danish language
   * ISO code: da
   * @type {string}
   */
  Danish = "da",

  /**
   * German language
   * ISO code: de
   * @type {string}
   */
  German = "de",

  /**
   * British English
   * ISO code: en-GB
   * @type {string}
   */
  EnglishUk = "en-GB",

  /**
   * American English
   * ISO code: en-US
   * @type {string}
   */
  EnglishUs = "en-US",

  /**
   * Spanish (Spain)
   * ISO code: es-ES
   * @type {string}
   */
  Spanish = "es-ES",

  /**
   * Spanish (Latin America)
   * ISO code: es-419
   * @type {string}
   */
  SpanishLatam = "es-419",

  /**
   * French language
   * ISO code: fr
   * @type {string}
   */
  French = "fr",

  /**
   * Croatian language
   * ISO code: hr
   * @type {string}
   */
  Croatian = "hr",

  /**
   * Italian language
   * ISO code: it
   * @type {string}
   */
  Italian = "it",

  /**
   * Lithuanian language
   * ISO code: lt
   * @type {string}
   */
  Lithuanian = "lt",

  /**
   * Hungarian language
   * ISO code: hu
   * @type {string}
   */
  Hungarian = "hu",

  /**
   * Dutch language
   * ISO code: nl
   * @type {string}
   */
  Dutch = "nl",

  /**
   * Norwegian language
   * ISO code: no
   * @type {string}
   * @note There appears to be a typo in the enum key name (Norwegian), but the ISO code is correct
   */
  Norwegian = "no",

  /**
   * Polish language
   * ISO code: pl
   * @type {string}
   */
  Polish = "pl",

  /**
   * Brazilian Portuguese
   * ISO code: pt-BR
   * @type {string}
   */
  PortugueseBrazilian = "pt-BR",

  /**
   * Romanian (Romania)
   * ISO code: ro
   * @type {string}
   */
  RomanianRomania = "ro",

  /**
   * Finnish language
   * ISO code: fi
   * @type {string}
   */
  Finnish = "fi",

  /**
   * Swedish (Sweden)
   * ISO code: sv-SE
   * @type {string}
   */
  Swedish = "sv-SE",

  /**
   * Vietnamese language
   * ISO code: vi
   * @type {string}
   */
  Vietnamese = "vi",

  /**
   * Turkish language
   * ISO code: tr
   * @type {string}
   */
  Turkish = "tr",

  /**
   * Czech language
   * ISO code: cs
   * @type {string}
   */
  Czech = "cs",

  /**
   * Greek language
   * ISO code: el
   * @type {string}
   */
  Greek = "el",

  /**
   * Bulgarian language
   * ISO code: bg
   * @type {string}
   */
  Bulgarian = "bg",

  /**
   * Russian language
   * ISO code: ru
   * @type {string}
   */
  Russian = "ru",

  /**
   * Ukrainian language
   * ISO code: uk
   * @type {string}
   */
  Ukrainian = "uk",

  /**
   * Hindi language
   * ISO code: hi
   * @type {string}
   */
  Hindi = "hi",

  /**
   * Thai language
   * ISO code: th
   * @type {string}
   */
  Thai = "th",

  /**
   * Chinese (Simplified, China)
   * ISO code: zh-CN
   * @type {string}
   */
  ChineseChina = "zh-CN",

  /**
   * Japanese language
   * ISO code: ja
   * @type {string}
   */
  Japanese = "ja",

  /**
   * Chinese (Traditional, Taiwan)
   * ISO code: zh-TW
   * @type {string}
   */
  ChineseTaiwan = "zh-TW",

  /**
   * Korean language
   * ISO code: ko
   * @type {string}
   */
  Korean = "ko",
}
