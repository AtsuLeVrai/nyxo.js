import { spawn } from "node:child_process";
import { Transform, type TransformCallback } from "node:stream";
import opus from "@discordjs/opus";
import ffmpeg from "ffmpeg-static";
import type { z } from "zod";
import { fromZodError } from "zod-validation-error";
import type { VoiceConnection } from "../core/index.js";
import { type AudioOptions, AudioStreamOptions } from "../options/index.js";

export enum AudioType {
  Raw = "raw",
  Opus = "opus",
  Ffmpeg = "ffmpeg",
}

export class VoiceAudioService {
  #connection: VoiceConnection;
  #options: AudioOptions;
  #encoder: opus.OpusEncoder;
  #silenceFrame: Buffer;
  #sequenceNumber = 0;
  #timestamp = 0;

  constructor(connection: VoiceConnection, options: AudioOptions) {
    this.#connection = connection;
    this.#options = options;
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
    input: Buffer,
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

          let processedChunk: Buffer;

          // Resize the chunk if necessary
          if (chunk.length !== expectedSize) {
            if (chunk.length < expectedSize) {
              const paddedChunk = Buffer.alloc(expectedSize);
              chunk.copy(paddedChunk);
              processedChunk = paddedChunk;
            } else {
              processedChunk = chunk.subarray(0, expectedSize);
            }
          } else {
            processedChunk = chunk;
          }

          // Apply volume adjustment if needed
          if (parseOptions.data.volume !== 1) {
            processedChunk = this.adjustVolume(
              processedChunk,
              parseOptions.data.volume,
            );
          }

          // Encode the audio chunk to Opus format
          let encoded: Buffer;
          try {
            encoded = this.#encoder.encode(processedChunk);
          } catch (_error) {
            encoded = this.#encoder.encode(this.#silenceFrame);
          }

          // If we have SSRC and secret key, we can encrypt and prepare RTP packets
          if (this.#connection.ssrc !== 0) {
            const packet = this.createRtpPacket(encoded);
            callback(null, packet);
          } else {
            callback(null, encoded);
          }
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

    if (options.type === AudioType.Ffmpeg) {
      this.#processWithFfmpeg(input, encoderStream, parseOptions.data);
    } else {
      // For raw or opus input, just push the data to the encoder
      setImmediate(() => {
        encoderStream.write(input);
        encoderStream.end();
      });
    }

    return encoderStream;
  }

  createRtpPacket(opusPacket: Buffer): Buffer {
    if (this.#connection.ssrc === 0) {
      throw new Error("SSRC not set. Call setSsrc before creating RTP packets");
    }

    // Create the RTP header
    const header = Buffer.alloc(12);

    // Version + Flags (0x80)
    header.writeUInt8(0x80, 0);

    // Payload Type (0x78)
    header.writeUInt8(0x78, 1);

    // Sequence
    header.writeUInt16BE(this.#sequenceNumber, 2);
    this.#sequenceNumber = (this.#sequenceNumber + 1) & 0xffff;

    // Timestamp
    header.writeUInt32BE(this.#timestamp, 4);
    this.#timestamp = (this.#timestamp + this.#options.frameSize) >>> 0;

    // SSRC
    header.writeUInt32BE(this.#connection.ssrc, 8);

    return Buffer.concat([header, opusPacket]);
  }

  createSilencePackets(duration: number): Buffer[] {
    const frameSize = this.#options.frameSize;
    const sampleRate = this.#options.sampleRate;

    // Calculate number of frames needed
    const frameCount = Math.ceil((duration / 1000) * (sampleRate / frameSize));

    const silenceFrames: Buffer[] = [];

    // Generate silence packets
    for (let i = 0; i < frameCount; i++) {
      const encoded = this.#encoder.encode(this.#silenceFrame);
      if (this.#connection.ssrc !== 0) {
        silenceFrames.push(this.createRtpPacket(encoded));
      } else {
        silenceFrames.push(encoded);
      }
    }

    return silenceFrames;
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

  #processWithFfmpeg(
    input: Buffer,
    encoderStream: Transform,
    options: z.infer<typeof AudioStreamOptions>,
  ): void {
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
    ];

    if (options.filters.length > 0) {
      ffmpegArgs.push("-af", options.filters.join(","));
    }

    if (options.seek > 0) {
      ffmpegArgs.unshift("-ss", String(options.seek));
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

        encoderStream.write(frame);
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

    // Write input buffer to ffmpeg's stdin
    ffmpegProcess.stdin.write(input);
    ffmpegProcess.stdin.end();
  }
}
