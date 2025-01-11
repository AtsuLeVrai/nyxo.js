import { z } from "zod";
import { EncodingType } from "../types/index.js";

export const EncodingOptions = z
  .object({
    type: z.nativeEnum(EncodingType).optional().default(EncodingType.Etf),
    maxPayloadSize: z.number().int().positive().optional().default(4096),
    allowBigInts: z.boolean().optional().default(true),
    jsonSpaces: z.number().int().min(0).optional().default(0),
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
    etfStrictMode: z.boolean().optional().default(true),
    etfAllowAtomKeys: z.boolean().optional().default(false),
  })
  .strict();
