import { Readable, Transform, type TransformCallback } from "node:stream";
import opus from "@discordjs/opus";
import prism from "prism-media";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export enum AudioType {
  Raw = "raw",
  Opus = "opus",
  Ffmpeg = "ffmpeg",
}

export const AudioOptions = z
  .object({
    sampleRate: z.number().int().positive().default(48000),
    channels: z.number().int().positive().default(2),
    frameSize: z.number().int().positive().default(960),
    bitrate: z.number().int().positive().default(128000),
    volume: z.number().min(0).max(2).default(1),
    normalize: z.boolean().default(true),
  })
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

export class VoiceAudioService {
  readonly #encoder: opus.OpusEncoder;
  readonly #ffmpeg: typeof prism.FFmpeg;
  readonly #options: AudioOptions;
  readonly #silenceFrame: Buffer;

  constructor(options: AudioOptions) {
    this.#options = options;
    this.#encoder = new opus.OpusEncoder(
      this.#options.sampleRate,
      this.#options.channels,
    );
    this.#encoder.setBitrate(this.#options.bitrate);

    this.#ffmpeg = prism.FFmpeg;
    this.#silenceFrame = Buffer.alloc(this.#options.frameSize * 2);
  }

  createAudioResource(
    input: string | Buffer | Readable,
    options: AudioStreamOptions = {},
  ): Transform {
    const parseOptions = AudioStreamOptions.safeParse(options);
    if (!parseOptions.success) {
      throw new Error(fromZodError(parseOptions.error).message);
    }

    const transformers: Transform[] = [];
    const inputStream = this.#createInputStream(input, parseOptions.data);

    if (parseOptions.data.type !== AudioType.Raw || parseOptions.data.filters) {
      const transcoder = this.#createTranscoder(parseOptions.data);
      transformers.push(transcoder);
    }

    if (
      parseOptions.data.volume !== undefined &&
      parseOptions.data.volume !== 1
    ) {
      transformers.push(
        this.#createVolumeTransformer(parseOptions.data.volume),
      );
    }

    const opusEncoder = new prism.opus.Encoder({
      rate: this.#options.sampleRate,
      channels: this.#options.channels,
      frameSize: this.#options.frameSize,
    });
    transformers.push(opusEncoder);

    return transformers.reduce((stream, transformer) => {
      return stream.pipe(transformer);
    }, inputStream);
  }

  encodeFrame(frame: Buffer, options?: { frameSize?: number }): Buffer {
    const frameSize = options?.frameSize ?? this.#options.frameSize;

    if (frame.length !== frameSize * 2 * this.#options.channels) {
      throw new Error(
        `Invalid frame size. Expected ${frameSize * 2 * this.#options.channels} bytes, got ${frame.length}`,
      );
    }

    return this.#encoder.encode(frame);
  }

  decodeFrame(frame: Buffer): Buffer {
    try {
      return this.#encoder.decode(frame);
    } catch (error) {
      throw new Error("Failed to decode opus frame", { cause: error });
    }
  }

  createSilence(duration: number): Buffer {
    const frameCount = Math.ceil(
      (duration / 1000) * (this.#options.sampleRate / this.#options.frameSize),
    );
    return Buffer.concat(new Array(frameCount).fill(this.#silenceFrame));
  }

  adjustVolume(pcmData: Buffer, volume: number): Buffer {
    let setVolume = volume;
    if (volume === 1) {
      return pcmData;
    }

    setVolume = Math.max(0, Math.min(2, volume));
    const adjusted = Buffer.alloc(pcmData.length);

    for (let i = 0; i < pcmData.length; i += 2) {
      const sample = pcmData.readInt16LE(i);
      adjusted.writeInt16LE(Math.floor(sample * setVolume), i);
    }

    return adjusted;
  }

  #createInputStream(
    input: string | Buffer | Readable,
    options: AudioStreamOptions,
  ): Transform {
    if (Buffer.isBuffer(input) || input instanceof Readable) {
      const resource = new Transform({
        transform(chunk: Buffer, _: string, callback: TransformCallback): void {
          callback(null, chunk);
        },
      });

      if (Buffer.isBuffer(input)) {
        resource.write(input);
        resource.end();
      } else {
        input.pipe(resource);
      }

      return resource;
    }

    const transform = new Transform({
      transform(chunk: Buffer, _: string, callback: TransformCallback): void {
        callback(null, chunk);
      },
    });

    const ffmpegArgs = ["-i", input];
    if (options.seek) {
      ffmpegArgs.unshift("-ss", String(options.seek));
    }

    const ffmpeg = new this.#ffmpeg({ args: ffmpegArgs });
    ffmpeg.pipe(transform);

    return transform;
  }

  #createTranscoder(options: AudioStreamOptions): Transform {
    const ffmpegOptions: prism.FFmpegOptions = {
      args: [
        "-analyzeduration",
        "0",
        "-loglevel",
        "0",
        "-acodec",
        "pcm_s16le",
        "-f",
        "s16le",
        "-ar",
        String(this.#options.sampleRate),
        "-ac",
        String(this.#options.channels),
      ],
    };

    if (options.filters) {
      ffmpegOptions.args?.push("-af", options.filters.join(","));
    }

    const transform = new Transform({
      transform(chunk: Buffer, _: string, callback: TransformCallback): void {
        callback(null, chunk);
      },
    });

    const ffmpeg = new this.#ffmpeg(ffmpegOptions);
    ffmpeg.pipe(transform);

    return transform;
  }

  #createVolumeTransformer(volume: number): Transform {
    return new Transform({
      transform(chunk: Buffer, _: string, callback: TransformCallback): void {
        const transformed = Buffer.alloc(chunk.length);
        for (let i = 0; i < chunk.length; i += 2) {
          const sample = chunk.readInt16LE(i);
          transformed.writeInt16LE(Math.floor(sample * volume), i);
        }
        callback(null, transformed);
      },
    });
  }
}
