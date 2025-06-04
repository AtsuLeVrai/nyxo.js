/**
 * Opus Application Type
 *
 * Enumeration of application types that optimize the encoder for different use cases.
 * Each application type adjusts internal algorithms for optimal performance.
 *
 * **Performance Impact:** Application type significantly affects encoding quality,
 * latency, and computational requirements.
 *
 * @see {@link https://opus-codec.org/docs/opus_api-1.3.1/group__opus__encoder.html#ga8cbb1b91a8cdd8bb40ced3853094d557}
 */
export enum OpusApplication {
  /**
   * Voice over IP application
   *
   * **Optimization:** Optimized for voice transmission over networks
   * **Characteristics:** Lower latency, voice-specific processing
   * **Use Case:** VoIP calls, voice chat, real-time communication
   * **Bitrate Range:** 6-40 kbps typically
   */
  Voip = 2048,

  /**
   * General audio application
   *
   * **Optimization:** Balanced for both voice and music content
   * **Characteristics:** Good quality for mixed content types
   * **Use Case:** General audio streaming, mixed voice/music
   * **Bitrate Range:** 16-128 kbps typically
   */
  Audio = 2049,

  /**
   * Restricted low delay application
   *
   * **Optimization:** Minimized algorithmic delay for real-time applications
   * **Characteristics:** Ultra-low latency, reduced quality for speed
   * **Use Case:** Real-time audio processing, live performance
   * **Bitrate Range:** 8-64 kbps typically
   */
  RestrictedLowDelay = 2051,
}

/**
 * Opus Signal Type
 *
 * Enumeration of signal types for encoding optimization hints.
 * Helps the encoder choose appropriate algorithms for the audio content.
 *
 * **Adaptive Behavior:** The encoder can automatically detect signal type
 * when set to Auto, or use explicit hints for better optimization.
 */
export enum OpusSignalType {
  /**
   * Automatic signal detection
   *
   * **Behavior:** Encoder automatically detects voice vs music content
   * **Adaptation:** Continuously adapts encoding strategy based on content
   * **Use Case:** General-purpose encoding with mixed content
   */
  Auto = -1000,

  /**
   * Voice signal optimization
   *
   * **Optimization:** Algorithms optimized for speech characteristics
   * **Processing:** Voice-specific filters and bandwidth allocation
   * **Use Case:** Pure voice content, speech applications
   */
  Voice = 3001,

  /**
   * Music signal optimization
   *
   * **Optimization:** Algorithms optimized for musical content
   * **Processing:** Full bandwidth, music-specific algorithms
   * **Use Case:** Music streaming, high-quality audio content
   */
  Music = 3002,
}

/**
 * Opus Bandwidth
 *
 * Enumeration of supported audio bandwidths for encoding.
 * Controls the frequency range of the encoded audio.
 *
 * **Quality Trade-off:** Higher bandwidth provides better audio quality
 * but requires more bitrate for optimal results.
 */
export enum OpusBandwidth {
  /**
   * Narrowband - 8 kHz cutoff
   *
   * **Frequency Range:** 0-4 kHz
   * **Use Case:** Low-quality voice, very low bitrate applications
   * **Typical Bitrate:** 6-20 kbps
   */
  Narrowband = 1101,

  /**
   * Mediumband - 12 kHz cutoff
   *
   * **Frequency Range:** 0-6 kHz
   * **Use Case:** Medium-quality voice applications
   * **Typical Bitrate:** 16-32 kbps
   */
  Mediumband = 1102,

  /**
   * Wideband - 16 kHz cutoff
   *
   * **Frequency Range:** 0-8 kHz
   * **Use Case:** High-quality voice, VoIP applications
   * **Typical Bitrate:** 20-40 kbps
   */
  Wideband = 1103,

  /**
   * Super wideband - 24 kHz cutoff
   *
   * **Frequency Range:** 0-12 kHz
   * **Use Case:** Very high-quality voice, mixed content
   * **Typical Bitrate:** 32-64 kbps
   */
  SuperWideband = 1104,

  /**
   * Fullband - 48 kHz cutoff
   *
   * **Frequency Range:** 0-20 kHz (full audible spectrum)
   * **Use Case:** Music, highest quality audio
   * **Typical Bitrate:** 64-512 kbps
   */
  Fullband = 1105,
}

/**
 * Opus Frame Duration
 *
 * Enumeration of supported frame durations in milliseconds.
 * Frame duration affects latency, efficiency, and quality characteristics.
 *
 * **Latency Impact:** Shorter frames reduce latency but may be less efficient.
 * **Quality Impact:** Longer frames generally provide better compression efficiency.
 */
