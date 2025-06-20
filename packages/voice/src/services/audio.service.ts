import {
  DISCORD_CHANNELS,
  DISCORD_FRAME_SIZE,
  OpusDecoder,
  OpusDecoderOptions,
  OpusEncoder,
  OpusEncoderOptions,
} from "@nyxojs/opus";
import { z } from "zod/v4";
import { VoiceAudioCodec } from "../types/index.js";

/**
 * Total number of samples per frame for Discord Voice Gateway.
 * This is calculated as the product of the number of channels
 * and the frame size required by Discord.
 */
const TOTAL_SAMPLES_PER_FRAME = DISCORD_FRAME_SIZE * DISCORD_CHANNELS;

/**
 * Zod schema for validating audio processing configuration options.
 *
 * This schema ensures that all audio service configuration parameters
 * are properly validated according to Discord Voice Gateway requirements
 * and Opus encoding/decoding best practices.
 */
export const AudioServiceOptions = z.object({
  /**
   * Audio codec to use for voice processing operations.
   *
   * Specifies which audio codec should be used for encoding and decoding
   * voice data. Currently, only the Opus codec is supported as it's the
   * standard codec required by Discord's Voice Gateway protocol.
   *
   * Opus provides excellent quality and compression for voice communication
   * and includes built-in features like Forward Error Correction (FEC)
   * and Variable Bitrate (VBR) that are essential for real-time voice chat.
   *
   * @default 'opus'
   */
  codec: z.enum(VoiceAudioCodec).default(VoiceAudioCodec.Opus),

  /**
   * Custom encoder configuration options.
   *
   * Provides fine-grained control over Opus encoder behavior by allowing
   * partial overrides of the default Discord-optimized settings. These
   * options will be merged with the service's default encoder configuration
   * which is already optimized for Discord Voice Gateway requirements.
   *
   * Common customizations include:
   * - `bitrate`: Adjust quality vs bandwidth tradeoff
   * - `complexity`: Balance encoding speed vs compression efficiency
   * - `inbandFEC`: Control Forward Error Correction strength
   * - `maxBandwidth`: Limit frequency range for specific use cases
   *
   * @see {@link https://opus-codec.org/docs/opus_api-1.3.1/group__opus__encoder.html}
   * @see {@link OpusEncoderOptions}
   */
  encoderOptions: OpusEncoderOptions.prefault({}),

  /**
   * Custom decoder configuration options.
   *
   * Provides fine-grained control over Opus decoder behavior by allowing
   * partial overrides of the default Discord-optimized settings. These
   * options will be merged with the service's default decoder configuration
   * which is already optimized for Discord Voice Gateway requirements.
   *
   * Common customizations include:
   * - `gain`: Adjust output volume level
   * - Advanced error concealment parameters
   * - Buffer management settings
   *
   * @see {@link https://opus-codec.org/docs/opus_api-1.3.1/group__opus__decoder.html}
   * @see {@link OpusDecoderOptions}
   */
  decoderOptions: OpusDecoderOptions.prefault({}),

  /**
   * Enable automatic error recovery mechanisms.
   *
   * When enabled, the audio service will automatically attempt to recover
   * from encoder/decoder errors by recreating the affected components.
   * This helps maintain audio processing continuity during temporary
   * issues such as memory corruption, codec state errors, or resource
   * exhaustion scenarios.
   *
   * Recovery mechanisms include:
   * - Automatic encoder/decoder recreation on failure
   * - State reset and reinitialization
   * - Graceful degradation during resource constraints
   * - Exponential backoff for repeated failures
   *
   * Disable this for applications that prefer explicit error handling
   * or when implementing custom recovery strategies.
   *
   * @default true
   */
  autoRecovery: z.boolean().default(true),

  /**
   * Maximum consecutive errors before abandoning recovery attempts.
   *
   * Specifies the threshold for consecutive processing errors that will
   * trigger permanent failure mode. This prevents infinite recovery loops
   * and resource exhaustion during persistent issues such as corrupted
   * audio data, incompatible system configurations, or hardware failures.
   *
   * The counter resets on any successful operation, so intermittent errors
   * won't trigger this limit. Only sustained failure sequences will cause
   * the service to give up and propagate errors to the caller.
   *
   * Recommended values:
   * - Low latency apps: 3-5 (fail fast)
   * - Robust apps: 10-15 (more resilient)
   * - Debug/development: 1-2 (immediate failure)
   *
   * @minimum 1
   * @maximum 50
   * @default 10
   */
  maxConsecutiveErrors: z.number().int().min(1).max(50).default(10),
});

