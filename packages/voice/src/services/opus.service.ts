import { z } from "zod";
import {
  type UnifiedOpusEncoder,
  createOpusEncoder,
} from "../polyfills/index.js";

/**
 * Sample rates supported by the Opus codec
 * Discord requires 48kHz for compatibility with all clients
 */
export enum OpusSampleRate {
  /** 8 kHz - Basic telephone quality */
  Narrowband = 8000,

  /** 12 kHz - Enhanced telephone quality */
  Mediumband = 12000,

  /** 16 kHz - Wideband voice quality */
  Wideband = 16000,

  /** 24 kHz - Basic music quality */
  Superwideband = 24000,

  /** 48 kHz - Full music quality (required by Discord) */
  Fullband = 48000,
}

/**
 * Number of channels supported by the Opus codec
 * Discord requires 2 channels (stereo) for compatibility with all clients
 */
export enum OpusChannels {
  /** Mono (1 channel) */
  Mono = 1,

  /** Stereo (2 channels) - Required by Discord */
  Stereo = 2,
}

/**
 * Opus frame sizes in milliseconds
 * Determines latency and processing time
 */
export enum OpusFrameSize {
  /** 2.5 ms - Minimum latency, but higher bitrate */
  VeryShort = 2.5,

  /** 5 ms - Low latency, good for competitive gaming */
  Short = 5,

  /** 10 ms - Balance between latency and efficiency */
  Medium = 10,

  /** 20 ms - Standard size for Discord, good compromise */
  Standard = 20,

  /** 40 ms - Increased efficiency with higher latency */
  Long = 40,

  /** 60 ms - Maximum efficiency, highest latency */
  VeryLong = 60,
}

/**
 * Opus applications that determine internal algorithms used
 */
export enum OpusApplication {
  /** VOIP - Optimized for speech, prioritizes voice clarity */
  Voip = 2048,

  /** Audio - Optimized for music, prioritizes audio quality */
  Audio = 2049,

  /** Low Delay - Optimized for real-time at the expense of quality */
  LowDelay = 2051,
}

/**
 * Options for the Opus service
 */
export const OpusOptions = z.object({
  /**
   * Sample rate to use (in Hz)
   * Discord requires 48000 Hz
   * @default OpusSampleRate.Fullband (48000 Hz)
   */
  sampleRate: z.nativeEnum(OpusSampleRate).default(OpusSampleRate.Fullband),

  /**
   * Number of audio channels (mono or stereo)
   * Discord requires 2 channels (stereo)
   * @default OpusChannels.Stereo (2 channels)
   */
  channels: z.nativeEnum(OpusChannels).default(OpusChannels.Stereo),

  /**
   * Frame size in milliseconds
   * Affects latency and bitrate
   * @default OpusFrameSize.Standard (20 ms)
   */
  frameSize: z.nativeEnum(OpusFrameSize).default(OpusFrameSize.Standard),

  /**
   * Opus application to use
   * Determines internal algorithms and optimizations
   * @default OpusApplication.AUDIO
   */
  application: z.nativeEnum(OpusApplication).default(OpusApplication.Audio),

  /**
   * Target bitrate in bits per second
   * Typical values: 8000 to 128000
   * @default 64000 (64 kbps)
   */
  bitrate: z.number().int().min(8000).max(512000).default(64000),

  /**
   * Encoder complexity (0-10)
   * Higher values = better quality but more CPU
   * @default 10
   */
  complexity: z.number().int().min(0).max(10).default(10),

  /**
   * Forward Error Correction (FEC)
   * Improves quality on lossy networks but increases bitrate
   * @default true
   */
  fec: z.boolean().default(true),

  /**
   * Voice Activity Detection (VAD)
   * Reduces bitrate during silences
   * @default false
   */
  vad: z.boolean().default(false),

  /**
   * Use WebAssembly for opusscript if available
   * @default true
   */
  wasm: z.boolean().default(true),
});

export type OpusOptions = z.infer<typeof OpusOptions>;

/**
 * Service for Opus audio encoding and decoding
 *
 * This service provides a unified interface for encoding and decoding audio data
 * using the Opus codec, which is required by Discord for voice communications.
 * It uses a polyfill to harmonize the different Opus implementations.
 *
 * Main features:
 * - Support for multiple Opus implementations (@discordjs/opus, opusscript)
 * - Complete configuration of encoding parameters
 * - Simple API for encoding and decoding
 * - Optimizations for Discord voice communications
 *
 * Technical details:
 * - Sample rate: 48kHz (required by Discord)
 * - Channels: 2 (stereo, required by Discord)
 * - Frame size: 20ms (960 samples at 48kHz)
 * - Encoded frames have variable size depending on audio content
 *
 * Note: One of the Opus libraries must be installed:
 * - @discordjs/opus (recommended for performance)
 * - opusscript (slower, but pure JS)
 */
