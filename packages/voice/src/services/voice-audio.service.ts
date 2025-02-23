import { spawn } from "node:child_process";
import { type Readable, Transform, type TransformCallback } from "node:stream";
import opus from "@discordjs/opus";
import ffmpeg from "ffmpeg-static";
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
  readonly #options: AudioOptions;
  readonly #encoder: opus.OpusEncoder;
  readonly #silenceFrame: Buffer;

  constructor(options: z.input<typeof AudioOptions>) {
    this.#options = AudioOptions.parse(options);
    this.#encoder = new opus.OpusEncoder(
      this.#options.sampleRate,
      this.#options.channels,
    );
    this.#encoder.setBitrate(this.#options.bitrate);
    this.#silenceFrame = Buffer.alloc(
      this.#options.frameSize * 2 * this.#options.channels,
    );
  }

  createAudioResource(
    input: Readable,
    options: AudioStreamOptions = {},
  ): Transform {
    const parseOptions = AudioStreamOptions.safeParse(options);
    if (!parseOptions.success) {
      throw new Error(fromZodError(parseOptions.error).message);
    }

    const encoderStream = new Transform({
      transform: (chunk: Buffer, _, callback: TransformCallback): void => {
        try {
          const expectedSize =
            this.#options.frameSize * 2 * this.#options.channels;
          let chunkResized = chunk;
          if (chunk.length !== expectedSize) {
            if (chunk.length < expectedSize) {
              const paddedChunk = Buffer.alloc(expectedSize);
              chunk.copy(paddedChunk);
              chunkResized = paddedChunk;
            } else {
              chunkResized = chunk.subarray(0, expectedSize);
            }
          }

          const processedChunk =
            parseOptions.data.volume !== 1
              ? this.adjustVolume(chunkResized, parseOptions.data.volume)
              : chunkResized;

          let encoded: Buffer;
          try {
            encoded = this.#encoder.encode(processedChunk);
          } catch (_error) {
            encoded = this.#encoder.encode(this.#silenceFrame);
          }

          callback(null, encoded);
        } catch (error) {
          try {
            const encoded = this.#encoder.encode(this.#silenceFrame);
            callback(null, encoded);
          } catch {
            callback(error as Error);
          }
        }
      },
    });

    const ffmpegArgs = [
      "-i",
      "pipe:0",
      "-f",
      "s16le",
      "-ar",
      String(this.#options.sampleRate),
      "-ac",
      String(this.#options.channels),
      "-acodec",
      "pcm_s16le",
      "-analyzeduration",
      "0",
      "-f",
      "s16le",
      "-ar",
      String(this.#options.sampleRate),
      "-ac",
      String(this.#options.channels),
      "-acodec",
      "pcm_s16le",
    ];

    if (parseOptions.data.filters.length > 0) {
      ffmpegArgs.push("-af", parseOptions.data.filters.join(","));
    }

    if (parseOptions.data.seek > 0) {
      ffmpegArgs.unshift("-ss", String(parseOptions.data.seek));
    }

    ffmpegArgs.push("-loglevel", "error", "pipe:1");

    const ffmpegProcess = spawn(ffmpeg as unknown as string, ffmpegArgs);

    let buffer = Buffer.alloc(0);

    ffmpegProcess.stdout.on("data", (data: Buffer) => {
      buffer = Buffer.concat([buffer, data]);
      const frameSize = this.#options.frameSize * 2 * this.#options.channels;

      while (buffer.length >= frameSize) {
        const frame = buffer.subarray(0, frameSize);
        buffer = buffer.subarray(frameSize);

        if (frame.length === frameSize) {
          encoderStream.write(frame);
        }
      }
    });

    ffmpegProcess.on("error", (error) => {
      encoderStream.emit("error", error);
    });

    ffmpegProcess.on("close", (code) => {
      if (code !== 0) {
        encoderStream.emit(
          "error",
          new Error(`FFmpeg exited with code ${code}`),
        );
      }
      if (buffer.length > 0) {
        encoderStream.write(buffer);
      }
      encoderStream.end();
    });

    input.pipe(ffmpegProcess.stdin);

    return encoderStream;
  }

  createSilence(duration: number): Buffer {
    const frameCount = Math.ceil(
      (duration / 1000) * (this.#options.sampleRate / this.#options.frameSize),
    );

    const silenceFrames: Buffer[] = [];

    for (let i = 0; i < frameCount; i++) {
      silenceFrames.push(this.#encoder.encode(this.#silenceFrame));
    }

    return Buffer.concat(silenceFrames);
  }

  adjustVolume(pcmData: Buffer, volume: number): Buffer {
    if (volume === 1) {
      return pcmData;
    }

    const adjustedVolume = Math.max(0, Math.min(2, volume));
    const adjusted = Buffer.alloc(pcmData.length);

    for (let i = 0; i < pcmData.length; i += 2) {
      const sample = pcmData.readInt16LE(i);
      adjusted.writeInt16LE(Math.floor(sample * adjustedVolume), i);
    }

    return adjusted;
  }

  encodeFrame(frame: Buffer): Buffer {
    const expectedSize = this.#options.frameSize * 2 * this.#options.channels;
    if (frame.length !== expectedSize) {
      throw new Error(
        `Invalid frame size. Expected ${expectedSize} bytes, got ${frame.length}`,
      );
    }
    return this.#encoder.encode(frame);
  }

  decodeFrame(frame: Buffer): Buffer {
    return this.#encoder.decode(frame);
  }

  getFrameSize(): number {
    return this.#options.frameSize;
  }

  getSampleRate(): number {
    return this.#options.sampleRate;
  }

  getChannels(): number {
    return this.#options.channels;
  }

  getBitrate(): number {
    return this.#options.bitrate;
  }
}