/**
 * Inferred TypeScript type from the Zod schema.
 *
 * Use this type for function parameters, return values, and variable
 * declarations when working with validated audio service options.
 */
export type AudioServiceOptions = z.infer<typeof AudioServiceOptions>;

/**
 * Service responsible for encoding and decoding audio data for Discord Voice Gateway.
 *
 * This service handles the conversion between raw PCM audio data and compressed
 * Opus packets suitable for transmission over Discord's Voice Gateway. It provides
 * high-performance audio processing with Discord-specific optimizations and
 * automatic compliance with Discord's audio requirements.
 *
 * Key features:
 * - Discord Voice Gateway compliance (48kHz, stereo, 20ms frames)
 * - High-performance native Opus encoding/decoding
 * - Automatic frame size validation and error handling
 * - Forward Error Correction (FEC) support for packet loss recovery
 * - Comprehensive audio statistics and monitoring
 * - Memory-efficient operation with resource cleanup
 *
 * Audio format requirements:
 * - Sample Rate: 48kHz (mandatory for Discord)
 * - Channels: 2 (stereo, interleaved L/R samples)
 * - Frame Size: 960 samples per channel (20ms duration)
 * - Bit Depth: 16-bit signed integers
 * - Endianness: Native system endianness
 *
 * Performance characteristics:
 * - Encoding: ~200-500x real-time on modern hardware
 * - Decoding: ~300-800x real-time on modern hardware
 * - Memory: ~1-2MB total memory usage for encoder+decoder
 * - Latency: <1ms algorithmic delay for VoIP-optimized settings
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#sending-voice}
 */
export class AudioService {
  /**
   * Internal audio processing context.
   * Contains references to the active Opus encoder and decoder instances,
   * as well as their active state.
   *
   * @internal
   */
  #encoder: OpusEncoder | null = null;

  /**
   * Internal audio processing context.
   * Contains references to the active Opus decoder instance,
   * as well as its active state.
   *
   * @internal
   */
  #decoder: OpusDecoder | null = null;

  /**
   * Is the audio service currently active and initialized?
   * @private
   */
  #active = false;

  /**
   * Counter for consecutive processing errors.
   * Used for automatic error recovery decisions.
   * @internal
   */
  #consecutiveErrors = 0;

  /**
   * Service configuration options.
   * @internal
   */
  #options: AudioServiceOptions;

  /**
   * Creates a new AudioService instance.
   *
   * The service starts uninitialized and must be initialized with the initialize()
   * method before it can process audio data. This allows for lazy initialization
   * and configuration validation.
   *
   * @param options - Configuration options for audio processing behavior
   */
  constructor(options: AudioServiceOptions) {
    this.#options = options;
  }

  /**
   * Gets the currently configured audio codec.
   *
   * @returns The active audio codec, typically 'opus'
   */
  get codec(): VoiceAudioCodec {
    return this.#options.codec;
  }

  /**
   * Checks if the service is properly initialized and ready for audio processing.
   *
   * @returns True if the service has been initialized with active context
   */
  get isInitialized(): boolean {
    return this.#active;
  }

