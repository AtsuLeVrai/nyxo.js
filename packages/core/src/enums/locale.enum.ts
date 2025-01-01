import { z } from "zod";

/**
 * @see {@link https://discord.com/developers/docs/reference#locales}
 */
export const Locale = {
  indonesian: "id",
  danish: "da",
  german: "de",
  englishUk: "en-GB",
  englishUs: "en-US",
  spanish: "es-ES",
  spanishLatam: "es-419",
  french: "fr",
  croatian: "hr",
  italian: "it",
  lithuanian: "lt",
  hungarian: "hu",
  dutch: "nl",
  norwegian: "no",
  polish: "pl",
  portugueseBrazilian: "pt-BR",
  romanianRomania: "ro",
  finnish: "fi",
  swedish: "sv-SE",
  vietnamese: "vi",
  turkish: "tr",
  czech: "cs",
  greek: "el",
  bulgarian: "bg",
  russian: "ru",
  ukrainian: "uk",
  hindi: "hi",
  thai: "th",
  chineseChina: "zh-CN",
  japanese: "ja",
  chineseTaiwan: "zh-TW",
  korean: "ko",
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

export const LocaleKeySchema = z.nativeEnum(Locale);
export type LocaleKey = z.infer<typeof LocaleKeySchema>;

export const AvailableLocaleSchema = z.record(LocaleKeySchema, z.string());
export type AvailableLocale = z.infer<typeof AvailableLocaleSchema>;

export function createAvailableLocaleSchema(
  validator: z.ZodType<string>,
): z.ZodRecord<z.ZodNativeEnum<typeof Locale>, z.ZodType<string>> {
  return z.record(LocaleKeySchema, validator);
}
