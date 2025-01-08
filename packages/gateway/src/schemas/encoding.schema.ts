import { z } from "zod";

export const EncodingType = z.union([z.literal("json"), z.literal("etf")]);

export type EncodingType = z.infer<typeof EncodingType>;

export const ProcessOptions = z
  .object({
    validateEtfKeys: z.boolean().optional(),
    processBigInts: z.boolean().optional(),
    validateSnowflakes: z.boolean().optional(),
  })
  .strict();

export type ProcessOptions = z.infer<typeof ProcessOptions>;

export const EncodingOptions = z
  .object({
    encodingType: EncodingType.default("etf"),
    maxPayloadSize: z.number().int().positive().default(4096),
    allowBigInts: z.boolean().default(true),
    validateKeys: z.boolean().default(true),
    validateSnowflakes: z.boolean().default(true),
    jsonSpaces: z.number().int().min(0).default(0),
    jsonReplacer: z
      .function()
      .args(z.string(), z.unknown())
      .returns(z.unknown())
      .optional(),
    jsonReviver: z
      .function()
      .args(z.string(), z.unknown())
      .returns(z.unknown())
      .optional(),
    etfStrictMode: z.boolean().default(true),
    etfAllowAtomKeys: z.boolean().default(false),
  })
  .strict();

export type EncodingOptions = z.infer<typeof EncodingOptions>;