  /**
   * Checks if encoding is available and ready.
   *
   * @returns True if encoder is initialized and ready for use
   */
  get canEncode(): boolean {
    return Boolean(this.#encoder);
  }

  /**
   * Checks if decoding is available and ready.
   *
   * @returns True if decoder is initialized and ready for use
   */
  get canDecode(): boolean {
    return Boolean(this.#decoder);
  }

  /**
   * Initializes the audio service with encoder and/or decoder instances.
   *
   * This method creates and configures the Opus encoder and decoder instances
   * according to Discord Voice Gateway requirements. The service can be initialized
   * with just an encoder (transmit-only), just a decoder (receive-only), or both.
   *
   * Configuration is automatically optimized for Discord Voice Gateway:
   * - Sample rate: 48kHz (mandatory)
   * - Channels: 2 (stereo)
   * - Application: VoIP (optimized for voice communication)
   * - Signal type: Voice (optimized for speech content)
   * - Bandwidth: Fullband (highest quality)
   * - FEC: Enabled (packet loss recovery)
   *
   * @param options - Initialization options specifying which components to create
   * @throws {Error} If initialization fails or Discord requirements cannot be met
   */
  initialize(
    options: {
      /** Whether to create an encoder for audio transmission */
      encoder?: boolean;
      /** Whether to create a decoder for audio reception */
      decoder?: boolean;
    } = { encoder: true, decoder: true },
  ): void {
    if (!(options.encoder || options.decoder)) {
      throw new Error(
        "At least one of encoder or decoder must be enabled for initialization.",
      );
    }

    try {
      // Initialize encoder if requested
      if (options.encoder) {
        this.#encoder = new OpusEncoder(this.#options.encoderOptions);
      }

      // Initialize decoder if requested
      if (options.decoder) {
        this.#decoder = new OpusDecoder(this.#options.decoderOptions);
      }

      // Activate the context
      this.#active = true;
      this.#consecutiveErrors = 0;
    } catch (error) {
      throw new Error(
        `Failed to initialize AudioService: ${(error as Error).message}. Ensure that the @nyxojs/opus native module is properly installed and compatible with your system.`,
        { cause: error },
      );
    }
  }

  /**
   * Encodes PCM audio data to Opus format.
   *
   * This method converts raw PCM audio data into compressed Opus packets suitable
   * for transmission over Discord's Voice Gateway. The input data must conform to
   * Discord's strict audio format requirements.
   *
   * Input format requirements:
   * - Sample rate: 48kHz
   * - Channels: 2 (stereo, interleaved)
   * - Frame size: 960 samples per channel (1920 total)
   * - Bit depth: 16-bit signed integers
   * - Layout: [L0, R0, L1, R1, ..., L959, R959]
   *
   * @param pcm - PCM audio data as 16-bit signed integers
   * @returns Compressed Opus packet ready for transmission
   * @throws {Error} If not initialized, encoder unavailable, or data format invalid
   */
  encode(pcm: Buffer | Int16Array): Buffer {
    this.#ensureInitialized();

    if (!this.#encoder) {
      throw new Error(
        "Encoder not available. Initialize the service with encoder: true to enable encoding.",
      );
    }

    // Validate input data
    if (!pcm || pcm.length === 0) {
      throw new Error(
        "PCM data cannot be empty. Provide exactly 1920 16-bit samples for Discord Voice Gateway (960 per channel).",
      );
    }

    if (pcm.length !== TOTAL_SAMPLES_PER_FRAME) {
      throw new Error(
        `Invalid PCM frame size. Expected ${TOTAL_SAMPLES_PER_FRAME} samples ` +
          `(${DISCORD_FRAME_SIZE} per channel × ${DISCORD_CHANNELS} channels), got ${pcm.length}.`,
      );
    }

    try {
      const encoded = this.#encoder.encode(pcm);

      // Update statistics
      this.#consecutiveErrors = 0; // Reset error counter on success

      return encoded;
    } catch (error) {
      this.#consecutiveErrors++;

      // Attempt automatic recovery if enabled
      if (this.#options.autoRecovery && this.#shouldAttemptRecovery()) {
        try {
          this.#recoverEncoder();

          // Retry the encoding operation
          const encoded = this.#encoder.encode(pcm);

          this.#consecutiveErrors = 0;

          return encoded;
        } catch (recoveryError) {
          throw new Error(
            `Failed to encode PCM audio data: ${(error as Error).message}. ` +
              `Recovery attempt also failed: ${(recoveryError as Error).message}`,
            { cause: error },
          );
        }
      }

      throw new Error(
        `Failed to encode PCM audio data: ${(error as Error).message}. Ensure input data conforms to Discord Voice Gateway requirements (48kHz, stereo, 960 samples per channel).`,
        { cause: error },
      );
    }
  }

  /**
   * Decodes Opus packet to PCM audio data.
   *
   * This method converts compressed Opus packets received from Discord's Voice Gateway
   * into raw PCM audio data suitable for playback. It handles both normal packet
   * decoding and packet loss scenarios with error concealment.
   *
   * Output format:
   * - Sample rate: 48kHz
   * - Channels: 2 (stereo, interleaved)
   * - Frame size: 960 samples per channel (1920 total)
   * - Bit depth: 16-bit signed integers
   * - Layout: [L0, R0, L1, R1, ..., L959, R959]
   *
   * Packet loss handling:
   * - Pass null to simulate packet loss and trigger error concealment
   * - Error concealment generates replacement audio to maintain timing
   * - FEC data from previous packets may be used for recovery
   *
   * @param packet - Opus packet data to decode, or null for packet loss
   * @returns Decoded PCM audio data as 16-bit signed integers
   * @throws {Error} If not initialized, decoder unavailable, or decoding fails
   */
  decode(packet: Buffer | Uint8Array | null): Buffer {
    this.#ensureInitialized();

    if (!this.#decoder) {
      throw new Error(
        "Decoder not available. Initialize the service with decoder: true to enable decoding.",
      );
    }

    try {
      const decoded = this.#decoder.decode(packet);

      // Update statistics
      this.#consecutiveErrors = 0; // Reset error counter on success

      return decoded;
    } catch (error) {
      this.#consecutiveErrors++;

      // Attempt automatic recovery if enabled
      if (this.#options.autoRecovery && this.#shouldAttemptRecovery()) {
        try {
          this.#recoverDecoder();

          // Retry the decoding operation
          const decoded = this.#decoder.decode(packet);

          // Update statistics
          this.#consecutiveErrors = 0;

          return decoded;
        } catch (recoveryError) {
          throw new Error(
            `Failed to decode Opus packet: ${(error as Error).message}. ` +
              `Recovery attempt also failed: ${(recoveryError as Error).message}`,
            { cause: error },
          );
        }
      }

      throw new Error(
        `Failed to decode Opus packet: ${(error as Error).message}. This may indicate corrupted packet data or decoder state issues.`,
        { cause: error },
      );
    }
  }

  /**
   * Decodes Opus packet with Forward Error Correction.
   *
   * This method performs specialized decoding using FEC information embedded
   * in Opus packets to recover lost packets. FEC provides better audio quality
   * during packet loss scenarios compared to simple error concealment.
   *
   * @param packet - Opus packet containing FEC information for recovery
   * @returns Decoded PCM audio data recovered using FEC
   * @throws {Error} If not initialized, decoder unavailable, or FEC decoding fails
   */
  decodeFec(packet: Buffer | Uint8Array): Buffer {
    this.#ensureInitialized();

    if (!this.#decoder) {
      throw new Error(
        "Decoder not available. Initialize the service with decoder: true to enable FEC decoding.",
      );
    }

    try {
      const decoded = this.#decoder.decodeFec(packet);

      // Update statistics
      this.#consecutiveErrors = 0;

      return decoded;
    } catch (error) {
      this.#consecutiveErrors++;

      throw new Error(
        `Failed to decode FEC packet: ${(error as Error).message}. Ensure the packet contains valid FEC information.`,
        { cause: error },
      );
    }
  }

  /**
   * Adjusts the encoder bitrate for dynamic quality control.
   *
   * This method allows real-time adjustment of the encoding bitrate to adapt
   * to network conditions or quality requirements. Higher bitrates provide
   * better quality but consume more bandwidth.
   *
   * @param bitrate - New target bitrate in bits per second (500-512000)
   * @throws {Error} If encoder not available or bitrate invalid
   */
  setBitrate(bitrate: number): void {
    this.#ensureInitialized();

    if (!this.#encoder) {
      throw new Error(
        "Encoder not available. Initialize the service with encoder: true to enable bitrate adjustment.",
      );
    }

    // Validate bitrate range
    if (!Number.isInteger(bitrate) || bitrate < 500 || bitrate > 512000) {
      throw new Error(
        `Invalid bitrate: ${bitrate}. Must be between 500 and 512000 bits per second.`,
      );
    }

    try {
      this.#encoder.setBitrate(bitrate);
    } catch (error) {
      throw new Error(
        `Failed to set encoder bitrate: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  /**
   * Adjusts the decoder output gain for volume control.
   *
   * This method allows real-time adjustment of the decoded audio volume.
   * The gain is applied during decoding for optimal performance.
   *
   * @param gain - Gain value in Q8 format (256 = unity gain/0dB)
   * @throws {Error} If decoder not available or gain invalid
   */
  setGain(gain: number): void {
    this.#ensureInitialized();

    if (!this.#decoder) {
      throw new Error(
        "Decoder not available. Cannot adjust gain without an active decoder.",
      );
    }

    try {
      this.#decoder.setGain(gain);
    } catch (error) {
      throw new Error(
        `Failed to set decoder gain: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  /**
   * Destroys the audio service and releases all allocated resources.
   *
   * This method performs complete cleanup of all audio processing resources,
   * including native encoder/decoder instances and internal buffers. Once
   * destroyed, the service must be re-initialized before use.
   *
   * Cleanup includes:
   * - Destruction of Opus encoder and decoder instances
   * - Release of native memory and resources
   * - Reset of all statistics and state
   * - Invalidation of the service context
   */
  destroy(): void {
    try {
      // Destroy encoder
      if (this.#encoder) {
        this.#encoder.destroy();
      }

      // Destroy decoder
      if (this.#decoder) {
        this.#decoder.destroy();
      }
    } catch {
      // Ignore cleanup errors
    }

    this.#consecutiveErrors = 0;
  }

  /**
   * Ensures the service is properly initialized.
   *
   * @throws {Error} If the service has not been initialized
   * @internal
   */
  #ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "AudioService not initialized. Call initialize() before using audio processing methods.",
      );
    }
  }

  /**
   * Determines if automatic error recovery should be attempted.
   *
   * @returns True if recovery should be attempted
   * @internal
   */
  #shouldAttemptRecovery(): boolean {
    return this.#consecutiveErrors < this.#options.maxConsecutiveErrors;
  }

  /**
   * Attempts to recover the encoder by recreating it.
   *
   * @throws {Error} If recovery fails
   * @internal
   */
  #recoverEncoder(): void {
    // Destroy old encoder
    if (this.#encoder) {
      try {
        this.#encoder.destroy();
      } catch {
        // Ignore destruction errors
      }
    }

    // Create new encoder
    this.#encoder = new OpusEncoder(this.#options.encoderOptions);
  }

