import type DiscordOpus from "@discordjs/opus";
import { OptionalDeps } from "@nyxjs/core";
import type OpusScript from "opusscript";
import {
  OpusApplication,
  OpusChannels,
  OpusSampleRate,
} from "../services/index.js";

/**
 * Common interface for Opus encoders
 * Harmonizes differences between @discordjs/opus and opusscript
 */
export interface UnifiedOpusEncoder {
  /**
   * Encodes raw PCM data to compressed Opus format
   * @param buffer PCM data to encode
   * @param frameSize Frame size in samples (may be ignored by some implementations)
   * @returns Opus encoded data
   */
  encode(buffer: Buffer, frameSize: number): Buffer;

  /**
   * Decodes Opus data to raw PCM format
   * @param buffer Opus data to decode
   * @returns Decoded PCM data
   */
  decode(buffer: Buffer): Buffer;

  /**
   * Sets the Opus encoder bitrate
   * @param bitrate Target bitrate in bits per second
   */
  setBitrate(bitrate: number): void;

  /**
   * Gets the current encoder bitrate
   * @returns Bitrate in bits per second
   */
  getBitrate(): number;

  /**
   * Enables or disables Forward Error Correction (FEC)
   * @param enabled True to enable, false to disable
   */
  setFec(enabled: boolean): void;

  /**
   * Sets the encoder complexity (0-10)
   * @param complexity Complexity level (0 = low quality/CPU, 10 = high quality/CPU)
   */
  setComplexity(complexity: number): void;

  /**
   * Sets the anticipated packet loss percentage
   * @param percentage Loss percentage (0-100)
   */
  setPacketLossPerc(percentage: number): void;

  /**
   * Sets the signal type (voice or music)
   * @param signalType 0 for voice, 1 for music
   */
  setSignalType(signalType: number): void;

  /**
   * Releases resources used by the encoder/decoder
   */
  destroy(): void;
}

/**
 * Options for creating a unified Opus encoder
 */
export interface UnifiedOpusOptions {
  /**
   * Sample rate in Hz (8000, 12000, 16000, 24000, or 48000)
   * @default 48000
   */
  sampleRate?: OpusSampleRate;

  /**
   * Number of audio channels (1 for mono, 2 for stereo)
   * @default 2
   */
  channels?: OpusChannels;

  /**
   * Opus application (VOIP, AUDIO, or LOW_DELAY)
   * @default OpusApplication.Audio (2049)
   */
  application?: OpusApplication;

  /**
   * Target bitrate in bits per second
   * @default 64000
   */
  bitrate?: number;

  /**
   * Forward Error Correction (FEC)
   * @default true
   */
  fec?: boolean;

  /**
   * Encoder complexity (0-10)
   * @default 10
   */
  complexity?: number;

  /**
   * Anticipated packet loss percentage
   * @default 10
   */
  packetLoss?: number;

  /**
   * Use WebAssembly for opusscript
   * @default true
   */
  wasm?: boolean;
}

/**
 * Adapter for @discordjs/opus
 * Implements the UnifiedOpusEncoder interface
 */
export class DiscordOpusAdapter implements UnifiedOpusEncoder {
  readonly #encoder: DiscordOpus.OpusEncoder; // OpusEncoder from @discordjs/opus
  #currentBitrate: number;

  /**
   * Creates a new adapter for @discordjs/opus
   * @param OpusEncoder OpusEncoder class from @discordjs/opus
   * @param options Configuration options
   */
  constructor(
    OpusEncoder: typeof DiscordOpus,
    options: UnifiedOpusOptions = {},
  ) {
    const sampleRate = options.sampleRate || OpusSampleRate.Fullband;
    const channels = options.channels || OpusChannels.Stereo;
    this.#currentBitrate = options.bitrate || 64000;

    // Create the native encoder
    this.#encoder = new OpusEncoder.OpusEncoder(sampleRate, channels);

    // Configure options
    this.setBitrate(this.#currentBitrate);
    if (options.fec !== undefined) {
      this.setFec(options.fec);
    }
    if (options.packetLoss !== undefined) {
      this.setPacketLossPerc(options.packetLoss);
    }
    if (options.complexity !== undefined && "setComplexity" in this.#encoder) {
      this.setComplexity(options.complexity);
    }
  }

  encode(buffer: Buffer): Buffer {
    return this.#encoder.encode(buffer);
  }

  decode(buffer: Buffer): Buffer {
    return this.#encoder.decode(buffer);
  }

  setBitrate(bitrate: number): void {
    this.#currentBitrate = bitrate;
    this.#encoder.setBitrate(bitrate);
  }

  getBitrate(): number {
    return this.#currentBitrate;
  }

  setFec(enabled: boolean): void {
    // Use CTL codes for FEC if the method doesn't exist
    this.#encoder.applyEncoderCTL(4012, enabled ? 1 : 0);
  }

  setComplexity(complexity: number): void {
    // Use CTL codes for complexity if the method doesn't exist
    this.#encoder.applyEncoderCTL(4010, complexity);
  }

  setPacketLossPerc(percentage: number): void {
    // Use CTL codes for packet loss if the method doesn't exist
    this.#encoder.applyEncoderCTL(4014, percentage);
  }

  setSignalType(signalType: number): void {
    // Use CTL codes for signal type if the method doesn't exist
    this.#encoder.applyEncoderCTL(4024, signalType);
  }

  destroy(): void {
    return;
  }
}

/**
 * Adapter for opusscript
 * Implements the UnifiedOpusEncoder interface
 */
export class OpusScriptAdapter implements UnifiedOpusEncoder {
  readonly #encoder: OpusScript; // OpusScript instance
  readonly #frameSize: number;
  #currentBitrate: number;