export class OpusService {
  /**
   * Unified Opus encoder/decoder
   * Instantiated during initialization
   * @private
   */
  #opusEncoder: UnifiedOpusEncoder | null = null;

  /**
   * Indicates if the service has been properly initialized
   * @private
   */
  #initialized = false;

  /**
   * Size in samples of a frame at the current sample rate
   * @private
   */
  readonly #frameSize: number = 0;

  /**
   * Name of the implementation being used
   * @private
   */
  #implementation: string | null = null;

  /**
   * Configuration options for the Opus encoder
   * @private
   */
  readonly #options: OpusOptions;

  /**
   * Creates a new instance of the Opus service
   *
   * @param options - Configuration options for the Opus encoder
   */
  constructor(options: OpusOptions) {
    this.#options = options;
    this.#frameSize = Math.floor(
      (this.#options.sampleRate / 1000) * this.#options.frameSize,
    );
  }

  /**
   * Gets the size in samples of a frame at the current sample rate
   *
   * @returns The number of samples per frame
   */
  get frameSize(): number {
    return this.#frameSize;
  }

  /**
   * Gets the name of the Opus library being used
   *
   * @returns The library name or null if not initialized
   */
  get implementation(): string | null {
    return this.#implementation;
  }

  /**
   * Checks if the service has been properly initialized
   *
   * @returns true if the service is ready to use
   */
  get isInitialized(): boolean {
    return this.#initialized && this.#opusEncoder !== null;
  }

  /**
   * Initializes the Opus service using the polyfill
   *
   * @throws {Error} If no Opus library is available
   * @returns A promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    // Destroy any existing instance
    this.destroy();

    try {
      // Use the polyfill to create a unified encoder
      this.#opusEncoder = await createOpusEncoder({
        sampleRate: this.#options.sampleRate,
        channels: this.#options.channels,
        application: this.#options.application,
        bitrate: this.#options.bitrate,
        complexity: this.#options.complexity,
        fec: this.#options.fec,
        wasm: this.#options.wasm,
        packetLoss: 10, // Default value for packet loss
      });

      // Configure voice activity detection if requested
      if (this.#options.vad) {
        this.#opusEncoder.setSignalType(0); // 0 = OPUS_SIGNAL_VOICE
      }

      // Store the implementation type (determined by reflection)
      this.#implementation =
        this.#opusEncoder.constructor.name === "DiscordOpusAdapter"
          ? "@discordjs/opus"
          : "opusscript";

      this.#initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize Opus service: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Encodes PCM audio data to Opus format
   *
   * @param pcmData - Raw PCM data (48kHz, 16 bits, stereo) to encode
   * @returns The encoded data in Opus format
   * @throws {Error} If the service is not initialized or if encoding fails
   */
  encode(pcmData: Buffer | Uint8Array): Buffer {
    if (!(this.isInitialized && this.#opusEncoder)) {
      throw new Error(
        "Opus service is not initialized. Call initialize() first.",
      );
    }

    try {
      // Convert to Buffer if necessary
      const inputBuffer = Buffer.isBuffer(pcmData)
        ? pcmData
        : Buffer.from(pcmData);

      // Check if the data size matches a complete frame
      const expectedSize = this.#frameSize * this.#options.channels * 2; // * 2 for 16 bits (2 bytes) per sample
      if (inputBuffer.length !== expectedSize) {
        throw new Error(
          `Invalid PCM data size: ${inputBuffer.length} bytes (expected: ${expectedSize} bytes for ${this.#frameSize} samples)`,
        );
      }

      // Use the unified encoder
      return this.#opusEncoder.encode(inputBuffer, this.#frameSize);
    } catch (error) {
      throw new Error(
        `Error during Opus encoding: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Decodes Opus data to PCM format
   *
   * @param opusData - Encoded Opus data to decode
   * @returns The decoded data in PCM format (48kHz, 16 bits, stereo)
   * @throws {Error} If the service is not initialized or if decoding fails
   */
  decode(opusData: Buffer | Uint8Array): Buffer {
    if (!(this.isInitialized && this.#opusEncoder)) {
      throw new Error(
        "Opus service is not initialized. Call initialize() first.",
      );
    }

    try {
      // Convert to Buffer if necessary
      const inputBuffer = Buffer.isBuffer(opusData)
        ? opusData
        : Buffer.from(opusData);

      // Use the unified decoder
      return this.#opusEncoder.decode(inputBuffer);
    } catch (error) {
      throw new Error(
        `Error during Opus decoding: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Destroys the resources used by the Opus service
   *
   * Frees the memory used by the encoder/decoder and resets the state.
   */
  destroy(): void {
    if (this.#opusEncoder) {
      try {
        this.#opusEncoder.destroy();
      } catch (_error) {
        // Ignore errors during destruction
      }
      this.#opusEncoder = null;
    }

    this.#implementation = null;
    this.#initialized = false;
  }
}
