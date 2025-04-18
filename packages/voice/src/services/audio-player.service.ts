import { z } from "zod";
import type { VoiceClient } from "../core/index.js";
import { VoiceSpeakingFlags } from "../types/index.js";
import type { OpusService } from "./opus.service.js";

/**
 * Possible states for the audio player
 */
export enum AudioPlayerState {
  /** No playback in progress */
  Idle = "idle",

  /** Playback paused */
  Paused = "paused",

  /** Playback in progress */
  Playing = "playing",

  /** In the process of stopping */
  Stopping = "stopping",
}

/**
 * Options for the audio player service
 */
export const AudioPlayerOptions = z.object({
  /**
   * Interval in milliseconds between audio packets
   * Discord uses 20ms frames as standard
   * @default 20
   */
  frameInterval: z.number().int().min(10).max(60).default(20),

  /**
   * Playback volume (0.0 to 1.0)
   * @default 1.0
   */
  volume: z.number().min(0).max(2).default(1.0),

  /**
   * Speaking flags to use for transmission
   * @default VoiceSpeakingFlags.Microphone
   */
  speakingFlags: z
    .nativeEnum(VoiceSpeakingFlags)
    .default(VoiceSpeakingFlags.Microphone),

  /**
   * Maximum number of silence packets to send after audio ends
   * Helps avoid abrupt cutoffs
   * @default 5
   */
  silencePacketsOnEnd: z.number().int().min(0).max(10).default(5),
});

export type AudioPlayerOptions = z.infer<typeof AudioPlayerOptions>;

/**
 * Interface for audio sources that can be played by AudioPlayer
 */
export interface AudioSource {
  /**
   * Reads an audio segment from the source
   * @param frameSize Number of samples to read
   * @returns A buffer containing PCM data or null if the end is reached
   */
  read(frameSize: number): Promise<Buffer | null>;

  /**
   * Informs the source that playback is paused
   */
  pause?(): Promise<void>;

  /**
   * Informs the source that playback is resumed
   */
  resume?(): Promise<void>;

  /**
   * Releases resources used by the source
   */
  destroy?(): Promise<void>;
}

/**
 * Service responsible for playing and processing audio streams
 *
 * This service handles playing audio streams, Opus encoding, and generating
 * audio packets at regular intervals for transmission via UDP.
 *
 * Main features:
 * - Playing various audio sources via the AudioSource interface
 * - Automatic PCM to Opus encoding
 * - Generating audio packets at regular intervals
 * - Playback control (pause, resume, stop)
 * - Smooth transitions with silence to avoid clicks
 *
 * This service is designed to work with the VoiceUDPService which
 * handles the actual transmission of audio packets via UDP.
 */
export class AudioPlayerService {
  /**
   * Current state of the audio player
   * @private
   */
  #state: AudioPlayerState = AudioPlayerState.Idle;

  /**
   * Currently playing audio source
   * @private
   */
  #currentSource: AudioSource | null = null;

  /**
   * Interval for audio packet playback
   * @private
   */
  #playbackInterval: NodeJS.Timeout | null = null;

  /**
   * Counter for silence packets after audio ends
   * @private
   */
  #silencePacketCounter = 0;

  /**
   * Voice client associated with this audio player
   * @private
   */
  readonly #voice: VoiceClient;

  /**
   * Opus service for audio encoding
   * @private
   */
  readonly #opusService: OpusService;

  /**
   * Configuration options for the audio player
   * @private
   */
  readonly #options: AudioPlayerOptions;

  /**
   * Opus-encoded silence frame, generated at initialization
   * @private
   */
  #silenceFrame: Buffer | null = null;

  /**
   * Creates a new instance of the audio player service
   *
   * @param voice - Voice client associated with this audio player
   * @param opusService - Initialized Opus service for encoding
   * @param options - Configuration options for the player
   */
  constructor(
    voice: VoiceClient,
    opusService: OpusService,
    options: AudioPlayerOptions,
  ) {
    this.#voice = voice;
    this.#opusService = opusService;
    this.#options = options;

    // Generate an encoded silence frame
    this.#generateSilenceFrame();
  }

  /**
   * Gets the current state of the audio player
   *
   * @returns The current player state
   */
  get state(): AudioPlayerState {
    return this.#state;
  }

  /**
   * Checks if the player is active (playing or paused)
   *
   * @returns true if the player is active
   */
  get isActive(): boolean {
    return (
      this.#state === AudioPlayerState.Playing ||
      this.#state === AudioPlayerState.Paused
    );
  }

  /**
   * Checks if the player can play audio
   *
   * @returns true if the player is ready to play audio
   */
  get canPlay(): boolean {
    return this.#opusService.isInitialized;
  }

  /**
   * Starts playing an audio source
   *
   * @param source - The audio source to play
   * @throws {Error} If playback is already in progress
   */
  async play(source: AudioSource): Promise<void> {
    // Check if the Opus service is initialized
    if (!this.canPlay) {
      throw new Error("Opus service is not initialized");
    }

    // Stop current playback if necessary
    if (this.isActive) {
      await this.stop();
    }

    // Set the new source and start playback
    this.#currentSource = source;
    this.#setState(AudioPlayerState.Playing);
    this.#startPlayback();
  }