  /**
   * Creates a new adapter for opusscript
   * @param opusScript OpusScript class
   * @param options Configuration options
   */
  constructor(opusScript: typeof OpusScript, options: UnifiedOpusOptions = {}) {
    const sampleRate = options.sampleRate || OpusSampleRate.Fullband;
    const channels = options.channels || OpusChannels.Stereo;
    const application = options.application || OpusApplication.Audio;
    this.#frameSize = Math.floor((sampleRate / 1000) * 20); // 20ms by default
    this.#currentBitrate = options.bitrate || 64000;

    // Create the encoder with the specified configuration
    // @ts-expect-error
    this.#encoder = new opusScript(sampleRate, channels, application, {
      wasm: options.wasm !== undefined ? options.wasm : true,
    });

    // Configure options
    this.setBitrate(this.#currentBitrate);
    if (options.fec !== undefined) {
      this.setFec(options.fec);
    }
    if (options.complexity !== undefined) {
      this.setComplexity(options.complexity);
    }
    if (options.packetLoss !== undefined) {
      this.setPacketLossPerc(options.packetLoss);
    }
  }

  encode(buffer: Buffer, frameSize?: number): Buffer {
    return this.#encoder.encode(buffer, frameSize || this.#frameSize);
  }

  decode(buffer: Buffer): Buffer {
    return this.#encoder.decode(buffer);
  }

  setBitrate(bitrate: number): void {
    this.#currentBitrate = bitrate;
    this.#encoder.setBitrate(bitrate);
  }

  getBitrate(): number {
    return this.#currentBitrate;
  }

  setFec(enabled: boolean): void {
    // OpusScript uses encoderCTL with specific codes
    // 4012 is the CTL code for FEC
    this.#encoder.encoderCTL(4012, enabled ? 1 : 0);
  }

  setComplexity(complexity: number): void {
    // 4010 is the CTL code for complexity
    this.#encoder.encoderCTL(4010, complexity);
  }

  setPacketLossPerc(percentage: number): void {
    // 4014 is the CTL code for anticipated packet loss
    this.#encoder.encoderCTL(4014, percentage);
  }

  setSignalType(signalType: number): void {
    // 4024 is the CTL code for signal type
    this.#encoder.encoderCTL(4024, signalType);
  }

  destroy(): void {
    if (this.#encoder) {
      this.#encoder.delete();
    }
  }
}

/**
 * Factory to create a unified Opus encoder
 * Automatically detects available libraries
 *
 * @param options Configuration options
 * @returns A unified Opus encoder instance
 * @throws Error if no Opus library is available
 */
export async function createOpusEncoder(
  options: UnifiedOpusOptions = {},
): Promise<UnifiedOpusEncoder> {
  try {
    // Try to load @discordjs/opus first (better performance)
    const discordOpus =
      await OptionalDeps.safeImport<typeof DiscordOpus>("@discordjs/opus");
    if (discordOpus.success) {
      return new DiscordOpusAdapter(discordOpus.data, options);
    }

    const opusScript =
      await OptionalDeps.safeImport<typeof OpusScript>("opusscript");
    if (opusScript.success) {
      return new OpusScriptAdapter(opusScript.data, options);
    }

    throw new Error(
      "No Opus library available. Please install either @discordjs/opus or opusscript.",
    );
  } catch (error) {
    throw new Error(
      `Failed to initialize Opus service: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Constants for common Opus control codes
 * Useful for advanced operations with both libraries
 */
export const OpusCtl = {
  // Common encoder control codes
  SET_BITRATE: 4002,
  SET_BANDWIDTH: 4008,
  SET_COMPLEXITY: 4010,
  SET_FEC: 4012,
  SET_PACKET_LOSS_PERC: 4014,
  SET_SIGNAL: 4024,

  // Common decoder control codes
  SET_GAIN: 4086,
  GET_LAST_PACKET_DURATION: 4039,

  // Signal types
  SIGNAL_VOICE: 0,
  SIGNAL_MUSIC: 1,
} as const;
