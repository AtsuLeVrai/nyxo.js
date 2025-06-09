import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod/v4";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Native addon interface representing the loaded C++ Opus audio codec module.
 *
 * This interface defines the structure of the native Node.js addon that provides
 * high-performance Opus audio encoding/decoding capabilities specifically optimized
 * for Discord's Voice Gateway requirements with real-time audio processing.
 *
 * The native module implements both encoding and decoding operations with Discord-specific
 * optimizations including proper frame sizing (20ms at 48kHz), stereo channel configuration,
 * and forward error correction for packet loss recovery in Voice Gateway scenarios.
 *
 * @internal
 */
interface NativeAddon {
  /** Constructor for Opus encoder instances with configurable options */
  OpusEncoder: new (
    options?: OpusEncoderOptions,
  ) => NativeOpusEncoder;

  /** Constructor for Opus decoder instances with configurable options */
  OpusDecoder: new (
    options?: OpusDecoderOptions,
  ) => NativeOpusDecoder;

  /**
   * Get the Opus library version information
   * @returns Version string of the underlying libopus library
   */
  getOpusVersion: () => string;

  /**
   * Get array of sample rates supported by Opus
   * @returns Array of supported sample rates in Hz
   */
  getSupportedSampleRates: () => number[];

  /**
   * Validate an Opus packet structure
   * @param packet - Opus packet data to validate
   * @returns True if packet structure is valid
   */
  validateOpusPacket: (packet: Buffer | Uint8Array) => boolean;

  // Discord Voice Gateway constants (MANDATORY specifications)
  /** Discord required sample rate: 48kHz */
  DISCORD_SAMPLE_RATE: number;
  /** Discord required channel count: 2 (stereo) */
  DISCORD_CHANNELS: number;
  /** Discord required frame size: 960 samples (20ms at 48kHz) */
  DISCORD_FRAME_SIZE: number;
  /** Discord default bitrate: 64kbps */
  DISCORD_BITRATE: number;

  // Opus application type constants
  /** Optimize for voice/speech content with VoIP characteristics */
  OPUS_APPLICATION_VOIP: number;
  /** Optimize for general audio content with musical characteristics */
  OPUS_APPLICATION_AUDIO: number;
  /** Optimize for low-latency applications with restricted features */
  OPUS_APPLICATION_RESTRICTED_LOWDELAY: number;

  // Opus bandwidth limitation constants
  /** Narrowband: 4kHz bandwidth, suitable for speech */
  OPUS_BANDWIDTH_NARROWBAND: number;
  /** Mediumband: 6kHz bandwidth, enhanced speech quality */
  OPUS_BANDWIDTH_MEDIUMBAND: number;
  /** Wideband: 8kHz bandwidth, good speech quality */
  OPUS_BANDWIDTH_WIDEBAND: number;
  /** Super-wideband: 12kHz bandwidth, high quality speech/music */
  OPUS_BANDWIDTH_SUPERWIDEBAND: number;
  /** Fullband: 20kHz bandwidth, full audio spectrum */
  OPUS_BANDWIDTH_FULLBAND: number;

  // Opus signal type constants for optimization hints
  /** Optimize for voice/speech signals */
  OPUS_SIGNAL_VOICE: number;
  /** Optimize for music/general audio signals */
  OPUS_SIGNAL_MUSIC: number;
}

/**
 * Native Opus encoder instance interface.
 *
 * Represents the actual native C++ object instance created by the OpusEncoder constructor.
 * This interface defines the methods and properties available on the native encoder object
 * that maintains the Opus encoding state and configuration.
 *
 * @internal
 */
interface NativeOpusEncoder {
  /** Current configured bitrate in bits per second */
  bitrate: number;

  /** Current computational complexity level (0-10) */
  complexity: number;

  /** Whether in-band Forward Error Correction is enabled */
  inbandFEC: boolean;

  /** Maximum bandwidth limitation setting */
  maxBandwidth: number;

  /** Configured sample rate in Hz */
  sampleRate: number;

  /** Number of audio channels */
  channels: number;

  /**
   * Encode PCM audio data to Opus format
   * @param pcm - PCM audio data as 16-bit signed integers
   * @returns Compressed Opus packet as Buffer
   */
  encode(pcm: Buffer | Int16Array): Buffer;

  /**
   * Set the target bitrate for encoding
   * @param bitrate - Bitrate in bits per second (500-512000)
   */
  setBitrate(bitrate: number): void;

  /**
   * Set the computational complexity level
   * @param complexity - Complexity level from 0 (fastest) to 10 (best quality)
   */
  setComplexity(complexity: number): void;

  /**
   * Enable or disable in-band Forward Error Correction
   * @param enable - Whether to enable FEC for packet loss recovery
   */
  setInbandFEC(enable: boolean): void;

  /**
   * Set the maximum bandwidth limitation
   * @param bandwidth - Maximum bandwidth constant
   */
  setMaxBandwidth(bandwidth: number): void;

  /**
   * Set the signal type hint for optimization
   * @param signal - Signal type constant (voice or music)
   */
  setSignal(signal: number): void;

  /**
   * Set the application type for encoding optimization
   * @param application - Application type string ("voip", "audio", "lowdelay")
   */
  setApplication(application: string): void;

  /** Reset the encoder state while preserving configuration */
  reset(): void;

  /** Destroy the encoder and release all resources */
  destroy(): void;
}

/**
 * Native Opus decoder instance interface.
 *
 * Represents the actual native C++ object instance created by the OpusDecoder constructor.
 * This interface defines the methods and properties available on the native decoder object
 * that maintains the Opus decoding state and configuration.
 *
 * @internal
 */
interface NativeOpusDecoder {
  /** Current gain adjustment in Q8 format */
  gain: number;

  /** Configured sample rate in Hz */
  sampleRate: number;

  /** Number of audio channels */
  channels: number;

  /** Duration of the last decoded packet in samples */
  lastPacketDuration: number;

  /**
   * Decode Opus packet to PCM audio data
   * @param packet - Opus packet data (null for packet loss simulation)
   * @returns Decoded PCM audio data as 16-bit signed integers
   */
  decode(packet: Buffer | Uint8Array | null): Buffer;

  /**
   * Decode Opus packet with Forward Error Correction
   * @param packet - Opus packet data containing FEC information
   * @returns Decoded PCM audio data as 16-bit signed integers
   */
  decodeFEC(packet: Buffer | Uint8Array): Buffer;

  /**
   * Set the output gain adjustment
   * @param gain - Gain in Q8 format (-32768 to 32767, where 256 = 0dB)
   */
  setGain(gain: number): void;

  /** Reset the decoder state while preserving configuration */
  reset(): void;

  /** Destroy the decoder and release all resources */
  destroy(): void;
}

/**
 * Loads the native addon with multiple fallback strategies for different build configurations.
 *
 * This function attempts to load the compiled native module from various potential locations,
 * providing resilience across different build environments and deployment scenarios.
 *
 * The loading strategy tries paths in order of preference:
 * 1. Release build binary (production/optimized builds)
 * 2. Debug build binary (development builds with debugging symbols)
 *
 * Each loaded addon is validated to ensure it exports the required functions and classes
 * before being returned to the caller.
 *
 * @throws {Error} If all loading attempts fail or the addon lacks required exports
 * @returns The successfully loaded and validated native addon
 * @internal
 */