  /**
   * Pauses current playback
   *
   * @throws {Error} If no playback is in progress
   */
  async pause(): Promise<void> {
    // Check if the Opus service is initialized
    if (!this.canPlay) {
      throw new Error("Opus service is not initialized");
    }

    if (this.#state !== AudioPlayerState.Playing) {
      throw new Error("No active playback to pause");
    }

    // Stop the playback interval
    if (this.#playbackInterval) {
      clearInterval(this.#playbackInterval);
      this.#playbackInterval = null;
    }

    // Inform the source if it supports pausing
    if (this.#currentSource?.pause) {
      await this.#currentSource.pause();
    }

    // Update state
    this.#setState(AudioPlayerState.Paused);
  }

  /**
   * Resumes paused playback
   *
   * @throws {Error} If playback is not paused
   */
  async resume(): Promise<void> {
    // Check if the Opus service is initialized
    if (!this.canPlay) {
      throw new Error("Opus service is not initialized");
    }

    if (this.#state !== AudioPlayerState.Paused) {
      throw new Error("Playback is not paused");
    }

    // Inform the source if it supports resuming
    if (this.#currentSource?.resume) {
      await this.#currentSource.resume();
    }

    // Update state and restart playback
    this.#setState(AudioPlayerState.Playing);
    this.#startPlayback();
  }

  /**
   * Stops current playback
   *
   * @returns A promise that resolves when playback is completely stopped
   */
  async stop(): Promise<void> {
    // Check if the Opus service is initialized
    if (!this.canPlay) {
      throw new Error("Opus service is not initialized");
    }

    // Ignore if already stopped or stopping
    if (
      this.#state === AudioPlayerState.Idle ||
      this.#state === AudioPlayerState.Stopping
    ) {
      return;
    }

    // Mark as stopping
    this.#setState(AudioPlayerState.Stopping);

    // Stop the playback interval
    if (this.#playbackInterval) {
      clearInterval(this.#playbackInterval);
      this.#playbackInterval = null;
    }

    // Release the source's resources if possible
    if (this.#currentSource?.destroy) {
      await this.#currentSource.destroy();
    }

    // Reset state
    this.#currentSource = null;
    this.#silencePacketCounter = 0;
    this.#setState(AudioPlayerState.Idle);
  }

  /**
   * Cleans up resources used by the service
   */
  async destroy(): Promise<void> {
    await this.stop();

    this.#silenceFrame = null;
  }

  /**
   * Updates the player state and emits an event
   *
   * @param newState - New state to set
   * @private
   */
  #setState(newState: AudioPlayerState): void {
    this.#state = newState;
  }

  /**
   * Starts the interval for playing audio packets
   * @private
   */
  #startPlayback(): void {
    // Ensure there's no existing interval
    if (this.#playbackInterval) {
      clearInterval(this.#playbackInterval);
    }

    // Create a new interval at the configured frequency
    this.#playbackInterval = setInterval(
      () => this.#processNextFrame(),
      this.#options.frameInterval,
    );
  }

  /**
   * Processes the next audio frame to send
   * @private
   */
  async #processNextFrame(): Promise<void> {
    try {
      // Check if playback is active
      if (this.#state !== AudioPlayerState.Playing || !this.#currentSource) {
        return;
      }

      // Read the next frame from the source
      const frameData = await this.#currentSource.read(
        this.#opusService.frameSize,
      );

      if (frameData) {
        // Reset silence counter if we have audio data
        this.#silencePacketCounter = 0;

        // Encode PCM data to Opus
        const opusData = this.#opusService.encode(frameData);

        // Send the encoded audio packet directly to the voice client
        this.#voice.sendAudioPacket(opusData, this.#options.speakingFlags);
      }

      // Source exhausted, send silence packets to end properly
      if (
        !frameData &&
        this.#silencePacketCounter < this.#options.silencePacketsOnEnd &&
        this.#silenceFrame
      ) {
        // Send a silence packet
        this.#voice.sendAudioPacket(
          this.#silenceFrame,
          this.#options.speakingFlags,
        );
        this.#silencePacketCounter++;
      } else if (!frameData) {
        // End of playback
        await this.stop();
      }
    } catch (error) {
      // Emit the error and continue
      this.#voice.emit(
        "error",
        new Error(
          `Error processing audio frame: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }
  }

  /**
   * Generates an Opus-encoded silence frame
   * @private
   */
  #generateSilenceFrame(): void {
    try {
      // Create a PCM buffer filled with zeros (silence)
      const frameSize = this.#opusService.frameSize;
      const channels = 2; // Stereo
      const bytesPerSample = 2; // 16 bits per sample

      const silenceBuffer = Buffer.alloc(frameSize * channels * bytesPerSample);

      // Encode the silence to Opus
      this.#silenceFrame = this.#opusService.encode(silenceBuffer);
    } catch (_error) {
      // Ignore the error, silence will be generated on demand
      this.#silenceFrame = null;
    }
  }
}
