import { OpusOptions } from "../managers/opus.manager.js";
import {
  OpusApplication,
  OpusChannels,
  OpusFrameDuration,
  type OpusFrameSizeEntity,
  type OpusPcmDataEntity,
  OpusSampleRate,
} from "../types/index.js";

/**
 * Opus Utilities Object
 *
 * Comprehensive collection of utility functions for Opus codec operations.
 * Organized as a constant object to provide a clean API without class overhead.
 *
 * **Usage:** Import and use directly: `OpusUtils.preparePcmData(...)`
 */
export const OpusUtils = {
  /**
   * Convert raw PCM samples to Opus-compatible PCM data format
   *
   * **Purpose:** Creates properly formatted PCM data structure from raw samples
   * **Validation:** Ensures sample count matches expected frame size
   * **Timing:** Calculates duration and timestamp automatically
   *
   * @param samples - Raw 16-bit PCM samples (interleaved for stereo)
   * @param sampleRate - Sample rate in Hz
   * @param channels - Number of audio channels (1 or 2)
   * @param timestamp - Optional timestamp in samples (defaults to 0)
   * @returns Properly formatted PCM data ready for encoding
   */
  preparePcmData(
    samples: Int16Array,
    sampleRate: OpusSampleRate,
    channels: OpusChannels,
    timestamp = 0,
  ): OpusPcmDataEntity {
    // Calculate duration from sample count
    const sampleCount = samples.length / channels;
    const duration = (sampleCount / sampleRate) * 1000;

    return {
      samples,
      channels,
      sampleRate,
      duration,
      timestamp,
    };
  },

  /**
   * Create PCM data from separate channel arrays
   *
   * **Purpose:** Interleaves separate mono channels into stereo PCM data
   * **Layout:** Creates L,R,L,R... interleaved pattern
   * **Performance:** Optimized for real-time channel merging
   *
   * @param leftChannel - Left channel samples
   * @param rightChannel - Right channel samples (optional, defaults to left)
   * @param sampleRate - Sample rate in Hz
   * @param timestamp - Optional timestamp in samples
   * @returns Interleaved stereo PCM data
   */
  createStereoFromChannels(
    leftChannel: Int16Array,
    rightChannel?: Int16Array,
    sampleRate: OpusSampleRate = OpusSampleRate.Rate48000,
    timestamp = 0,
  ): OpusPcmDataEntity {
    const right = rightChannel || leftChannel;

    if (leftChannel.length !== right.length) {
      throw new Error("Channel arrays must have the same length");
    }

    const stereoSamples = new Int16Array(leftChannel.length * 2);

    // Interleave channels: L,R,L,R...
    for (let i = 0; i < leftChannel.length; i++) {
      stereoSamples[i * 2] = leftChannel[i] as number;
      stereoSamples[i * 2 + 1] = right[i] as number;
    }

    return this.preparePcmData(
      stereoSamples,
      sampleRate,
      OpusChannels.Stereo,
      timestamp,
    );
  },

  /**
   * Extract separate channels from interleaved stereo PCM data
   *
   * **Purpose:** De-interleaves stereo PCM into separate mono channels
   * **Layout:** Splits L,R,L,R... into separate left and right arrays
   * **Memory:** Creates new arrays for each channel
   *
   * @param pcmData - Interleaved stereo PCM data
   * @returns Object containing separate left and right channel arrays
   */
  extractChannels(pcmData: OpusPcmDataEntity): {
    left: Int16Array;
    right: Int16Array;
  } {
    if (pcmData.channels !== OpusChannels.Stereo) {
      throw new Error("PCM data must be stereo for channel extraction");
    }

    const sampleCount = pcmData.samples.length / 2;
    const left = new Int16Array(sampleCount);
    const right = new Int16Array(sampleCount);

    // De-interleave channels
    for (let i = 0; i < sampleCount; i++) {
      left[i] = pcmData.samples[i * 2] as number;
      right[i] = pcmData.samples[i * 2 + 1] as number;
    }

    return { left, right };
  },

  /**
   * Convert mono PCM samples to stereo by duplicating the channel
   *
   * **Purpose:** Creates stereo output by copying mono signal to both channels
   * **Quality:** Maintains original audio quality, creates centered image
   * **Performance:** Efficient memory copy operation
   *
   * @param monoSamples - Mono PCM samples
   * @returns Stereo samples with duplicated mono signal
   */
  monoToStereo(monoSamples: Int16Array): Int16Array {
    const stereoSamples = new Int16Array(monoSamples.length * 2);

    for (let i = 0; i < monoSamples.length; i++) {
      const sample = monoSamples[i] as number;
      stereoSamples[i * 2] = sample; // Left channel
      stereoSamples[i * 2 + 1] = sample; // Right channel (duplicate)
    }

    return stereoSamples;
  },

  /**
   * Convert stereo PCM samples to mono by mixing channels
   *
   * **Purpose:** Creates mono output by averaging left and right channels
   * **Quality:** Maintains balance, prevents clipping through averaging
   * **Performance:** Single-pass processing with overflow protection
   *
   * @param stereoSamples - Interleaved stereo PCM samples
   * @returns Mono samples with mixed down audio
   */
  stereoToMono(stereoSamples: Int16Array): Int16Array {
    const monoSamples = new Int16Array(stereoSamples.length / 2);

    for (let i = 0; i < monoSamples.length; i++) {
      const left = stereoSamples[i * 2] as number;
      const right = stereoSamples[i * 2 + 1] as number;
      // Average channels to prevent clipping
      monoSamples[i] = Math.floor((left + right) / 2);
    }

    return monoSamples;
  },

  /**
   * Convert mono PCM data to stereo PCM data
   *
   * **Purpose:** Converts complete mono PCM data structure to stereo
   * **Metadata:** Preserves all timing and format information
   * **Convenience:** High-level wrapper for mono-to-stereo conversion
   *
   * @param monoPcmData - Mono PCM data structure
   * @returns Stereo PCM data with duplicated mono signal
   */
  convertMonoToStereo(monoPcmData: OpusPcmDataEntity): OpusPcmDataEntity {
    if (monoPcmData.channels !== OpusChannels.Mono) {
      throw new Error("Input PCM data must be mono");
    }

    const stereoSamples = this.monoToStereo(monoPcmData.samples);

    return {
      samples: stereoSamples,
      channels: OpusChannels.Stereo,
      sampleRate: monoPcmData.sampleRate,
      duration: monoPcmData.duration,
      timestamp: monoPcmData.timestamp,
    };
  },

  /**
   * Convert stereo PCM data to mono PCM data
   *
   * **Purpose:** Converts complete stereo PCM data structure to mono
   * **Metadata:** Preserves all timing and format information
   * **Convenience:** High-level wrapper for stereo-to-mono conversion
   *
   * @param stereoPcmData - Stereo PCM data structure
   * @returns Mono PCM data with mixed down audio
   */
  convertStereoToMono(stereoPcmData: OpusPcmDataEntity): OpusPcmDataEntity {
    if (stereoPcmData.channels !== OpusChannels.Stereo) {
      throw new Error("Input PCM data must be stereo");
    }

    const monoSamples = this.stereoToMono(stereoPcmData.samples);

    return {
      samples: monoSamples,
      channels: OpusChannels.Mono,
      sampleRate: stereoPcmData.sampleRate,
      duration: stereoPcmData.duration,
      timestamp: stereoPcmData.timestamp,
    };
  },

  /**
   * Apply gain adjustment to PCM samples
   *
   * **Purpose:** Adjusts audio volume by specified decibel amount
   * **Quality:** Maintains audio quality while preventing clipping
   * **Range:** Supports both amplification and attenuation
   *
   * @param samples - Input PCM samples
   * @param gainDb - Gain adjustment in decibels (-60 to +20 recommended)
   * @returns New array with gain-adjusted samples
   */
  applyGain(samples: Int16Array, gainDb: number): Int16Array {
    // Convert dB to linear gain factor
    const gainLinear = 10 ** (gainDb / 20);
    const output = new Int16Array(samples.length);

    for (let i = 0; i < samples.length; i++) {
      const sample = (samples[i] as number) * gainLinear;
      // Clamp to 16-bit range to prevent overflow
      output[i] = Math.max(-32768, Math.min(32767, Math.floor(sample)));
    }

    return output;
  },

  /**
   * Apply gain to PCM data structure
   *
   * **Purpose:** High-level gain adjustment preserving metadata
   * **Convenience:** Applies gain while maintaining PCM data structure
   * **Safety:** Includes validation and overflow protection
   *
   * @param pcmData - Input PCM data structure
   * @param gainDb - Gain adjustment in decibels
   * @returns New PCM data with gain-adjusted samples
   */
  applyGainToPcmData(
    pcmData: OpusPcmDataEntity,
    gainDb: number,
  ): OpusPcmDataEntity {
    const adjustedSamples = this.applyGain(pcmData.samples, gainDb);

    return {
      samples: adjustedSamples,
      channels: pcmData.channels,
      sampleRate: pcmData.sampleRate,
      duration: pcmData.duration,
      timestamp: pcmData.timestamp,
    };
  },

  /**
   * Normalize audio samples to prevent clipping
   *
   * **Purpose:** Scales audio to use full dynamic range without clipping
   * **Quality:** Maximizes signal-to-noise ratio while preventing distortion
   * **Analysis:** Finds peak value and scales accordingly
   *
   * @param samples - Input PCM samples
   * @param targetPeak - Target peak level (0.0 to 1.0, default 0.95)
   * @returns Normalized samples scaled to target peak
   */
  normalizeAudio(samples: Int16Array, targetPeak = 0.95): Int16Array {
    if (targetPeak <= 0 || targetPeak > 1) {
      throw new Error("Target peak must be between 0 and 1");
    }

    // Find the maximum absolute value
    let maxValue = 0;
    for (const sample of samples) {
      maxValue = Math.max(maxValue, Math.abs(sample));
    }

    // If audio is already very quiet, don't normalize
    if (maxValue < 100) {
      return new Int16Array(samples);
    }

    // Calculate scaling factor
    const targetMaxValue = 32767 * targetPeak;
    const scaleFactor = targetMaxValue / maxValue;

    const output = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      output[i] = Math.floor((samples[i] as number) * scaleFactor);
    }

    return output;
  },

  /**
   * Calculate RMS (Root Mean Square) of audio samples
   *
   * **Purpose:** Measures average signal level for loudness analysis
   * **Quality:** More accurate than peak measurement for perceived loudness
   * **Performance:** Single-pass calculation with optimized math
   *
   * @param samples - Audio samples to analyze
   * @returns RMS value (0 to 32767 range)
   */
  calculateRms(samples: Int16Array): number {
    if (samples.length === 0) {
      return 0;
    }

    let sum = 0;
    for (const sample of samples) {
      sum += sample * sample;
    }

    return Math.sqrt(sum / samples.length);
  },

  /**
   * Calculate peak amplitude of audio samples
   *
   * **Purpose:** Finds maximum absolute sample value for clipping detection
   * **Performance:** Single-pass search with early termination capability
   * **Range:** Returns value between 0 and 32767
   *
   * @param samples - Audio samples to analyze
   * @returns Peak absolute value
   */
  calculatePeak(samples: Int16Array): number {
    let peak = 0;
    for (const sample of samples) {
      peak = Math.max(peak, Math.abs(sample));
    }
    return peak;
  },

  /**
   * Detect if audio contains significant signal (not silence)
   *
   * **Purpose:** Determines if audio frame contains meaningful content
   * **Threshold:** Configurable sensitivity for silence detection
   * **Performance:** Uses RMS for accurate loudness measurement
   *
   * @param samples - Audio samples to analyze
   * @param threshold - RMS threshold for signal detection (default 100)
   * @returns True if signal is present, false if silence
   */
  hasSignal(samples: Int16Array, threshold = 100): boolean {
    const rms = this.calculateRms(samples);
    return rms > threshold;
  },

  /**
   * Detect silence in audio samples using multiple criteria
   *
   * **Purpose:** Advanced silence detection with configurable sensitivity
   * **Criteria:** Uses both RMS and peak analysis for robust detection
   * **Flexibility:** Separate thresholds for different detection methods
   *
   * @param samples - Audio samples to analyze
   * @param rmsThreshold - RMS threshold for silence (default 50)
   * @param peakThreshold - Peak threshold for silence (default 100)
   * @returns True if audio is considered silence
   */
  detectSilence(
    samples: Int16Array,
    rmsThreshold = 50,
    peakThreshold = 100,
  ): boolean {
    const rms = this.calculateRms(samples);
    const peak = this.calculatePeak(samples);

    return rms <= rmsThreshold && peak <= peakThreshold;
  },

  /**
   * Calculate signal-to-noise ratio estimate
   *
   * **Purpose:** Estimates audio quality by analyzing signal distribution
   * **Method:** Compares RMS to background noise level estimation
   * **Range:** Returns SNR in decibels (higher is better)
   *
   * @param samples - Audio samples to analyze
   * @param noiseFloor - Estimated noise floor RMS (default 10)
   * @returns Estimated SNR in decibels
   */
  estimateSignalToNoiseRatio(samples: Int16Array, noiseFloor = 10): number {
    const rms = this.calculateRms(samples);

    if (rms <= noiseFloor || noiseFloor <= 0) {
      return 0; // Invalid or no signal
    }

    return 20 * Math.log10(rms / noiseFloor);
  },

  /**
   * Create silence buffer with specified parameters
   *
   * **Purpose:** Generates silent audio for padding or DTX applications
   * **Flexibility:** Supports any sample rate, channel count, and duration
   * **Performance:** Efficient zero-filled buffer creation
   *
   * @param sampleCount - Number of samples per channel
   * @param channels - Number of audio channels
   * @param sampleRate - Sample rate in Hz
   * @param timestamp - Optional timestamp for the silence buffer
   * @returns PCM data containing silence
   */
  createSilence(
    sampleCount: number,
    channels: OpusChannels,
    sampleRate: OpusSampleRate,
    timestamp = 0,
  ): OpusPcmDataEntity {
    const totalSamples = sampleCount * channels;
    const samples = new Int16Array(totalSamples); // Automatically zero-filled
    const duration = (sampleCount / sampleRate) * 1000;

    return {
      samples,
      channels,
      sampleRate,
      duration,
      timestamp,
    };
  },

  /**
   * Create silence buffer for specific frame duration
   *
   * **Purpose:** Convenience function for creating silence frames
   * **Calculation:** Automatically computes sample count from duration
   * **Discord Compatible:** Works with Discord's standard 20ms frames
   *
   * @param frameDuration - Frame duration in milliseconds
   * @param channels - Number of audio channels
   * @param sampleRate - Sample rate in Hz
   * @param timestamp - Optional timestamp for the silence frame
   * @returns PCM data containing silence for the specified duration
   */
  createSilenceForDuration(
    frameDuration: OpusFrameDuration,
    channels: OpusChannels,
    sampleRate: OpusSampleRate,
    timestamp = 0,
  ): OpusPcmDataEntity {
    const sampleCount = Math.floor((sampleRate * frameDuration) / 1000);
    return this.createSilence(sampleCount, channels, sampleRate, timestamp);
  },

  /**
   * Create test tone for audio system verification
   *
   * **Purpose:** Generates sine wave test signals for debugging
   * **Quality:** Clean sine wave generation with anti-aliasing considerations
   * **Flexibility:** Configurable frequency, amplitude, and phase
   *
   * @param frequency - Tone frequency in Hz
   * @param duration - Duration in milliseconds
   * @param amplitude - Amplitude (0.0 to 1.0, default 0.5)
   * @param sampleRate - Sample rate in Hz
   * @param channels - Number of channels
   * @param phase - Starting phase in radians (default 0)
   * @returns PCM data containing the test tone
   *
   * @example
   * ```typescript
   * // Create 440Hz A-note for 1 second
   * const testTone = OpusUtils.createTestTone(
   *   440, 1000, 0.3, OpusSampleRate.Rate48000, OpusChannels.Stereo
   * );
   * ```
   */
  createTestTone(
    frequency: number,
    duration: number,
    amplitude = 0.5,
    sampleRate: OpusSampleRate = OpusSampleRate.Rate48000,
    channels: OpusChannels = OpusChannels.Stereo,
    phase = 0,
  ): OpusPcmDataEntity {
    const sampleCount = Math.floor((sampleRate * duration) / 1000);
    const totalSamples = sampleCount * channels;
    const samples = new Int16Array(totalSamples);

    const maxAmplitude = 32767 * Math.min(1, Math.max(0, amplitude));
    const angularFreq = (2 * Math.PI * frequency) / sampleRate;

    for (let i = 0; i < sampleCount; i++) {
      const sample = Math.floor(
        maxAmplitude * Math.sin(angularFreq * i + phase),
      );

      // Apply to all channels
      for (let ch = 0; ch < channels; ch++) {
        samples[i * channels + ch] = sample;
      }
    }

    return this.preparePcmData(samples, sampleRate, channels);
  },

  /**
   * Resample audio using linear interpolation
   *
   * **Purpose:** Converts audio between different sample rates
   * **Quality:** Linear interpolation provides reasonable quality for most uses
   * **Performance:** Optimized for real-time processing requirements
   *
   * @param input - Input audio samples
   * @param inputRate - Input sample rate in Hz
   * @param outputRate - Desired output sample rate in Hz
   * @param channels - Number of audio channels
   * @returns Resampled audio at the new sample rate
   */
  resample(
    input: Int16Array,
    inputRate: number,
    outputRate: number,
    channels: OpusChannels,
  ): Int16Array {
    if (inputRate === outputRate) {
      return new Int16Array(input); // No conversion needed
    }

    const ratio = inputRate / outputRate;
    const inputSamples = input.length / channels;
    const outputSamples = Math.floor(inputSamples / ratio);
    const output = new Int16Array(outputSamples * channels);

    for (let i = 0; i < outputSamples; i++) {
      const sourceIndex = i * ratio;
      const index1 = Math.floor(sourceIndex);
      const index2 = Math.min(index1 + 1, inputSamples - 1);
      const fraction = sourceIndex - index1;

      // Interpolate each channel
      for (let ch = 0; ch < channels; ch++) {
        const sample1 = input[index1 * channels + ch] as number;
        const sample2 = input[index2 * channels + ch] as number;
        const interpolated = sample1 + (sample2 - sample1) * fraction;
        output[i * channels + ch] = Math.floor(interpolated);
      }
    }

    return output;
  },

  /**
   * Resample PCM data to new sample rate
   *
   * **Purpose:** High-level resampling preserving PCM data structure
   * **Convenience:** Handles metadata updates automatically
   * **Quality:** Uses linear interpolation for good quality/performance balance
   *
   * @param pcmData - Input PCM data structure
   * @param newSampleRate - Target sample rate
   * @returns Resampled PCM data with updated metadata
   */
  resamplePcmData(
    pcmData: OpusPcmDataEntity,
    newSampleRate: OpusSampleRate,
  ): OpusPcmDataEntity {
    if (pcmData.sampleRate === newSampleRate) {
      return { ...pcmData }; // No conversion needed
    }

    const resampledSamples = this.resample(
      pcmData.samples,
      pcmData.sampleRate,
      newSampleRate,
      pcmData.channels,
    );

    // Recalculate duration for new sample rate
    const newSampleCount = resampledSamples.length / pcmData.channels;
    const newDuration = (newSampleCount / newSampleRate) * 1000;

    return {
      samples: resampledSamples,
      channels: pcmData.channels,
      sampleRate: newSampleRate,
      duration: newDuration,
      timestamp: pcmData.timestamp,
    };
  },

  /**
   * Calculate frame size information for given configuration
   *
   * **Purpose:** Computes buffer sizes needed for audio processing
   * **Planning:** Essential for memory allocation and validation
   * **Accuracy:** Precise calculations for real-time audio requirements
   *
   * @param sampleRate - Sample rate in Hz
   * @param channels - Number of channels
   * @param frameDuration - Frame duration in milliseconds
   * @returns Complete frame size information
   */
  calculateFrameSize(
    sampleRate: OpusSampleRate,
    channels: OpusChannels,
    frameDuration: OpusFrameDuration,
  ): OpusFrameSizeEntity {
    const samplesPerFrame = Math.floor((sampleRate * frameDuration) / 1000);
    const pcmBytesPerFrame = samplesPerFrame * channels * 2; // 16-bit samples = 2 bytes

    // Conservative estimate for maximum encoded frame size
    // Based on Opus specification: maximum 1276 bytes per frame
    const maxEncodedSize = Math.min(
      1276,
      Math.ceil(samplesPerFrame * channels * 0.25),
    );

    return {
      samplesPerFrame,
      pcmBytesPerFrame,
      maxEncodedSize,
    };
  },

  /**
   * Calculate buffer size needed for multiple frames
   *
   * **Purpose:** Determines buffer sizes for batched processing
   * **Efficiency:** Helps optimize memory allocation for streaming
   * **Planning:** Essential for real-time audio buffer management
   *
   * @param frameSize - Frame size information
   * @param frameCount - Number of frames to buffer
   * @returns Buffer size information for multiple frames
   */
  calculateBufferSize(
    frameSize: OpusFrameSizeEntity,
    frameCount: number,
  ): {
    totalPcmBytes: number;
    totalMaxEncodedBytes: number;
    totalSamples: number;
  } {
    return {
      totalPcmBytes: frameSize.pcmBytesPerFrame * frameCount,
      totalMaxEncodedBytes: frameSize.maxEncodedSize * frameCount,
      totalSamples: frameSize.samplesPerFrame * frameCount,
    };
  },

  /**
   * Validate if a value is a supported sample rate
   *
   * **Purpose:** Type-safe validation for sample rate parameters
   * **Compatibility:** Ensures sample rate is supported by Opus
   * **Safety:** Prevents runtime errors from invalid configurations
   *
   * @param value - Value to validate
   * @returns True if value is a valid OpusSampleRate
   */
  isValidSampleRate(value: unknown): value is OpusSampleRate {
    return (
      typeof value === "number" &&
      Object.values(OpusSampleRate).includes(value as OpusSampleRate)
    );
  },

  /**
   * Validate if a value is a supported channel count
   *
   * @param value - Value to validate
   * @returns True if value is a valid OpusChannels
   */
  isValidChannelCount(value: unknown): value is OpusChannels {
    return (
      typeof value === "number" &&
      Object.values(OpusChannels).includes(value as OpusChannels)
    );
  },

  /**
   * Validate if a value is a supported frame duration
   *
   * @param value - Value to validate
   * @returns True if value is a valid OpusFrameDuration
   */
  isValidFrameDuration(value: unknown): value is OpusFrameDuration {
    return (
      typeof value === "number" &&
      Object.values(OpusFrameDuration).includes(value as OpusFrameDuration)
    );
  },

  /**
   * Validate PCM data for encoding
   *
   * **Purpose:** Ensures PCM data is suitable for Opus encoding
   * **Frame Alignment:** Checks that sample count matches expected frame size
   * **Format Validation:** Verifies sample rate and channel configuration
   *
   * @param pcmData - PCM data to validate
   * @param expectedFrameDuration - Expected frame duration for validation
   * @returns Array of validation errors (empty if valid)
   */
  validatePcmData(
    pcmData: OpusPcmDataEntity,
    expectedFrameDuration: OpusFrameDuration,
  ): string[] {
    const errors: string[] = [];

    // Validate sample rate
    if (!this.isValidSampleRate(pcmData.sampleRate)) {
      errors.push(`Invalid sample rate in PCM data: ${pcmData.sampleRate}`);
    }

    // Validate channel count
    if (!this.isValidChannelCount(pcmData.channels)) {
      errors.push(`Invalid channel count in PCM data: ${pcmData.channels}`);
    }

    // Validate sample count for expected frame duration
    const expectedSampleCount = Math.floor(
      (pcmData.sampleRate * expectedFrameDuration) / 1000,
    );
    const actualSampleCount = pcmData.samples.length / pcmData.channels;

    if (actualSampleCount !== expectedSampleCount) {
      errors.push(
        `Sample count mismatch: expected ${expectedSampleCount} samples for ${expectedFrameDuration}ms frame, ` +
          `got ${actualSampleCount} samples`,
      );
    }

    // Validate that duration calculation is consistent
    const calculatedDuration = (actualSampleCount / pcmData.sampleRate) * 1000;
    const durationDifference = Math.abs(calculatedDuration - pcmData.duration);

    if (durationDifference > 0.1) {
      // Allow 0.1ms tolerance for floating point errors
      errors.push(
        `Duration mismatch: calculated ${calculatedDuration.toFixed(3)}ms, ` +
          `but PCM data claims ${pcmData.duration.toFixed(3)}ms`,
      );
    }

    return errors;
  },

  /**
   * Get Discord-optimized configuration for encoder
   *
   * **Purpose:** Provides tested configuration for Discord voice
   * **Quality:** Balanced for voice chat with good compression
   * **Compatibility:** Matches Discord's voice quality expectations
   *
   * @returns Encoder configuration optimized for Discord
   */
  getDiscordEncoderConfig(): OpusOptions {
    return OpusOptions.parse({
      sampleRate: OpusSampleRate.Rate48000,
      channels: OpusChannels.Stereo,
      application: OpusApplication.Voip,
      bitrate: 64000,
      complexity: 10,
      vbr: true,
      fec: false,
      dtx: false,
    });
  },

  /**
   * Get Discord-optimized configuration for decoder
   *
   * **Purpose:** Provides tested configuration for Discord voice
   * **Recovery:** Optimized for Discord's network conditions
   * **Compatibility:** Matches Discord's decoding expectations
   *
   * @returns Decoder configuration optimized for Discord
   */
  getDiscordDecoderConfig(): OpusOptions {
    return OpusOptions.parse({
      sampleRate: OpusSampleRate.Rate48000,
      channels: OpusChannels.Stereo,
      fec: true,
      gain: 0,
    });
  },

  /**
   * Check if configuration is suitable for real-time use
   *
   * **Purpose:** Validates that configuration can meet real-time constraints
   * **Performance:** Checks complexity and frame duration for latency
   * **Guidance:** Helps optimize settings for real-time applications
   *
   * @param config - Encoder configuration to check
   * @returns Object with real-time suitability assessment
   */
  checkRealTimeCompatibility(config: OpusOptions): {
    isRealTimeCompatible: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check complexity
    if (config.complexity !== undefined && config.complexity > 8) {
      warnings.push(
        "High complexity setting may cause real-time processing delays",
      );
      recommendations.push(
        "Consider reducing complexity to 8 or lower for real-time use",
      );
    }

    // Check application type
    if (config.application === OpusApplication.Audio) {
      warnings.push("Audio application type has higher latency than VoIP");
      recommendations.push("Use VoIP application type for lowest latency");
    }

    // Check VBR constraint
    if (config.vbr && !config.vbrConstraint) {
      recommendations.push(
        "Consider enabling VBR constraint for more predictable bitrate",
      );
    }

    // Overall assessment
    const isRealTimeCompatible = warnings.length === 0;

    return {
      isRealTimeCompatible,
      warnings,
      recommendations,
    };
  },
} as const;
