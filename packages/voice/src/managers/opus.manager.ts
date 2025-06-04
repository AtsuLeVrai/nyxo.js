import { z } from "zod/v4";
import {
  OpusApplication,
  OpusBandwidth,
  OpusChannels,
  OpusFrameDuration,
  OpusSampleRate,
  OpusSignalType,
} from "../types/opus.types.js";

/**
 * Opus Configuration
 *
 * Complete configuration interface for Opus initialization and control.
 * These settings determine encoding quality, performance, and behavior.
 *
 * **Performance Tuning:** Adjust complexity and application type for optimal
 * balance between quality and computational requirements.
 */
export const OpusOptions = z.object({
  /**
   * Sample rate in Hz
   *
   * **Discord Standard:** 48000 Hz
   * **Range:** 8000, 12000, 16000, 24000, 48000 Hz
   * **Impact:** Higher rates allow better frequency response
   */
  sampleRate: z.enum(OpusSampleRate).default(OpusSampleRate.Rate48000),

  /**
   * Number of audio channels
   *
   * **Discord Standard:** 2 (stereo)
   * **Options:** 1 (mono) or 2 (stereo)
   * **Impact:** Stereo provides spatial audio but uses more bandwidth
   */
  channels: z.enum(OpusChannels).default(OpusChannels.Stereo),

  /**
   * Application type for optimization
   *
   * **Discord Recommended:** Voip for voice chat
   * **Options:** Voip, Audio, RestrictedLowDelay
   * **Impact:** Significantly affects encoding algorithms and quality
   */
  application: z.enum(OpusApplication).default(OpusApplication.Voip),

  /**
   * Target bitrate in bits per second
   *
   * **Discord Range:** 8000-128000 bps typically
   * **Voice Range:** 6000-40000 bps
   * **Music Range:** 64000-512000 bps
   * **Impact:** Higher bitrate = better quality but more bandwidth
   */
  bitrate: z.number().int().min(6000).max(512000).default(64000),

  /**
   * Maximum bandwidth to use
   *
   * **Default:** Auto (determined by bitrate and content)
   * **Options:** Narrowband to Fullband
   * **Impact:** Limits frequency range, affects quality
   */
  maxBandwidth: z.enum(OpusBandwidth).default(OpusBandwidth.Fullband),

  /**
   * Encoder complexity (0-10)
   *
   * **Default:** 10 (highest quality)
   * **Range:** 0 (fastest) to 10 (best quality)
   * **Impact:** Higher complexity = better quality but more CPU usage
   */
  complexity: z.number().int().min(0).max(10).default(10),

  /**
   * Signal type hint for optimization
   *
   * **Default:** Auto
   * **Options:** Auto, Voice, Music
   * **Impact:** Helps encoder choose appropriate algorithms
   */
  signal: z.enum(OpusSignalType).default(OpusSignalType.Auto),

  /**
   * Enable Variable Bitrate (VBR)
   *
   * **Default:** true
   * **Behavior:** Allows bitrate to vary based on content complexity
   * **Impact:** Better quality for same average bitrate
   */
  vbr: z.boolean().default(true),

  /**
   * Enable Constrained VBR
   *
   * **Default:** false
   * **Behavior:** VBR with stricter bitrate limits
   * **Impact:** More predictable bitrate than full VBR
   */
  vbrConstraint: z.boolean().default(false),

  /**
   * Enable Forward Error Correction (FEC)
   *
   * **Default:** false
   * **Behavior:** Adds redundancy for packet loss recovery
   * **Impact:** Better quality in lossy networks, increased bitrate
   */
  fec: z.boolean().default(false),

  /**
   * Enable Discontinuous Transmission (DTX)
   *
   * **Default:** false
   * **Behavior:** Reduces bitrate during silence
   * **Impact:** Bandwidth savings during quiet periods
   */
  dtx: z.boolean().default(false),

  /**
   * Packet loss percentage expectation (0-100)
   *
   * **Default:** 0
   * **Range:** 0-100 percent
   * **Impact:** Encoder adapts algorithms for expected loss rate
   */
  packetLossPerc: z.number().int().min(0).max(100).default(0),

  /**
   * Use in-band FEC
   *
   * **Default:** false
   * **Behavior:** Includes FEC data in the same stream
   * **Impact:** Better loss recovery with compatible decoders
   */
  inbandFec: z.boolean().default(false),

  /**
   * Prediction disabled
   *
   * **Default:** false
   * **Behavior:** Disables inter-frame prediction
   * **Impact:** Reduces quality but makes frames independent
   */
  predictionDisabled: z.boolean().default(false),

  /**
   * Frame duration in milliseconds
   *
   * **Auto-Detection:** Usually detected from packet timing
   * **Manual:** Can be set if auto-detection fails
   * **Impact:** Must match encoder frame duration
   */
  frameDuration: z.enum(OpusFrameDuration).default(OpusFrameDuration.Frame20ms),

  /**
   * Gain adjustment in dB
   *
   * **Default:** 0 dB (no adjustment)
   * **Range:** Typically -32768 to +32767 (1/256 dB units)
   * **Impact:** Adjusts output volume without quality loss
   */
  gain: z.number().int().min(-32768).max(32767).default(0),
});

export type OpusOptions = z.infer<typeof OpusOptions>;