export enum OpusFrameDuration {
  /**
   * 2.5 millisecond frames
   *
   * **Latency:** Ultra-low (2.5ms)
   * **Efficiency:** Lower compression efficiency
   * **Use Case:** Real-time applications requiring minimal latency
   */
  Frame2_5ms = 2.5,

  /**
   * 5 millisecond frames
   *
   * **Latency:** Very low (5ms)
   * **Efficiency:** Low compression efficiency
   * **Use Case:** Low-latency real-time applications
   */
  Frame5ms = 5,

  /**
   * 10 millisecond frames
   *
   * **Latency:** Low (10ms)
   * **Efficiency:** Moderate compression efficiency
   * **Use Case:** VoIP applications, real-time communication
   */
  Frame10ms = 10,

  /**
   * 20 millisecond frames (recommended)
   *
   * **Latency:** Moderate (20ms)
   * **Efficiency:** Good compression efficiency
   * **Use Case:** Most voice and audio applications (Discord default)
   */
  Frame20ms = 20,

  /**
   * 40 millisecond frames
   *
   * **Latency:** Higher (40ms)
   * **Efficiency:** Very good compression efficiency
   * **Use Case:** Non-real-time applications, streaming
   */
  Frame40ms = 40,

  /**
   * 60 millisecond frames
   *
   * **Latency:** High (60ms)
   * **Efficiency:** Excellent compression efficiency
   * **Use Case:** Offline encoding, storage applications
   */
  Frame60ms = 60,
}

/**
 * Opus Sample Rate
 *
 * Enumeration of supported sample rates in Hz.
 * Sample rate determines the maximum frequency that can be represented.
 *
 * **Discord Standard:** 48000 Hz is the standard for Discord voice connections.
 */
export enum OpusSampleRate {
  /** 8 kHz sample rate - Narrowband telephony quality */
  Rate8000 = 8000,
  /** 12 kHz sample rate - Medium quality applications */
  Rate12000 = 12000,
  /** 16 kHz sample rate - Wideband telephony quality */
  Rate16000 = 16000,
  /** 24 kHz sample rate - Super wideband quality */
  Rate24000 = 24000,
  /** 48 kHz sample rate - Full audio bandwidth (Discord standard) */
  Rate48000 = 48000,
}

/**
 * Opus Channel Count
 *
 * Enumeration of supported channel configurations.
 * Determines whether audio is mono or stereo.
 *
 * **Discord Standard:** Stereo (2 channels) is used for Discord voice.
 */
export enum OpusChannels {
  /** Mono audio - single channel */
  Mono = 1,
  /** Stereo audio - two channels (Discord standard) */
  Stereo = 2,
}

/**
 * Opus Audio Frame
 *
 * Represents a complete Opus audio frame with metadata.
 * Contains both the encoded data and information about the frame characteristics.
 *
 * **Frame Structure:** Each frame is self-contained and can be decoded independently
 * (except when prediction is enabled).
 */
export interface OpusFrameEntity {
  /**
   * Encoded audio data
   *
   * **Format:** Opus-encoded binary data
   * **Size:** Variable, typically 20-1500 bytes depending on settings
   * **Content:** Complete encoded frame ready for transmission or storage
   */
  data: Uint8Array;

  /**
   * Frame duration in milliseconds
   *
   * **Standard Values:** 2.5, 5, 10, 20, 40, 60 ms
   * **Discord Standard:** 20 ms
   * **Impact:** Affects latency and compression efficiency
   */
  duration: OpusFrameDuration;

  /**
   * Number of samples in this frame
   *
   * **Calculation:** sampleRate * (duration / 1000)
   * **Example:** 48000 Hz * 0.02s = 960 samples for 20ms frame
   * **Use:** Required for proper audio buffer management
   */
  sampleCount: number;

  /**
   * Frame timestamp in samples
   *
   * **Reference:** Sample-based timestamp relative to stream start
   * **Monotonic:** Always increases, used for timing and synchronization
   * **Calculation:** Cumulative sample count from beginning of stream
   */
  timestamp: number;

  /**
   * Number of audio channels in this frame
   *
   * **Values:** 1 (mono) or 2 (stereo)
   * **Consistency:** Should remain constant throughout stream
   * **Discord:** Always 2 (stereo)
   */
  channels: OpusChannels;

  /**
   * Sample rate in Hz
   *
   * **Values:** 8000, 12000, 16000, 24000, 48000
   * **Consistency:** Should remain constant throughout stream
   * **Discord:** Always 48000 Hz
   */
  sampleRate: OpusSampleRate;

