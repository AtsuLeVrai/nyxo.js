import { z } from "zod";
import { AudioType } from "../services/index.js";

export const AudioOptions = z
  .object({
    sampleRate: z.number().int().positive().default(48000),
    channels: z.number().int().positive().default(2),
    frameSize: z.number().int().positive().default(960),
    bitrate: z.number().int().positive().default(128000),
    volume: z.number().min(0).max(2).default(1),
    normalize: z.boolean().default(true),
  })
  .strict()
  .readonly();

export type AudioOptions = z.infer<typeof AudioOptions>;

export const AudioStreamOptions = z
  .object({
    type: z.nativeEnum(AudioType).default(AudioType.Ffmpeg),
    seek: z.number().int().nonnegative().default(0),
    volume: z.number().min(0).max(2).default(1),
    bitrate: z.number().int().positive().default(128000),
    filters: z.array(z.string()).default([]),
  })
  .strict()
  .readonly();

export type AudioStreamOptions = z.input<typeof AudioStreamOptions>;
