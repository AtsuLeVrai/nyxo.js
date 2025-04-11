import { Readable, Writable } from "node:stream";
import OpusEncoder from "opusscript";
import { RTPPacketUtil } from "../utils/index.js";

export class AudioService {
  #opus: OpusEncoder | null = null;
  readonly #frameSize: number;
  readonly #sampleRate: number;
  readonly #channels: number;
  #sequence = 0;
  #timestamp = 0;
  #silenceFramesRemaining = 0;
  #destroyed = false;
  #ready = false;
  #userStreams = new Map<string, { stream: Writable; ssrc: number }>();

  constructor(
    options: {
      frameSize?: number;
      sampleRate?: number;
      channels?: number;
    } = {},
  ) {
    this.#frameSize = options.frameSize ?? 960;
    this.#sampleRate = options.sampleRate ?? 48000;
    this.#channels = options.channels ?? 2;

    this.#initializeOpus();
  }

  get isReady(): boolean {
    return this.#ready;
  }

  resetSequence(): void {
    this.#sequence = 0;
    this.#timestamp = 0;
  }

  encodePacket(pcmData: Buffer): Buffer | null {
    if (!this.#opus || this.#destroyed) {
      return null;
    }

    try {
      return this.#opus.encode(pcmData, this.#frameSize);
    } catch {
      return null;
    }
  }

  decodePacket(opusData: Buffer): Buffer | null {
    if (!this.#opus || this.#destroyed) {
      return null;
    }

    try {
      return this.#opus.decode(opusData);
    } catch {
      return null;
    }
  }

  createSilenceFrame(): Buffer {
    return Buffer.from(RTPPacketUtil.createSilenceFrame());
  }

  prepareSilenceFrames(count = 5): void {
    this.#silenceFramesRemaining = count;
  }

  getNextFrame(): { sequence: number; timestamp: number } {
    const sequence = this.#sequence;
    const timestamp = this.#timestamp;

    this.#sequence = RTPPacketUtil.incrementSequence(this.#sequence);
    this.#timestamp += RTPPacketUtil.calculateTimestampDelta(this.#frameSize);

    return { sequence, timestamp };
  }

  processOpusFrame(opusFrame: Buffer, _ssrc: number): Buffer | null {
    if (!this.#ready || this.#destroyed) {
      return null;
    }

    const { sequence, timestamp } = this.getNextFrame();

    return opusFrame;
  }

  processInputAudio(pcmAudio: Buffer, _ssrc: number): Buffer | null {
    if (!this.#opus || this.#destroyed) {
      return null;
    }

    try {
      const encodedPacket = this.#opus.encode(pcmAudio, this.#frameSize);
      const { sequence, timestamp } = this.getNextFrame();

      return encodedPacket;
    } catch {
      return null;
    }
  }

  processAudioStream(stream: Readable, ssrc: number): void {
    if (!this.#opus || this.#destroyed) {
      stream.destroy();
      return;
    }

    const frameBytes = this.#frameSize * this.#channels * 2; // 2 bytes per sample
    let buffer = Buffer.alloc(0);

    stream.on("data", (chunk: Buffer) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= frameBytes) {
        const frameBuffer = buffer.subarray(0, frameBytes);
        buffer = buffer.subarray(frameBytes);

        this.processInputAudio(frameBuffer, ssrc);
      }
    });

    stream.on("end", () => {
      if (buffer.length > 0) {
        // Handle the remaining buffer if needed
        const padding = Buffer.alloc(frameBytes - buffer.length);
        const finalFrame = Buffer.concat([buffer, padding]);
        this.processInputAudio(finalFrame, ssrc);
      }

      // Send silence frames to avoid Opus interpolation issues
      this.prepareSilenceFrames(5);
    });

    stream.on("error", (error) => {
      throw error;
    });
  }

  processIncomingOpusPacket(
    opusPacket: Buffer,
    userId: string,
    _ssrc: number,
  ): void {
    if (!this.#opus || this.#destroyed) {
      return;
    }

    const decodedAudio = this.#opus.decode(opusPacket);
    // If we have a stream for this user, write to it
    const userStream = this.#userStreams.get(userId);
    if (userStream && !userStream.stream.destroyed) {
      userStream.stream.write(decodedAudio);
    }
  }

  createUserAudioStream(userId: string, ssrc: number): Readable {
    // Create a duplex stream for the user's audio
    const { stream, readable } = this.#createAudioPipe();

    this.#userStreams.set(userId, { stream, ssrc });

    // When the readable side ends, clean up
    readable.on("end", () => {
      this.#userStreams.delete(userId);
    });

    return readable;
  }

  destroy(): void {
    if (this.#destroyed) {
      return;
    }

    this.#destroyed = true;
    this.#ready = false;

    // Clean up all user streams
    for (const { stream } of this.#userStreams.values()) {
      stream.end();
    }
    this.#userStreams.clear();

    // Clean up opus encoder
    this.#opus = null;
  }

  #initializeOpus(): void {
    try {
      this.#opus = new OpusEncoder(this.#sampleRate as 48000, this.#channels);
      this.#ready = true;
    } catch (error) {
      this.#ready = false;
      throw error;
    }
  }

  #createAudioPipe(): { stream: Writable; readable: Readable } {
    const readable = new Readable({ objectMode: false });
    readable._read = () => {}; // Required but no-op for push stream

    const writable = new Writable({
      objectMode: false,
      write(chunk, _encoding, callback) {
        readable.push(chunk);
        callback();
      },
      final(callback) {
        readable.push(null);
        callback();
      },
    });

    return { stream: writable, readable };
  }
}
