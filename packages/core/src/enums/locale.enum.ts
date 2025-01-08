import { z } from "zod";

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
  Borwegian = "no",
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

export const LocaleKey = z.nativeEnum(Locale);
export type LocaleKey = z.infer<typeof LocaleKey>;

export const AvailableLocale = z.record(LocaleKey, z.string());
export type AvailableLocale = z.infer<typeof AvailableLocale>;

export function createAvailableLocale(
  validator: z.ZodType<string>,
): z.ZodRecord<z.ZodNativeEnum<typeof Locale>, z.ZodType<string>> {
  return z.record(LocaleKey, validator);
}