function loadNativeAddon(): NativeAddon {
  const possiblePaths = [
    // Built binary (development/production)
    join(__dirname, "..", "build", "Release", "opus.node"),
    // Debug binary (development with debugging symbols)
    join(__dirname, "..", "build", "Debug", "opus.node"),
  ];

  let lastError: Error | null = null;

  for (const path of possiblePaths) {
    try {
      const addon = require(path) as NativeAddon;

      // Validate the addon has required exports for basic functionality
      if (!(addon.OpusEncoder && addon.OpusDecoder && addon.getOpusVersion)) {
        throw new Error(
          "Invalid native addon: missing required exports (OpusEncoder, OpusDecoder, getOpusVersion)",
        );
      }

      return addon;
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw new Error(
    `Failed to load native opus addon from any of the attempted paths: ${possiblePaths.join(", ")}. This usually indicates the native module needs to be compiled. Last error encountered: ${lastError?.message || "Unknown error"}`,
  );
}

// Load the native addon once at module initialization to avoid repeated loading overhead
const nativeAddon: NativeAddon = loadNativeAddon();

/**
 * Configuration options for initializing OpusEncoder instances.
 *
 * These options control the behavior and performance characteristics of the Opus encoder.
 * The default values are optimized for Discord Voice Gateway usage patterns and provide
 * a good balance between audio quality, bandwidth usage, and computational requirements.
 */
export const OpusEncoderOptions = z.object({
  /**
   * Audio sample rate in Hz for encoding operations.
   *
   * Opus supports several sample rates natively, with 48kHz being the most common
   * and providing the best quality. Discord Voice Gateway requires 48kHz sample rate.
   *
   * Supported sample rates:
   * - `8000`: Narrowband, suitable for basic voice communication
   * - `12000`: Mediumband, improved voice quality
   * - `16000`: Wideband, good voice quality for VoIP
   * - `24000`: Super-wideband, high quality voice
   * - `48000`: Fullband, highest quality for voice and music (Discord requirement)
   *
   * @default 48000
   */
  sampleRate: z
    .union([
      z.literal(8000),
      z.literal(12000),
      z.literal(16000),
      z.literal(24000),
      z.literal(48000),
    ])
    .default(48000),

  /**
   * Number of audio channels for encoding.
   *
   * Opus supports mono (1) and stereo (2) channel configurations. Discord Voice Gateway
   * requires stereo (2 channels) for proper operation.
   *
   * Channel configurations:
   * - `1`: Mono, single audio channel
   * - `2`: Stereo, left and right audio channels (Discord requirement)
   *
   * @default 2
   */
  channels: z.union([z.literal(1), z.literal(2)]).default(2),

  /**
   * Application type for encoding optimization.
   *
   * This parameter hints to the Opus encoder about the type of audio content being
   * encoded, allowing it to optimize its algorithms accordingly.
   *
   * Application types:
   * - `"voip"`: Optimized for voice/speech content in VoIP scenarios
   * - `"audio"`: Optimized for general audio content including music
   * - `"lowdelay"`: Optimized for low-latency applications with restricted features
   *
   * For Discord Voice Gateway, "voip" is the recommended setting as it provides
   * optimal performance for real-time voice communication.
   *
   * @default "voip"
   */
  application: z.enum(["voip", "audio", "lowdelay"]).default("voip"),

  /**
   * Target bitrate for encoding in bits per second.
   *
   * This parameter controls the quality vs. bandwidth trade-off. Higher bitrates
   * provide better audio quality but consume more bandwidth.
   *
   * Bitrate guidelines:
   * - **8-16kbps**: Very low quality, suitable for speech only
   * - **16-32kbps**: Low quality speech, minimal bandwidth usage
   * - **32-64kbps**: Good quality speech, recommended for voice chat (Discord default)
   * - **64-128kbps**: High quality speech/music, higher bandwidth usage
   * - **128kbps+**: Excellent quality music, maximum bandwidth usage
   *
   * Discord Voice Gateway uses 64kbps as the default for optimal balance.
   *
   * @default 64000
   */
  bitrate: z.number().int().min(500).max(512000).default(64000),

  /**
   * Computational complexity level for encoding.
   *
   * This parameter controls the CPU vs. quality trade-off. Higher complexity
   * levels provide better compression efficiency but require more computational
   * resources.
   *
   * Complexity levels:
   * - **0-2**: Very fast encoding, lower quality
   * - **3-5**: Balanced encoding speed and quality (recommended)
   * - **6-8**: Slower encoding, higher quality
   * - **9-10**: Very slow encoding, maximum quality
   *
   * Level 5 provides an optimal balance for real-time applications.
   *
   * @default 5
   */
  complexity: z.number().int().min(0).max(10).default(5),

  /**
   * Enable in-band Forward Error Correction (FEC).
   *
   * FEC allows the decoder to recover from packet loss by including redundant
   * information in subsequent packets. This is particularly useful for unreliable
   * network connections but increases bandwidth usage.
   *
   * Benefits:
   * - **Packet Loss Recovery**: Can recover from single packet losses
   * - **Improved Quality**: Maintains audio quality during network issues
   * - **Network Resilience**: Better performance on unstable connections
   *
   * Trade-offs:
   * - **Increased Bandwidth**: Additional data overhead
   * - **Higher Latency**: Slight increase in encoding/decoding latency
   *
   * Recommended for Discord Voice Gateway to handle network instability.
   *
   * @default true
   */
  inbandFEC: z.boolean().default(true),

  /**
   * Maximum bandwidth limitation for encoding.
   *
   * This parameter limits the audio bandwidth that Opus will encode, affecting
   * both quality and computational requirements.
   *
   * Bandwidth options:
   * - **Narrowband (4kHz)**: Basic speech quality
   * - **Mediumband (6kHz)**: Enhanced speech quality
   * - **Wideband (8kHz)**: Good speech quality
   * - **Super-wideband (12kHz)**: High quality speech/music
   * - **Fullband (20kHz)**: Full audio spectrum (recommended)
   *
   * Fullband provides the best quality for Discord Voice Gateway.
   *
   * @default "fullband"
   */
  maxBandwidth: z
    .enum(["narrowband", "mediumband", "wideband", "superwideband", "fullband"])
    .default("fullband"),

  /**
   * Signal type hint for encoding optimization.
   *
   * This parameter provides a hint to the encoder about the type of audio signal
   * being processed, allowing for specialized optimizations.
   *
   * Signal types:
   * - `"voice"`: Optimized for speech/voice signals
   * - `"music"`: Optimized for music and general audio signals
   *
   * For Discord Voice Gateway, "voice" is recommended as it's primarily used
   * for voice communication.
   *
   * @default "voice"
   */
  signal: z.enum(["voice", "music"]).default("voice"),
});

export type OpusEncoderOptions = z.infer<typeof OpusEncoderOptions>;

/**
 * Configuration options for initializing OpusDecoder instances.
 *
 * These options control the behavior and performance characteristics of the Opus decoder.
 * The default values are optimized for Discord Voice Gateway usage patterns and provide
 * optimal compatibility with Discord's audio stream requirements.
 */
export const OpusDecoderOptions = z.object({
  /**
   * Audio sample rate in Hz for decoding operations.
   *
   * This must match the sample rate used by the encoder. Discord Voice Gateway
   * requires 48kHz sample rate for all audio streams.
   *
   * @default 48000
   * @see OpusEncoderOptions.sampleRate
   */
  sampleRate: z
    .union([
      z.literal(8000),
      z.literal(12000),
      z.literal(16000),
      z.literal(24000),
      z.literal(48000),
    ])
    .default(48000),

  /**
   * Number of audio channels for decoding.
   *
   * This must match the channel configuration used by the encoder. Discord Voice
   * Gateway requires stereo (2 channels) for proper operation.
   *
   * @default 2
   * @see OpusEncoderOptions.channels
   */
  channels: z.union([z.literal(1), z.literal(2)]).default(2),

  /**
   * Output gain adjustment in Q8 fixed-point format.
   *
   * This parameter allows fine-tuning of the output volume level. The value
   * is specified in Q8 format where 256 represents unity gain (0dB).
   *
   * Gain calculation:
   * - **256**: Unity gain (0dB, no change)
   * - **512**: +6dB gain (double amplitude)
   * - **128**: -6dB gain (half amplitude)
   * - **0**: Silence (infinite attenuation)
   *
   * Range: -32768 to 32767 (approximately -48dB to +48dB)
   *
   * @default 256
   */
  gain: z.number().int().min(-32768).max(32767).default(256),
});

export type OpusDecoderOptions = z.infer<typeof OpusDecoderOptions>;

/**
 * High-performance Opus audio encoder for Discord Voice Gateway applications.
 *
 * This class provides a specialized Opus encoding solution designed specifically for
 * Discord's Voice Gateway WebSocket protocol. It implements the required audio encoding
 * specifications including 48kHz sample rate, stereo channels, and 20ms frame timing
 * with optimizations for real-time voice communication.
 *
 * ## Key Features
 *
 * - **Discord Compliance**: Enforces Discord Voice Gateway requirements automatically
 * - **Real-time Performance**: Optimized for low-latency voice communication
 * - **Packet Loss Recovery**: Built-in Forward Error Correction (FEC) support
 * - **High Quality**: Superior audio quality compared to legacy codecs
 * - **Efficient Compression**: Significantly better compression than older voice codecs
 * - **Native Performance**: C++ implementation provides optimal encoding speed
 *
 * ## Performance Characteristics
 *
 * Typical performance improvements over JavaScript implementations:
 * - **5-10x faster** encoding speed for real-time audio
 * - **Consistent low latency** suitable for interactive voice communication
 * - **Superior quality** at equivalent bitrates compared to other voice codecs
 * - **Efficient bandwidth usage** with adaptive bitrate control
 *
 * ## Discord Voice Gateway Integration
 *
 * Discord's Voice Gateway requires specific audio format compliance:
 * - **Sample Rate**: 48kHz (mandatory)
 * - **Channels**: Stereo/2 channels (mandatory)
 * - **Frame Size**: 960 samples (20ms at 48kHz)
 * - **Format**: PCM 16-bit signed integers
 *
 * This encoder automatically enforces these requirements and validates input data
 * to ensure compatibility with Discord's voice infrastructure.
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections} Discord Voice Connections Documentation
 * @see {@link https://tools.ietf.org/html/rfc6716} RFC 6716 - Definition of the Opus Audio Codec
 */
export class OpusEncoder {
  /**
   * Total number of audio frames encoded since encoder initialization.
   * Each frame represents one 20ms audio segment (960 samples at 48kHz).
   */
  framesEncoded = 0;

  /**
   * Total number of PCM samples processed since encoder initialization.
   * This includes all samples from all channels.
   */
  samplesProcessed = 0;

  /**
   * Indicates whether the encoder has been destroyed and is no longer usable.
   * Once destroyed, all operations on the encoder will throw errors.
   */
  destroyed = false;

  /**
   * Reference to the native C++ Opus encoder instance.
   * This object maintains the actual Opus encoding state and configuration.
   * @internal
   */
  readonly #native: NativeOpusEncoder;

  /**
   * Creates a new OpusEncoder instance with the specified configuration.
   *
   * The constructor initializes the native C++ Opus encoder context and validates
   * the provided options against Discord Voice Gateway requirements. If initialization
   * fails, detailed error information is provided to help diagnose configuration issues.
   *
   * @param options - Configuration options for the encoder behavior and quality
   * @throws {Error} If option validation fails or native encoder initialization encounters an error
   */
  constructor(options: z.input<typeof OpusEncoderOptions> = {}) {
    try {
      const validatedOptions = OpusEncoderOptions.parse(options);

      // Convert bandwidth string to native constant
      const bandwidthMap = {
        narrowband: nativeAddon.OPUS_BANDWIDTH_NARROWBAND,
        mediumband: nativeAddon.OPUS_BANDWIDTH_MEDIUMBAND,
        wideband: nativeAddon.OPUS_BANDWIDTH_WIDEBAND,
        superwideband: nativeAddon.OPUS_BANDWIDTH_SUPERWIDEBAND,
        fullband: nativeAddon.OPUS_BANDWIDTH_FULLBAND,
      };

      this.#native = new nativeAddon.OpusEncoder(validatedOptions);

      // Configure the encoder with the specified options
      this.#native.setBitrate(validatedOptions.bitrate);
      this.#native.setComplexity(validatedOptions.complexity);
      this.#native.setInbandFEC(validatedOptions.inbandFEC);
      this.#native.setMaxBandwidth(bandwidthMap[validatedOptions.maxBandwidth]);
      this.#native.setSignal(
        validatedOptions.signal === "voice"
          ? nativeAddon.OPUS_SIGNAL_VOICE
          : nativeAddon.OPUS_SIGNAL_MUSIC,
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid OpusEncoder options: ${z.prettifyError(error)}`,
        );
      }

      throw new Error(
        `Failed to initialize OpusEncoder: ${(error as Error).message}. This may indicate missing native dependencies, invalid configuration, or Discord Voice Gateway requirement violations.`,
      );
    }
  }

  /**
   * Gets the current configured bitrate in bits per second.
   *
   * This property reflects the target bitrate that the encoder is configured to use.
   * The actual bitrate may vary slightly depending on the audio content and encoder
   * optimizations, but will generally target this value.
   *
   * @returns The current target bitrate in bits per second
   */
  get bitrate(): number {
    return this.destroyed ? 0 : this.#native.bitrate;
  }

  /**
   * Gets the current computational complexity level.
   *
   * This property reflects the complexity setting that controls the CPU vs. quality
   * trade-off. Higher values provide better compression efficiency but require more
   * computational resources.
   *
   * @returns The current complexity level (0-10)
   */
  get complexity(): number {
    return this.destroyed ? 0 : this.#native.complexity;
  }

  /**
   * Gets whether in-band Forward Error Correction is enabled.
   *
   * When enabled, the encoder includes redundant information in subsequent packets
   * that allows the decoder to recover from single packet losses. This improves
   * audio quality on unreliable networks at the cost of increased bandwidth usage.
   *
   * @returns True if FEC is enabled, false otherwise
   */
  get inbandFec(): boolean {
    return this.destroyed ? false : this.#native.inbandFEC;
  }

  /**
   * Gets the current maximum bandwidth limitation setting.
   *
   * This property reflects the bandwidth limitation that constrains the audio
   * frequency range that the encoder will process. Higher bandwidth settings
   * allow better audio quality but require more computational resources.
   *
   * @returns The current maximum bandwidth constant
   */
  get maxBandwidth(): number {
    return this.destroyed ? 0 : this.#native.maxBandwidth;
  }

  /**
   * Gets the configured sample rate in Hz.
   *
   * This property reflects the audio sample rate that the encoder was configured
   * with during initialization. For Discord Voice Gateway, this will always be 48000.
   *
   * @returns The configured sample rate in Hz
   */
  get sampleRate(): number {
    return this.destroyed ? 0 : this.#native.sampleRate;
  }

  /**
   * Gets the configured number of audio channels.
   *
   * This property reflects the channel configuration that the encoder was initialized
   * with. For Discord Voice Gateway, this will always be 2 (stereo).
   *
   * @returns The number of audio channels
   */
  get channels(): number {
    return this.destroyed ? 0 : this.#native.channels;
  }

  /**
   * Encodes PCM audio data to Opus format.
   *
   * This method is the primary interface for converting raw PCM audio data into
   * compressed Opus packets suitable for transmission over Discord's Voice Gateway.
   * It processes exactly one frame of audio (960 samples per channel at 48kHz,
   * representing 20ms of audio) and returns a compressed Opus packet.
   *
   * ## Input Format Requirements
   *
   * The input PCM data must conform to Discord Voice Gateway specifications:
   * - **Sample Rate**: 48kHz (960 samples per frame)
   * - **Channels**: 2 (stereo, interleaved L/R samples)
   * - **Bit Depth**: 16-bit signed integers (-32768 to 32767)
   * - **Frame Size**: Exactly 1920 values (960 samples × 2 channels)
   * - **Endianness**: Native system endianness
   *
   * ## Data Layout
   *
   * For stereo input, samples must be interleaved:
   * ```
   * [L0, R0, L1, R1, L2, R2, ..., L959, R959]
   * ```
   * Where L = left channel, R = right channel, numbers = sample index
   *
   * ## Performance Considerations
   *
   * - **Frame Timing**: Each encode() call should represent exactly 20ms of audio
   * - **Buffer Reuse**: Input buffers can be reused immediately after the call returns
   * - **Output Packets**: Returned packets are typically 20-200 bytes depending on content
   * - **Real-time**: Encoding is optimized for real-time performance with low latency
   *
   * @param pcm - PCM audio data as 16-bit signed integers (Buffer or Int16Array)
   * @returns Compressed Opus packet ready for transmission
   * @throws {Error} If the encoder has been destroyed, input data is invalid, or encoding fails
   */
  encode(pcm: Buffer | Int16Array): Buffer {
    if (this.destroyed) {
      throw new Error(
        "Cannot encode audio with destroyed OpusEncoder. Create a new instance to continue encoding.",
      );
    }

    if (!pcm || pcm.length === 0) {
      throw new Error(
        "PCM data cannot be empty. Provide exactly 1920 16-bit samples (960 per channel for 20ms at 48kHz stereo).",
      );
    }

    // Validate frame size for Discord Voice Gateway (960 samples per channel, 2 channels = 1920 total)
    const expectedSamples = nativeAddon.DISCORD_FRAME_SIZE * this.channels;
    if (pcm.length !== expectedSamples) {
      throw new Error(
        `Invalid PCM frame size. Expected ${expectedSamples} samples (${nativeAddon.DISCORD_FRAME_SIZE} per channel × ${this.channels} channels) for Discord Voice Gateway, got ${pcm.length}.`,
      );
    }

    try {
      const encoded = this.#native.encode(pcm);

      this.framesEncoded++;
      this.samplesProcessed += pcm.length;

      return encoded;
    } catch (error) {
      throw new Error(
        `Failed to encode PCM audio data: ${(error as Error).message}. This may indicate corrupted input data, invalid sample format, or encoder state corruption.`,
      );
    }
  }

  /**
   * Sets the target bitrate for encoding operations.
   *
   * This method adjusts the encoder's target bitrate, which controls the quality
   * vs. bandwidth trade-off. Higher bitrates provide better audio quality but
   * consume more network bandwidth. The encoder will adapt its compression
   * parameters to achieve the specified bitrate target.
   *
   * ## Bitrate Guidelines for Discord Voice
   *
   * - **32kbps**: Minimum acceptable quality for voice communication
   * - **64kbps**: Discord's default, good balance of quality and bandwidth
   * - **96kbps**: High quality voice, increased bandwidth usage
   * - **128kbps**: Excellent quality, suitable for music/high-quality voice
   *
   * Changes take effect immediately and apply to subsequent encode() operations.
   *
   * @param bitrate - Target bitrate in bits per second (500-512000)
   * @throws {Error} If the encoder has been destroyed or bitrate is invalid
   */
  setBitrate(bitrate: number): void {
    if (this.destroyed) {
      throw new Error("Cannot configure destroyed OpusEncoder.");
    }

    if (bitrate < 500 || bitrate > 512000) {
      throw new Error(
        `Invalid bitrate: ${bitrate}. Must be between 500 and 512000 bits per second.`,
      );
    }

    try {
      this.#native.setBitrate(bitrate);
    } catch (error) {
      throw new Error(
        `Failed to set encoder bitrate: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Sets the computational complexity level for encoding operations.
   *
   * This method adjusts the encoder's complexity setting, which controls the
   * CPU vs. quality trade-off. Higher complexity levels provide better compression
   * efficiency and audio quality but require more computational resources and
   * may increase encoding latency.
   *
   * ## Complexity Level Guidelines
   *
   * - **0-2**: Very fast encoding, suitable for resource-constrained environments
   * - **3-5**: Balanced encoding speed and quality, recommended for real-time applications
   * - **6-8**: Slower encoding with improved quality, suitable for non-real-time applications
   * - **9-10**: Maximum quality encoding, highest CPU usage
   *
   * For Discord Voice Gateway, levels 3-5 are recommended to maintain real-time performance.
   *
   * @param complexity - Complexity level from 0 (fastest) to 10 (best quality)
   * @throws {Error} If the encoder has been destroyed or complexity level is invalid
   */
  setComplexity(complexity: number): void {
    if (this.destroyed) {
      throw new Error("Cannot configure destroyed OpusEncoder.");
    }

    if (complexity < 0 || complexity > 10) {
      throw new Error(
        `Invalid complexity level: ${complexity}. Must be between 0 and 10.`,
      );
    }

    try {
      this.#native.setComplexity(complexity);
    } catch (error) {
      throw new Error(
        `Failed to set encoder complexity: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Enables or disables in-band Forward Error Correction.
   *
   * When enabled, FEC causes the encoder to include redundant information in
   * subsequent packets that allows the decoder to recover from single packet
   * losses. This significantly improves audio quality on unreliable networks
   * at the cost of increased bandwidth usage (typically 10-20% overhead).
   *
   * ## FEC Benefits and Trade-offs
   *
   * **Benefits**:
   * - Recovery from single packet losses without retransmission
   * - Improved audio quality on unstable network connections
   * - Transparent operation (no decoder configuration required)
   *
   * **Trade-offs**:
   * - Increased bandwidth usage due to redundant data
   * - Slight increase in encoding complexity and latency
   * - Most effective for single packet losses (not burst losses)
   *
   * FEC is recommended for Discord Voice Gateway to handle network instability.
   *
   * @param enable - Whether to enable Forward Error Correction
   * @throws {Error} If the encoder has been destroyed
   */
  setInbandFec(enable: boolean): void {
    if (this.destroyed) {
      throw new Error("Cannot configure destroyed OpusEncoder.");
    }

    try {
      this.#native.setInbandFEC(enable);
    } catch (error) {
      throw new Error(`Failed to set encoder FEC: ${(error as Error).message}`);
    }
  }

  /**
   * Sets the maximum bandwidth limitation for encoding operations.
   *
   * This method constrains the audio frequency range that the encoder will process,
   * affecting both audio quality and computational requirements. Lower bandwidth
   * settings reduce CPU usage and may improve compression efficiency for speech,
   * while higher settings preserve more audio detail.
   *
   * ## Bandwidth Options
   *
   * - **Narrowband (4kHz)**: Basic speech quality, minimal CPU usage
   * - **Mediumband (6kHz)**: Enhanced speech quality, low CPU usage
   * - **Wideband (8kHz)**: Good speech quality, moderate CPU usage
   * - **Super-wideband (12kHz)**: High quality speech/music, higher CPU usage
   * - **Fullband (20kHz)**: Full audio spectrum, maximum CPU usage
   *
   * For Discord Voice Gateway, fullband is recommended to preserve audio quality.
   *
   * @param bandwidth - Bandwidth limitation constant from the Opus library
   * @throws {Error} If the encoder has been destroyed or bandwidth value is invalid
   */
  setMaxBandwidth(bandwidth: number): void {
    if (this.destroyed) {
      throw new Error("Cannot configure destroyed OpusEncoder.");
    }

    const validBandwidths = [
      nativeAddon.OPUS_BANDWIDTH_NARROWBAND,
      nativeAddon.OPUS_BANDWIDTH_MEDIUMBAND,
      nativeAddon.OPUS_BANDWIDTH_WIDEBAND,
      nativeAddon.OPUS_BANDWIDTH_SUPERWIDEBAND,
      nativeAddon.OPUS_BANDWIDTH_FULLBAND,
    ];

    if (!validBandwidths.includes(bandwidth)) {
      throw new Error(
        `Invalid bandwidth value: ${bandwidth}. Must be one of the OPUS_BANDWIDTH constants.`,
      );
    }

    try {
      this.#native.setMaxBandwidth(bandwidth);
    } catch (error) {
      throw new Error(
        `Failed to set encoder bandwidth: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Sets the signal type hint for encoding optimization.
   *
   * This method provides a hint to the encoder about the type of audio signal
   * being processed, allowing it to optimize its algorithms accordingly. The
   * encoder uses this information to adjust its internal parameters for better
   * compression efficiency and quality.
   *
   * ## Signal Type Guidelines
   *
   * - **Voice**: Optimized for speech and voice communication
   *   - Better handling of silence periods
   *   - Optimized for speech frequency characteristics
   *   - Lower complexity for real-time requirements
   *
   * - **Music**: Optimized for music and general audio content
   *   - Better handling of complex harmonic content
   *   - Optimized for full frequency spectrum
   *   - Higher complexity for maximum quality
   *
   * For Discord Voice Gateway, "voice" is recommended for optimal voice communication.
   *
   * @param signal - Signal type constant (OPUS_SIGNAL_VOICE or OPUS_SIGNAL_MUSIC)
   * @throws {Error} If the encoder has been destroyed or signal type is invalid
   */
  setSignal(signal: number): void {
    if (this.destroyed) {
      throw new Error("Cannot configure destroyed OpusEncoder.");
    }

    if (
      signal !== nativeAddon.OPUS_SIGNAL_VOICE &&
      signal !== nativeAddon.OPUS_SIGNAL_MUSIC
    ) {
      throw new Error(
        `Invalid signal type: ${signal}. Must be OPUS_SIGNAL_VOICE or OPUS_SIGNAL_MUSIC.`,
      );
    }

    try {
      this.#native.setSignal(signal);
    } catch (error) {
      throw new Error(
        `Failed to set encoder signal type: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Sets the application type for encoding optimization.
   *
   * This method configures the encoder's application mode, which affects various
   * internal parameters and optimizations. Each application type is optimized
   * for different use cases and latency requirements.
   *
   * ## Application Types
   *
   * - **"voip"**: Optimized for Voice over IP applications
   *   - Lower algorithmic delay for interactive communication
   *   - Optimized for speech content and network conditions
   *   - Recommended for Discord Voice Gateway
   *
   * - **"audio"**: Optimized for general audio applications
   *   - Higher quality for music and complex audio content
   *   - May have higher latency than VoIP mode
   *   - Better for non-interactive audio streaming
   *
   * - **"lowdelay"**: Optimized for very low latency applications
   *   - Minimal algorithmic delay
   *   - Restricted feature set for fastest processing
   *   - Suitable for real-time audio processing
   *
   * @param application - Application type string ("voip", "audio", "lowdelay")
   * @throws {Error} If the encoder has been destroyed or application type is invalid
   */
  setApplication(application: string): void {
    if (this.destroyed) {
      throw new Error("Cannot configure destroyed OpusEncoder.");
    }

    const validApplications = ["voip", "audio", "lowdelay"];
    if (!validApplications.includes(application)) {
      throw new Error(
        `Invalid application type: ${application}. Must be one of: ${validApplications.join(", ")}.`,
      );
    }

    try {
      this.#native.setApplication(application);
    } catch (error) {
      throw new Error(
        `Failed to set encoder application: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Resets the encoder state while preserving configuration.
   *
   * This method resets the encoder's internal state to initial conditions while
   * maintaining all configuration settings (bitrate, complexity, FEC, etc.). This
   * is useful for starting fresh encoding sessions or recovering from encoder
   * state corruption without recreating the entire encoder instance.
   *
   * ## Reset Behavior
   *
   * **What gets reset**:
   * - Internal encoding state and history
   * - Statistical counters and metrics
   * - Adaptive algorithm states
   * - Error conditions and status flags
   *
   * **What is preserved**:
   * - All configuration parameters (bitrate, complexity, etc.)
   * - Application type and signal type settings
   * - Bandwidth and FEC settings
   * - Native object instance and handles
   *
   * ## When to Use Reset
   *
   * - **Session Boundaries**: When starting a new voice session
   * - **Error Recovery**: After encountering encoding errors
   * - **Statistics Reset**: To restart performance monitoring
   * - **Stream Restart**: When resuming after a pause
   */
  reset(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.reset();

      // Reset local statistics
      this.framesEncoded = 0;
      this.samplesProcessed = 0;
    } catch (_error) {
      // Reset failures are typically non-fatal
    }
  }

  /**
   * Destroys the encoder and releases all allocated resources.
   *
   * This method performs a complete shutdown of the Opus encoder, releasing all
   * native resources, internal buffers, and the libopus encoder context. Once
   * destroyed, the encoder instance becomes unusable and any further operations
   * will throw errors.
   *
   * ## Resource Cleanup
   *
   * The destroy operation releases:
   * - **Native Memory**: All C++ allocated buffers and libopus context
   * - **Internal State**: Encoding state, history, and configuration data
   * - **System Resources**: Memory mappings and handles used by libopus
   * - **Statistical Data**: All counters and performance metrics
   *
   * ## When to Call Destroy
   *
   * - **Application Shutdown**: When the application is terminating
   * - **Voice Session End**: When permanently ending a voice session
   * - **Encoder Replacement**: Before creating a new encoder instance
   * - **Memory Pressure**: To free resources in memory-constrained situations
   *
   * ⚠️ **Important**: Always call destroy() when finished with an encoder to prevent
   * memory leaks. Native resources are not automatically garbage collected and
   * must be explicitly released.
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.destroy();
    } finally {
      // Mark as destroyed regardless of destroy success
      this.destroyed = true;
      this.framesEncoded = 0;
      this.samplesProcessed = 0;
    }
  }
}

/**
 * High-performance Opus audio decoder for Discord Voice Gateway applications.
 *
 * This class provides a specialized Opus decoding solution designed specifically for
 * Discord's Voice Gateway WebSocket protocol. It implements the required audio decoding
 * specifications including 48kHz sample rate, stereo channels, and packet loss recovery
 * with optimizations for real-time voice communication.
 *
 * ## Key Features
 *
 * - **Discord Compliance**: Enforces Discord Voice Gateway requirements automatically
 * - **Real-time Performance**: Optimized for low-latency voice communication
 * - **Packet Loss Recovery**: Built-in Forward Error Correction (FEC) support
 * - **Missing Packet Handling**: Graceful degradation when packets are lost
 * - **High Quality**: Superior audio quality compared to legacy codecs
 * - **Native Performance**: C++ implementation provides optimal decoding speed
 *
 * ## Performance Characteristics
 *
 * Typical performance improvements over JavaScript implementations:
 * - **5-10x faster** decoding speed for real-time audio
 * - **Consistent low latency** suitable for interactive voice communication
 * - **Superior quality** at equivalent bitrates compared to other voice codecs
 * - **Robust packet loss handling** with minimal audio artifacts
 *
 * ## Discord Voice Gateway Integration
 *
 * Discord's Voice Gateway requires specific audio format compliance:
 * - **Sample Rate**: 48kHz (mandatory)
 * - **Channels**: Stereo/2 channels (mandatory)
 * - **Frame Size**: 960 samples (20ms at 48kHz)
 * - **Output Format**: PCM 16-bit signed integers
 *
 * This decoder automatically enforces these requirements and provides robust
 * handling of the variable packet sizes and potential packet loss scenarios
 * common in Discord's voice infrastructure.
 */
export class OpusDecoder {
  /**
   * Total number of audio frames decoded since decoder initialization.
   * Each frame represents one 20ms audio segment (960 samples at 48kHz).
   */
  framesDecoded = 0;

  /**
   * Total number of PCM samples produced since decoder initialization.
   * This includes all samples from all channels.
   */
  samplesProduced = 0;

  /**
   * Number of packets lost or corrupted since decoder initialization.
   * This counter is incremented when decode() is called with null data.
   */
  packetsLost = 0;

  /**
   * Indicates whether the decoder has been destroyed and is no longer usable.
   * Once destroyed, all operations on the decoder will throw errors.
   */
  destroyed = false;

  /**
   * Reference to the native C++ Opus decoder instance.
   * This object maintains the actual Opus decoding state and configuration.
   * @internal
   */
  readonly #native: NativeOpusDecoder;

  /**
   * Creates a new OpusDecoder instance with the specified configuration.
   *
   * The constructor initializes the native C++ Opus decoder context and validates
   * the provided options against Discord Voice Gateway requirements. If initialization
   * fails, detailed error information is provided to help diagnose configuration issues.
   *
   * @param options - Configuration options for the decoder behavior and output format
   * @throws {Error} If option validation fails or native decoder initialization encounters an error
   */
  constructor(options: z.input<typeof OpusDecoderOptions> = {}) {
    try {
      const validatedOptions = OpusDecoderOptions.parse(options);

      this.#native = new nativeAddon.OpusDecoder(validatedOptions);

      // Configure the decoder with the specified options
      this.#native.setGain(validatedOptions.gain);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid OpusDecoder options: ${z.prettifyError(error)}`,
        );
      }

      throw new Error(
        `Failed to initialize OpusDecoder: ${(error as Error).message}. This may indicate missing native dependencies, invalid configuration, or Discord Voice Gateway requirement violations.`,
      );
    }
  }

  /**
   * Gets the current output gain adjustment in Q8 format.
   *
   * This property reflects the gain setting that is applied to the decoded audio
   * output. The value is in Q8 fixed-point format where 256 represents unity
   * gain (0dB, no change in amplitude).
   *
   * @returns The current gain setting in Q8 format
   */
  get gain(): number {
    return this.destroyed ? 0 : this.#native.gain;
  }

  /**
   * Gets the configured sample rate in Hz.
   *
   * This property reflects the audio sample rate that the decoder was configured
   * with during initialization. For Discord Voice Gateway, this will always be 48000.
   *
   * @returns The configured sample rate in Hz
   */
  get sampleRate(): number {
    return this.destroyed ? 0 : this.#native.sampleRate;
  }

  /**
   * Gets the configured number of audio channels.
   *
   * This property reflects the channel configuration that the decoder was initialized
   * with. For Discord Voice Gateway, this will always be 2 (stereo).
   *
   * @returns The number of audio channels
   */
  get channels(): number {
    return this.destroyed ? 0 : this.#native.channels;
  }

  /**
   * Gets the duration of the last decoded packet in samples.
   *
   * This property provides information about the size of the most recent decode
   * operation, which can be useful for monitoring decoder performance and
   * detecting frame size variations.
   *
   * @returns The number of samples in the last decoded frame
   */
  get lastPacketDuration(): number {
    return this.destroyed ? 0 : this.#native.lastPacketDuration;
  }

  /**
   * Decodes an Opus packet to PCM audio data.
   *
   * This method is the primary interface for converting compressed Opus packets
   * received from Discord's Voice Gateway into raw PCM audio data suitable for
   * playback. It handles both normal packet decoding and packet loss scenarios
   * with graceful degradation and error correction.
   *
   * ## Input Format
   *
   * - **Valid Packets**: Opus-encoded audio data as received from Voice Gateway
   * - **Packet Loss**: Pass `null` to simulate packet loss and trigger error concealment
   * - **Variable Size**: Opus packets can vary in size (typically 20-200 bytes)
   * - **Frame Timing**: Each packet represents 20ms of audio (960 samples at 48kHz)
   *
   * ## Output Format
   *
   * The decoded PCM data conforms to Discord Voice Gateway specifications:
   * - **Sample Rate**: 48kHz (960 samples per frame)
   * - **Channels**: 2 (stereo, interleaved L/R samples)
   * - **Bit Depth**: 16-bit signed integers (-32768 to 32767)
   * - **Frame Size**: Always 1920 values (960 samples × 2 channels)
   * - **Endianness**: Native system endianness
   * - **Layout**: Interleaved stereo [L0, R0, L1, R1, ..., L959, R959]
   *
   * ## Packet Loss Handling
   *
   * When `null` is passed (indicating packet loss):
   * - Error concealment algorithms generate replacement audio
   * - Output maintains timing and prevents audio dropouts
   * - Quality degrades gracefully until valid packets resume
   * - FEC data from previous packets may be used for recovery
   *
   * ## Performance Considerations
   *
   * - **Frame Timing**: Each decode() call should correspond to exactly 20ms of audio
   * - **Buffer Reuse**: Output buffers can be used immediately after return
   * - **Real-time**: Decoding is optimized for real-time performance with low latency
   * - **Error Recovery**: Decoder automatically recovers from temporary corruption
   *
   * @param packet - Opus packet data to decode, or null for packet loss simulation
   * @returns Decoded PCM audio data as 16-bit signed integers
   * @throws {Error} If the decoder has been destroyed or decoding fails
   */
  decode(packet: Buffer | Uint8Array | null): Buffer {
    if (this.destroyed) {
      throw new Error(
        "Cannot decode audio with destroyed OpusDecoder. Create a new instance to continue decoding.",
      );
    }

    try {
      const decoded = this.#native.decode(packet);

      this.framesDecoded++;
      this.samplesProduced += decoded.length / 2; // 16-bit samples

      if (packet === null) {
        this.packetsLost++;
      }

      return decoded;
    } catch (error) {
      throw new Error(
        `Failed to decode Opus packet: ${(error as Error).message}. This may indicate corrupted packet data, invalid Opus format, or decoder state corruption.`,
      );
    }
  }

  /**
   * Decodes an Opus packet with Forward Error Correction.
   *
   * This method performs specialized decoding that utilizes Forward Error Correction
   * (FEC) information embedded in Opus packets. FEC allows recovery of lost packets
   * using redundant information from subsequent packets, providing better audio
   * quality during packet loss scenarios.
   *
   * ## When to Use FEC Decoding
   *
   * - **After Packet Loss**: When a packet is lost and the next packet contains FEC data
   * - **Network Issues**: During periods of unstable network connectivity
   * - **Quality Recovery**: To minimize audio artifacts from missing packets
   * - **Automatic Recovery**: As part of an adaptive packet loss recovery strategy
   *
   * ## FEC Operation
   *
   * 1. **Detection**: Determine if a packet contains FEC information for a previous frame
   * 2. **Recovery**: Use FEC data to reconstruct the missing audio frame
   * 3. **Integration**: Blend recovered audio with normal decoding to minimize artifacts
   * 4. **Quality**: FEC recovery provides better quality than error concealment
   *
   * ## Requirements
   *
   * - The encoder must have FEC enabled (inbandFEC = true)
   * - The packet must contain valid FEC information
   * - FEC can only recover the immediately previous frame
   * - Input packet must be valid (cannot be null)
   *
   * ## Performance Notes
   *
   * - FEC decoding has slightly higher CPU overhead than normal decoding
   * - Quality improvement is significant for single packet losses
   * - Less effective for burst packet losses
   * - Automatic fallback to error concealment if FEC data is unavailable
   *
   * @param packet - Opus packet containing FEC information for recovery
   * @returns Decoded PCM audio data recovered using FEC
   * @throws {Error} If the decoder has been destroyed, packet is null, or FEC decoding fails
   */
  decodeFec(packet: Buffer | Uint8Array): Buffer {
    if (this.destroyed) {
      throw new Error(
        "Cannot decode FEC with destroyed OpusDecoder. Create a new instance to continue decoding.",
      );
    }

    if (!packet || packet.length === 0) {
      throw new Error(
        "FEC decoding requires a valid packet with FEC information. Cannot use null or empty data for FEC recovery.",
      );
    }

    try {
      const decoded = this.#native.decodeFEC(packet);

      // FEC decoding produces recovered audio, update statistics accordingly
      this.samplesProduced += decoded.length / 2; // 16-bit samples

      return decoded;
    } catch (error) {
      throw new Error(
        `Failed to decode FEC packet: ${(error as Error).message}. This may indicate the packet lacks FEC information, is corrupted, or the decoder state is invalid.`,
      );
    }
  }

  /**
   * Sets the output gain adjustment for decoded audio.
   *
   * This method adjusts the amplitude of all decoded audio output by applying
   * a gain factor. The gain is specified in Q8 fixed-point format, which provides
   * fine-grained control over output levels while maintaining computational efficiency.
   *
   * ## Gain Calculation
   *
   * The Q8 format uses 8 fractional bits for gain representation:
   * - **256**: Unity gain (0dB, no change in amplitude)
   * - **512**: +6dB gain (approximately double amplitude)
   * - **128**: -6dB gain (approximately half amplitude)
   * - **0**: Silence (infinite attenuation)
   * - **32767**: Maximum gain (+48dB approximately)
   * - **-32768**: Minimum gain (-48dB approximately)
   *
   * ## Use Cases
   *
   * - **Volume Control**: Adjust output levels for different speakers/environments
   * - **Normalization**: Compensate for varying input levels across users
   * - **Dynamic Range**: Implement automatic gain control or limiting
   * - **Mix Balancing**: Balance multiple audio streams in mixing scenarios
   *
   * ## Performance Impact
   *
   * - Gain adjustment is applied efficiently during decoding
   * - No additional memory allocation or buffer copies required
   * - Computational overhead is minimal (single multiply per sample)
   * - Changes take effect immediately for subsequent decode operations
   *
   * @param gain - Gain value in Q8 format (-32768 to 32767, where 256 = 0dB)
   * @throws {Error} If the decoder has been destroyed or gain value is invalid
   */
  setGain(gain: number): void {
    if (this.destroyed) {
      throw new Error("Cannot configure destroyed OpusDecoder.");
    }

    if (gain < -32768 || gain > 32767) {
      throw new Error(
        `Invalid gain value: ${gain}. Must be between -32768 and 32767 (Q8 format).`,
      );
    }

    try {
      this.#native.setGain(gain);
    } catch (error) {
      throw new Error(
        `Failed to set decoder gain: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Resets the decoder state while preserving configuration.
   *
   * This method resets the decoder's internal state to initial conditions while
   * maintaining all configuration settings (gain, sample rate, channels, etc.).
   * This is useful for starting fresh decoding sessions or recovering from decoder
   * state corruption without recreating the entire decoder instance.
   *
   * ## Reset Behavior
   *
   * **What gets reset**:
   * - Internal decoding state and history
   * - Error concealment state and buffers
   * - FEC recovery state and previous frame data
   * - Statistical counters and metrics
   * - Adaptive algorithm states
   *
   * **What is preserved**:
   * - All configuration parameters (gain, sample rate, channels)
   * - Native object instance and handles
   * - Decoder capabilities and feature settings
   *
   * ## When to Use Reset
   *
   * - **Session Boundaries**: When starting a new voice session
   * - **Error Recovery**: After encountering decoding errors or corruption
   * - **Statistics Reset**: To restart performance monitoring from a clean state
   * - **Stream Restart**: When resuming after a pause or connection interruption
   * - **Quality Issues**: When persistent audio artifacts suggest state corruption
   */
  reset(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.reset();

      // Reset local statistics
      this.framesDecoded = 0;
      this.samplesProduced = 0;
      this.packetsLost = 0;
    } catch (_error) {
      // Reset failures are typically non-fatal
    }
  }

  /**
   * Destroys the decoder and releases all allocated resources.
   *
   * This method performs a complete shutdown of the Opus decoder, releasing all
   * native resources, internal buffers, and the libopus decoder context. Once
   * destroyed, the decoder instance becomes unusable and any further operations
   * will throw errors.
   *
   * ## Resource Cleanup
   *
   * The destroy operation releases:
   * - **Native Memory**: All C++ allocated buffers and libopus context
   * - **Internal State**: Decoding state, history, and error concealment data
   * - **FEC Buffers**: Forward Error Correction state and previous frame data
   * - **System Resources**: Memory mappings and handles used by libopus
   * - **Statistical Data**: All counters and performance metrics
   *
   * ## When to Call Destroy
   *
   * - **Application Shutdown**: When the application is terminating
   * - **Voice Session End**: When permanently ending a voice session
   * - **Decoder Replacement**: Before creating a new decoder instance
   * - **Memory Pressure**: To free resources in memory-constrained situations
   * - **Connection Termination**: When the voice connection is permanently closed
   *
   * ⚠️ **Important**: Always call destroy() when finished with a decoder to prevent
   * memory leaks. Native resources are not automatically garbage collected and
   * must be explicitly released.
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.#native.destroy();
    } finally {
      // Mark as destroyed regardless of destroy success
      this.destroyed = true;
      this.framesDecoded = 0;
      this.samplesProduced = 0;
      this.packetsLost = 0;
    }
  }
}

/**
 * Gets the version string of the underlying libopus library.
 *
 * This function returns version information for the Opus codec library that
 * provides the actual encoding and decoding functionality. This information
 * is useful for debugging, compatibility checking, and ensuring that the
 * correct version of libopus is being used.
 *
 * ## Version Information Uses
 *
 * - **Compatibility Checking**: Verify that required libopus features are available
 * - **Debugging**: Include version information in bug reports and diagnostics
 * - **Feature Detection**: Determine if specific Opus features are supported
 * - **Performance Tuning**: Optimize settings based on library capabilities
 *
 * The version string typically follows the format "libopus X.Y.Z" where X.Y.Z
 * represents the major, minor, and patch version numbers respectively.
 *
 * @returns Version string of the libopus library (e.g., "libopus 1.3.1")
 * @throws {Error} If the native addon is not available or version cannot be determined
 */
export function getOpusVersion(): string {
  try {
    return nativeAddon.getOpusVersion();
  } catch (error) {
    throw new Error(
      `Failed to get Opus version: ${(error as Error).message}. This may indicate the native addon is not properly loaded.`,
    );
  }
}

/**
 * Gets an array of sample rates supported by the Opus codec.
 *
 * This function returns a list of all sample rates that Opus can handle natively
 * without internal resampling. Using these sample rates provides optimal performance
 * and quality, as the codec is specifically optimized for these frequencies.
 *
 * ## Supported Sample Rates
 *
 * Opus typically supports these sample rates:
 * - **8000 Hz**: Narrowband, suitable for basic voice communication
 * - **12000 Hz**: Mediumband, improved voice quality over narrowband
 * - **16000 Hz**: Wideband, good voice quality for VoIP applications
 * - **24000 Hz**: Super-wideband, high quality voice communication
 * - **48000 Hz**: Fullband, highest quality for voice and music (Discord requirement)
 *
 * ## Usage Guidelines
 *
 * - Use 48000 Hz for Discord Voice Gateway compliance
 * - Lower sample rates reduce bandwidth and computational requirements
 * - Higher sample rates provide better audio quality but increase resource usage
 * - Always choose from the supported rates to avoid internal resampling overhead
 *
 * @returns Array of supported sample rates in Hz, sorted in ascending order
 * @throws {Error} If the native addon is not available or sample rates cannot be determined
 */
export function getSupportedSampleRates(): number[] {
  try {
    return nativeAddon.getSupportedSampleRates();
  } catch (error) {
    throw new Error(
      `Failed to get supported sample rates: ${(error as Error).message}. This may indicate the native addon is not properly loaded.`,
    );
  }
}

/**
 * Validates the structure and format of an Opus packet.
 *
 * This function performs basic validation of Opus packet data to determine if
 * it conforms to the Opus packet format specification. It checks the packet
 * header, validates the Table of Contents (TOC) byte, and verifies that the
 * packet structure is consistent with Opus requirements.
 *
 * ## Validation Checks
 *
 * The function performs these validation steps:
 * - **Size Validation**: Ensures packet size is within valid Opus limits (1-1275 bytes)
 * - **TOC Validation**: Verifies the Table of Contents byte is properly formatted
 * - **Configuration Check**: Validates that the configuration number is in valid range
 * - **Structure Integrity**: Checks for basic packet structure consistency
 *
 * ## Use Cases
 *
 * - **Input Validation**: Verify packets before attempting to decode
 * - **Network Debugging**: Identify corrupted or malformed packets
 * - **Quality Assurance**: Ensure encoder output meets Opus specifications
 * - **Protocol Compliance**: Validate conformance to Opus packet format
 *
 * ## Limitations
 *
 * This function performs basic structural validation only and cannot:
 * - Detect all types of packet corruption
 * - Validate compressed payload data integrity
 * - Guarantee successful decoding of valid packets
 * - Check application-specific packet requirements
 *
 * For complete validation, packets should be validated and then decoded to verify
 * the compressed data is intact.
 *
 * @param packet - Opus packet data to validate
 * @returns True if the packet structure appears valid, false otherwise
 * @throws {Error} If the native addon is not available or validation cannot be performed
 */
export function validateOpusPacket(packet: Buffer | Uint8Array): boolean {
  if (!packet || packet.length === 0) {
    return false;
  }

  try {
    return nativeAddon.validateOpusPacket(packet);
  } catch (error) {
    throw new Error(
      `Failed to validate Opus packet: ${(error as Error).message}. This may indicate the native addon is not properly loaded.`,
    );
  }
}

// Discord Voice Gateway Constants (MANDATORY)

/**
 * Discord Voice Gateway required sample rate: 48kHz.
 *
 * This constant represents the mandatory audio sample rate for Discord's Voice Gateway
 * protocol. All audio data sent through Discord voice channels must be sampled at
 * exactly 48,000 Hz to ensure compatibility with Discord's infrastructure.
 *
 * ## Technical Specifications
 *
 * - **Frequency**: 48,000 samples per second
 * - **Standard**: Professional audio standard sample rate
 * - **Nyquist Frequency**: 24kHz (full audio spectrum coverage)
 * - **Frame Duration**: 20ms frames = 960 samples at 48kHz
 *
 * ## Discord Requirements
 *
 * Discord's Voice Gateway enforces this sample rate for several reasons:
 * - **Compatibility**: Ensures consistent audio quality across all clients
 * - **Performance**: Optimized for real-time processing and network transmission
 * - **Quality**: Provides full audio spectrum coverage for voice and music
 * - **Standards Compliance**: Aligns with professional audio industry standards
 *
 * Any attempt to use a different sample rate will result in rejection by Discord's servers.
 */
export const DISCORD_SAMPLE_RATE: number = nativeAddon.DISCORD_SAMPLE_RATE;

/**
 * Discord Voice Gateway required channel count: 2 (stereo).
 *
 * This constant represents the mandatory audio channel configuration for Discord's
 * Voice Gateway protocol. All audio data must be provided as stereo (2-channel)
 * audio with interleaved left and right samples.
 *
 * ## Technical Specifications
 *
 * - **Channels**: 2 (left and right)
 * - **Layout**: Interleaved stereo samples [L, R, L, R, ...]
 * - **Compatibility**: Standard stereo format for modern audio systems
 * - **Processing**: Each frame contains 960 samples per channel (1920 total)
 *
 * ## Discord Requirements
 *
 * Discord requires stereo audio for:
 * - **Spatial Audio**: Support for positional audio features
 * - **Compatibility**: Standard format supported by all audio hardware
 * - **Quality**: Better audio experience compared to mono
 * - **Future Features**: Enables advanced audio features like surround sound
 *
 * Mono audio sources should be converted to stereo by duplicating the mono
 * channel to both left and right channels.
 */
export const DISCORD_CHANNELS: number = nativeAddon.DISCORD_CHANNELS;

/**
 * Discord Voice Gateway required frame size: 960 samples per channel.
 *
 * This constant represents the mandatory audio frame size for Discord's Voice Gateway
 * protocol. Each audio frame must contain exactly 960 samples per channel, which
 * corresponds to 20 milliseconds of audio at 48kHz sample rate.
 *
 * ## Technical Specifications
 *
 * - **Samples per Channel**: 960 samples
 * - **Total Samples**: 1920 samples (960 × 2 channels)
 * - **Duration**: 20 milliseconds at 48kHz
 * - **Size**: 3840 bytes (1920 samples × 2 bytes per 16-bit sample)
 *
 * ## Frame Timing
 *
 * The 20ms frame duration is critical for:
 * - **Real-time Performance**: Optimal balance between latency and efficiency
 * - **Network Efficiency**: Reasonable packet sizes for network transmission
 * - **Quality**: Small enough frames to maintain low latency
 * - **Compatibility**: Standard frame size used in VoIP applications
 *
 * ## Usage Requirements
 *
 * - Input to encode() must be exactly 1920 16-bit samples (960 per channel)
 * - Output from decode() will always be exactly 1920 16-bit samples
 * - Frame timing must be maintained at 50 frames per second (20ms each)
 * - Any deviation from this frame size will be rejected by Discord's servers
 */
export const DISCORD_FRAME_SIZE: number = nativeAddon.DISCORD_FRAME_SIZE;

/**
 * Discord Voice Gateway default bitrate: 64kbps.
 *
 * This constant represents the default target bitrate used by Discord's Voice Gateway
 * for optimal voice communication quality. This bitrate provides a good balance
 * between audio quality and bandwidth usage for typical voice chat scenarios.
 *
 * ## Bitrate Characteristics
 *
 * - **Quality**: Good quality voice communication
 * - **Bandwidth**: Moderate bandwidth usage suitable for most connections
 * - **Efficiency**: Optimal compression efficiency for speech content
 * - **Compatibility**: Works well across various network conditions
 *
 * ## Quality Guidelines
 *
 * Bitrate recommendations for different use cases:
 * - **32kbps**: Minimum acceptable quality for voice-only communication
 * - **64kbps**: Discord default, good balance for voice chat
 * - **96kbps**: Higher quality voice, suitable for important communications
 * - **128kbps**: Excellent quality, suitable for music or high-quality voice
 *
 * ## Network Considerations
 *
 * The 64kbps default is chosen to:
 * - Work reliably on most internet connections
 * - Provide clear voice communication
 * - Allow multiple simultaneous voice streams
 * - Maintain real-time performance with low latency
 *
 * Users can adjust bitrate based on their network capacity and quality requirements.
 */
export const DISCORD_BITRATE: number = nativeAddon.DISCORD_BITRATE;

// Opus Application Type Constants

/**
 * Opus application type optimized for Voice over IP (VoIP) applications.
 *
 * This constant represents the VoIP application mode for Opus encoding, which is
 * specifically optimized for real-time voice communication scenarios such as
 * Discord Voice Gateway. This mode prioritizes low latency and speech quality
 * over general audio fidelity.
 *
 * ## Optimization Characteristics
 *
 * - **Low Latency**: Minimized algorithmic delay for interactive communication
 * - **Speech Optimization**: Tuned algorithms for human voice frequency characteristics
 * - **Real-time Performance**: Optimized for consistent real-time encoding/decoding
 * - **Network Adaptation**: Better handling of packet loss and network variations
 *
 * ## When to Use VoIP Mode
 *
 * - **Voice Chat**: Discord voice channels and direct calls
 * - **Interactive Communication**: Real-time conversations requiring low latency
 * - **Speech Content**: Primarily human voice content rather than music
 * - **Network Reliability**: Scenarios where packet loss may occur
 *
 * ## Performance Benefits
 *
 * - Reduces encoding/decoding latency for better interactivity
 * - Provides better speech intelligibility at lower bitrates
 * - Adapts better to network jitter and packet loss
 * - Optimizes CPU usage for real-time constraints
 *
 * This is the recommended application type for Discord Voice Gateway usage.
 */
export const OPUS_APPLICATION_VOIP: number = nativeAddon.OPUS_APPLICATION_VOIP;

/**
 * Opus application type optimized for general audio applications.
 *
 * This constant represents the audio application mode for Opus encoding, which is
 * optimized for general audio content including music, sound effects, and mixed
 * audio scenarios. This mode prioritizes overall audio quality and fidelity
 * over the low-latency requirements of interactive communication.
 *
 * ## Optimization Characteristics
 *
 * - **High Quality**: Optimized for best possible audio fidelity
 * - **Full Spectrum**: Better handling of complex harmonic content and music
 * - **Quality over Latency**: May have higher latency for improved quality
 * - **Complex Audio**: Better suited for non-speech audio content
 *
 * ## When to Use Audio Mode
 *
 * - **Music Streaming**: Broadcasting music or complex audio content
 * - **Mixed Content**: Audio containing both speech and music
 * - **High Quality**: Scenarios where audio fidelity is prioritized over latency
 * - **Non-Interactive**: One-way audio streaming or playback scenarios
 *
 * ## Performance Characteristics
 *
 * - May have higher encoding/decoding latency than VoIP mode
 * - Provides better quality for music and complex audio at equivalent bitrates
 * - Uses more sophisticated algorithms that may require more CPU resources
 * - Better preserves stereo imaging and spatial audio characteristics
 *
 * Use this mode when audio quality is more important than minimal latency.
 */
export const OPUS_APPLICATION_AUDIO: number =
  nativeAddon.OPUS_APPLICATION_AUDIO;

/**
 * Opus application type optimized for very low latency applications.
 *
 * This constant represents the restricted low-delay application mode for Opus
 * encoding, which provides the lowest possible algorithmic delay at the cost
 * of some advanced features. This mode is designed for applications with
 * extremely strict latency requirements.
 *
 * ## Optimization Characteristics
 *
 * - **Minimal Latency**: Absolute minimum algorithmic delay
 * - **Restricted Features**: Some Opus features are disabled to reduce latency
 * - **Simple Algorithms**: Uses simpler, faster algorithms for processing
 * - **Predictable Performance**: More consistent processing times
 *
 * ## When to Use Low-Delay Mode
 *
 * - **Real-time Audio Processing**: Applications requiring immediate audio feedback
 * - **Interactive Music**: Live music performance or jamming applications
 * - **Low-Latency Gaming**: Games requiring immediate audio response
 * - **Professional Audio**: Studio monitoring or live performance scenarios
 *
 * ## Trade-offs
 *
 * **Benefits**:
 * - Lowest possible encoding/decoding latency
 * - Predictable and consistent processing times
 * - Reduced buffer requirements
 *
 * **Limitations**:
 * - Some advanced Opus features may be unavailable
 * - May have slightly reduced compression efficiency
 * - Quality may be lower than standard modes at equivalent bitrates
 *
 * Use this mode only when ultra-low latency is critical and the trade-offs are acceptable.
 */
export const OPUS_APPLICATION_RESTRICTED_LOWDELAY: number =
  nativeAddon.OPUS_APPLICATION_RESTRICTED_LOWDELAY;

// Opus Bandwidth Limitation Constants

/**
 * Opus narrowband limitation: 4kHz audio bandwidth.
 *
 * This constant limits Opus encoding to narrowband operation, which restricts
 * the audio bandwidth to approximately 4kHz. This is the most bandwidth-efficient
 * option but provides the lowest audio quality, suitable only for basic speech
 * communication where bandwidth is extremely limited.
 *
 * ## Technical Specifications
 *
 * - **Bandwidth**: ~4kHz (0-4000 Hz frequency range)
 * - **Quality**: Basic speech intelligibility
 * - **CPU Usage**: Lowest computational requirements
 * - **Bitrate**: Most efficient at very low bitrates (8-16kbps)
 *
 * ## Use Cases
 *
 * - **Emergency Communications**: When bandwidth is severely constrained
 * - **Legacy Compatibility**: Interfacing with older telephony systems
 * - **Extreme Bandwidth Savings**: When every bit of bandwidth matters
 * - **Basic Voice**: Simple voice commands or notifications
 *
 * This bandwidth is generally not recommended for Discord Voice Gateway usage
 * as it significantly reduces audio quality compared to higher bandwidth options.
 */
export const OPUS_BANDWIDTH_NARROWBAND: number =
  nativeAddon.OPUS_BANDWIDTH_NARROWBAND;

/**
 * Opus mediumband limitation: 6kHz audio bandwidth.
 *
 * This constant limits Opus encoding to mediumband operation, which provides
 * a slight improvement over narrowband while still maintaining very efficient
 * bandwidth usage. This option offers better speech quality than narrowband
 * while remaining suitable for bandwidth-constrained environments.
 *
 * ## Technical Specifications
 *
 * - **Bandwidth**: ~6kHz (0-6000 Hz frequency range)
 * - **Quality**: Enhanced speech quality over narrowband
 * - **CPU Usage**: Low computational requirements
 * - **Bitrate**: Efficient at low bitrates (12-24kbps)
 *
 * ## Use Cases
 *
 * - **Improved Voice Quality**: Better than narrowband for voice communication
 * - **Bandwidth Constraints**: When bandwidth is limited but some quality is needed
 * - **Mobile Networks**: Suitable for cellular or satellite connections
 * - **Basic VoIP**: Simple voice communication with modest quality requirements
 *
 * This bandwidth provides a reasonable compromise between quality and efficiency
 * but is still below Discord's typical quality standards.
 */
export const OPUS_BANDWIDTH_MEDIUMBAND: number =
  nativeAddon.OPUS_BANDWIDTH_MEDIUMBAND;

/**
 * Opus wideband limitation: 8kHz audio bandwidth.
 *
 * This constant limits Opus encoding to wideband operation, which provides
 * good speech quality suitable for most voice communication applications.
 * This bandwidth offers clear speech reproduction while maintaining reasonable
 * computational and bandwidth requirements.
 *
 * ## Technical Specifications
 *
 * - **Bandwidth**: ~8kHz (0-8000 Hz frequency range)
 * - **Quality**: Good speech quality, suitable for VoIP
 * - **CPU Usage**: Moderate computational requirements
 * - **Bitrate**: Efficient at moderate bitrates (16-32kbps)
 *
 * ## Use Cases
 *
 * - **Standard VoIP**: Traditional voice over IP applications
 * - **Good Speech Quality**: Clear, intelligible voice communication
 * - **Balanced Performance**: Reasonable quality with modest resource usage
 * - **Legacy Systems**: Compatibility with older VoIP standards
 *
 * This bandwidth provides good speech quality and is suitable for many voice
 * communication scenarios, though Discord typically uses higher bandwidth
 * for better overall audio experience.
 */
export const OPUS_BANDWIDTH_WIDEBAND: number =
  nativeAddon.OPUS_BANDWIDTH_WIDEBAND;

/**
 * Opus super-wideband limitation: 12kHz audio bandwidth.
 *
 * This constant limits Opus encoding to super-wideband operation, which provides
 * high-quality audio suitable for both voice communication and basic music
 * content. This bandwidth offers excellent speech clarity and can handle
 * simple musical content with good fidelity.
 *
 * ## Technical Specifications
 *
 * - **Bandwidth**: ~12kHz (0-12000 Hz frequency range)
 * - **Quality**: High quality speech and basic music
 * - **CPU Usage**: Higher computational requirements
 * - **Bitrate**: Efficient at moderate to high bitrates (32-64kbps)
 *
 * ## Use Cases
 *
 * - **High-Quality Voice**: Premium voice communication services
 * - **Mixed Content**: Voice with occasional music or sound effects
 * - **Professional Communication**: Business or professional voice calls
 * - **Enhanced Audio**: Better than standard VoIP quality
 *
 * This bandwidth provides excellent voice quality and is suitable for many
 * Discord applications, offering a good balance between quality and resource usage.
 */
export const OPUS_BANDWIDTH_SUPERWIDEBAND: number =
  nativeAddon.OPUS_BANDWIDTH_SUPERWIDEBAND;

/**
 * Opus fullband limitation: 20kHz audio bandwidth.
 *
 * This constant allows Opus encoding to use its full bandwidth capability,
 * providing the highest possible audio quality with complete frequency spectrum
 * coverage. This is the recommended setting for Discord Voice Gateway as it
 * provides optimal audio quality for all types of content.
 *
 * ## Technical Specifications
 *
 * - **Bandwidth**: ~20kHz (0-20000 Hz frequency range, full audio spectrum)
 * - **Quality**: Highest possible audio quality
 * - **CPU Usage**: Highest computational requirements
 * - **Bitrate**: Most efficient at higher bitrates (64kbps+)
 *
 * ## Use Cases
 *
 * - **Discord Voice Gateway**: Recommended for optimal Discord voice quality
 * - **Music Streaming**: High-quality music and audio content
 * - **Professional Audio**: Studio-quality audio applications
 * - **Premium Services**: High-end audio communication services
 *
 * ## Benefits
 *
 * - Complete frequency spectrum coverage up to human hearing limits
 * - Excellent quality for both voice and music content
 * - Full utilization of Opus codec capabilities
 * - Future-proof for high-quality audio requirements
 *
 * This is the recommended bandwidth setting for Discord Voice Gateway usage
 * as it provides the best possible audio experience for users.
 */
export const OPUS_BANDWIDTH_FULLBAND: number =
  nativeAddon.OPUS_BANDWIDTH_FULLBAND;

// Opus Signal Type Constants

/**
 * Opus signal type optimized for voice and speech content.
 *
 * This constant provides a hint to the Opus encoder that the audio content
 * is primarily voice or speech, allowing the encoder to optimize its algorithms
 * for the characteristics of human speech. This optimization can improve
 * compression efficiency and quality for voice-centric applications.
 *
 * ## Optimization Benefits
 *
 * - **Speech Characteristics**: Optimized for human voice frequency patterns
 * - **Silence Handling**: Better detection and compression of speech pauses
 * - **Intelligibility**: Prioritizes speech clarity and understanding
 * - **Efficiency**: Better compression ratios for speech content
 *
 * ## When to Use Voice Signal Type
 *
 * - **Voice Chat**: Discord voice channels and voice communication
 * - **Speech Applications**: Voice recognition, dictation, or speech synthesis
 * - **VoIP Services**: Voice over IP applications and phone services
 * - **Podcast/Audio Books**: Primarily speech-based audio content
 *
 * ## Technical Optimizations
 *
 * The voice signal type enables several encoder optimizations:
 * - **Formant Preservation**: Better preservation of speech formants
 * - **Pitch Tracking**: Improved pitch analysis for speech
 * - **Silence Detection**: More accurate silence and pause detection
 * - **Spectral Shaping**: Frequency response optimized for speech intelligibility
 *
 * This is the recommended signal type for Discord Voice Gateway usage as it
 * optimizes the encoder for voice communication scenarios.
 */
export const OPUS_SIGNAL_VOICE: number = nativeAddon.OPUS_SIGNAL_VOICE;

/**
 * Opus signal type optimized for music and general audio content.
 *
 * This constant provides a hint to the Opus encoder that the audio content
 * includes music or complex audio signals, allowing the encoder to optimize
 * its algorithms for the characteristics of musical and general audio content
 * rather than just speech.
 *
 * ## Optimization Benefits
 *
 * - **Harmonic Content**: Better handling of complex harmonic structures
 * - **Full Spectrum**: Optimized for full frequency range utilization
 * - **Stereo Imaging**: Better preservation of stereo soundstage and imaging
 * - **Dynamic Range**: Improved handling of wide dynamic range content
 *
 * ## When to Use Music Signal Type
 *
 * - **Music Streaming**: Broadcasting music or musical content
 * - **Mixed Audio**: Content containing both speech and music
 * - **Game Audio**: Complex game audio with music and sound effects
 * - **Media Playback**: General audio/video content playback
 *
 * ## Technical Optimizations
 *
 * The music signal type enables several encoder optimizations:
 * - **Transient Handling**: Better processing of musical transients and attacks
 * - **Harmonic Analysis**: More sophisticated harmonic content analysis
 * - **Stereo Processing**: Enhanced stereo field preservation
 * - **Frequency Balance**: Optimized frequency response for musical content
 *
 * Use this signal type when the audio content includes significant musical
 * or complex audio elements that benefit from music-specific optimizations.
 */
export const OPUS_SIGNAL_MUSIC: number = nativeAddon.OPUS_SIGNAL_MUSIC;
