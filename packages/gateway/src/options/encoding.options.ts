import { z } from "zod";
import { EncodingType } from "../types/index.js";

export const EncodingOptions = z.object({
  encodingType: z.nativeEnum(EncodingType).default(EncodingType.Etf),
  maxPayloadSize: z.number().int().default(4096),
  allowBigInts: z.boolean().default(true),
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
});