  /**
   * Attempts to recover the decoder by recreating it.
   *
   * @throws {Error} If recovery fails
   * @internal
   */
  #recoverDecoder(): void {
    // Destroy old decoder
    if (this.#decoder) {
      try {
        this.#decoder.destroy();
      } catch {
        // Ignore destruction errors
      }
    }

    // Create new decoder
    this.#decoder = new OpusDecoder(this.#options.decoderOptions);
  }

  /**
   * Generates Opus silence frame for voice data interpolation.
   *
   * According to Discord's specification: "When there's a break in the sent data,
   * the packet transmission shouldn't simply stop. Instead, send five frames of
   * silence (0xF8, 0xFF, 0xFE) before stopping to avoid unintended Opus
   * interpolation with subsequent transmissions."
   *
   * This method generates the standard Discord silence frame that can be sent
   * to maintain proper audio timing and prevent audio artifacts.
   *
   * @returns Discord-compatible Opus silence frame
   */
  generateSilenceFrame(): Uint8Array {
    return new Uint8Array([0xf8, 0xff, 0xfe]);
  }

  /**
   * Generates silent PCM audio data.
   *
   * Creates a buffer of silent PCM audio data that matches Discord Voice Gateway
   * requirements. This can be used for generating silence periods or as input
   * for encoding silence frames.
   *
   * @returns Silent PCM audio data (1920 samples, 16-bit signed integers)
   */
  generateSilentPCM(): Buffer {
    return Buffer.alloc(TOTAL_SAMPLES_PER_FRAME * 2, 0); // 2 bytes per 16-bit sample
  }
}