  /**
   * Whether this frame contains silence
   *
   * **DTX Support:** Used for Discontinuous Transmission
   * **Optimization:** Allows special handling of silent frames
   * **Bandwidth:** Silent frames can be represented more efficiently
   */
  isSilence?: boolean;

  /**
   * Forward Error Correction data present
   *
   * **Recovery:** Indicates if frame contains FEC for previous frame
   * **Loss Recovery:** Can be used to recover lost packets
   * **Overhead:** FEC increases frame size but improves robustness
   */
  hasFec?: boolean;
}

/**
 * Raw PCM Audio Data
 *
 * Represents uncompressed PCM audio data for input to encoder or output from decoder.
 * Standard format for audio processing before encoding or after decoding.
 *
 * **Format:** Interleaved 16-bit signed integer samples (little-endian).
 */
export interface OpusPcmDataEntity {
  /**
   * Raw PCM audio samples
   *
   * **Format:** 16-bit signed integers, little-endian
   * **Layout:** Interleaved (L,R,L,R... for stereo)
   * **Range:** -32768 to +32767 per sample
   */
  samples: Int16Array;

  /**
   * Number of audio channels
   *
   * **Values:** 1 (mono) or 2 (stereo)
   * **Layout:** Determines sample interleaving pattern
   * **Discord:** Always 2 (stereo)
   */
  channels: OpusChannels;

  /**
   * Sample rate in Hz
   *
   * **Values:** 8000, 12000, 16000, 24000, 48000
   * **Quality:** Higher rates support better frequency response
   * **Discord:** Always 48000 Hz
   */
  sampleRate: OpusSampleRate;

  /**
   * Duration in milliseconds
   *
   * **Calculation:** (samples.length / channels) / sampleRate * 1000
   * **Frame Alignment:** Should match encoder frame duration
   * **Timing:** Used for synchronization and buffer management
   */
  duration: number;

  /**
   * Timestamp in samples
   *
   * **Reference:** Sample-based timestamp for this PCM data
   * **Synchronization:** Used for audio/video sync and stream timing
   * **Monotonic:** Should increase continuously in stream
   */
  timestamp: number;
}

/**
 * Opus Codec Information
 *
 * Static information about Opus codec capabilities and version.
 * Useful for capability detection and compatibility checking.
 */
export interface OpusCodecInfoEntity {
  /**
   * Codec version string
   *
   * **Format:** Typically "major.minor.patch" format
   * **Compatibility:** Use for version-specific feature detection
   */
  version: string;

  /**
   * Supported sample rates
   *
   * **List:** All sample rates supported by this implementation
   * **Validation:** Use to validate configuration parameters
   */
  supportedSampleRates: OpusSampleRate[];

  /**
   * Supported frame durations
   *
   * **List:** All frame durations supported by this implementation
   * **Validation:** Use to validate configuration parameters
   */
  supportedFrameDurations: OpusFrameDuration[];

  /**
   * Maximum number of channels supported
   *
   * **Limit:** Typically 2 for most implementations
   * **Validation:** Use to validate channel configuration
   */
  maxChannels: number;

  /**
   * Minimum supported bitrate
   *
   * **Limit:** Lowest usable bitrate in bits per second
   * **Validation:** Use to validate bitrate configuration
   */
  minBitrate: number;

  /**
   * Maximum supported bitrate
   *
   * **Limit:** Highest usable bitrate in bits per second
   * **Validation:** Use to validate bitrate configuration
   */
  maxBitrate: number;

  /**
   * Whether Forward Error Correction is supported
   *
   * **Feature:** Indicates FEC capability
   * **Network:** Important for lossy network environments
   */
  supportsFec: boolean;

  /**
   * Whether Variable Bitrate is supported
   *
   * **Feature:** Indicates VBR capability
   * **Quality:** Important for optimal quality/bitrate trade-off
   */
  supportsVbr: boolean;
}

/**
 * Frame size calculation utility type
 *
 * Helper type for calculating frame sizes based on configuration.
 * Useful for buffer allocation and validation.
 */
export interface OpusFrameSizeEntity {
  /**
   * Number of samples per frame
   *
   * **Calculation:** sampleRate * (frameDuration / 1000)
   * **Buffering:** Use for PCM buffer allocation
   */
  samplesPerFrame: number;

  /**
   * Number of bytes per PCM frame
   *
   * **Calculation:** samplesPerFrame * channels * 2 (16-bit samples)
   * **Buffering:** Use for PCM buffer allocation
   */
  pcmBytesPerFrame: number;

  /**
   * Maximum encoded frame size in bytes
   *
   * **Estimation:** Conservative estimate for buffer allocation
   * **Networking:** Use for packet buffer sizes
   */
  maxEncodedSize: number;
}
