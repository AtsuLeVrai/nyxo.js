import { EventEmitter } from "eventemitter3";
import { z } from "zod";
import type { AudioPlayerService, AudioSource } from "../services/index.js";
import { AudioPlayerState } from "../services/index.js";
import { VoiceSpeakingFlags } from "../types/index.js";

/**
 * Types of transitions between audio sources in the queue
 */
export enum AudioTransitionType {
  /** No transition, immediate cut */
  None = "none",

  /** Fade out current source, then fade in new source */
  Crossfade = "crossfade",

  /** Silence between sources */
  Silence = "silence",
}

/**
 * Options for configuring audio queue behavior
 */
export const AudioQueueOptions = z.object({
  /**
   * Type of transition between audio sources
   * @default AudioTransitionType.None
   */
  transitionType: z
    .nativeEnum(AudioTransitionType)
    .default(AudioTransitionType.None),

  /**
   * Duration of transition in milliseconds
   * @default 1000
   */
  transitionDuration: z.number().int().min(0).max(5000).default(1000),

  /**
   * Automatically repeat the queue
   * @default false
   */
  loop: z.boolean().default(false),

  /**
   * Automatically shuffle the queue when repeated
   * @default false
   */
  shuffle: z.boolean().default(false),

  /**
   * Initial volume (0.0 to 1.0)
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
   * Interval in ms to check playback status
   * @default 500
   */
  statusCheckInterval: z.number().int().min(100).max(2000).default(500),
});

export type AudioQueueOptions = z.infer<typeof AudioQueueOptions>;

/**
 * Audio queue state
 */
export enum AudioQueueState {
  /** Queue inactive (no playback in progress) */
  Idle = "idle",

  /** Playback in progress */
  Playing = "playing",

  /** Playback paused */
  Paused = "paused",

  /** Transitioning between sources */
  Transitioning = "transitioning",
}

/**
 * Information about an audio source in the queue
 */
export interface QueuedAudio {
  /**
   * The audio source
   */
  source: AudioSource;

  /**
   * Unique identifier for this queue entry
   */
  id: string;

  /**
   * Custom metadata for this source
   */
  metadata?: Record<string, unknown>;
}

/**
 * Types of events emitted by the audio manager
 */
interface AudioManagerEvents {
  /**
   * Emitted when an audio source starts playing
   * @param queueItem The queue item being played
   * @param queuePosition Position in the queue (0-indexed)
   */
  start: [queueItem: QueuedAudio, queuePosition: number];

  /**
   * Emitted when an audio source finishes playing
   * @param queueItem The queue item that just finished
   */
  finish: [queueItem: QueuedAudio];

  /**
   * Emitted when the queue state changes
   * @param newState New state
   * @param oldState Old state
   */
  stateChange: [newState: AudioQueueState, oldState: AudioQueueState];

  /**
   * Emitted when the entire queue is finished
   */
  queueEnd: [];

  /**
   * Emitted when the queue is repeated
   * @param shuffled Indicates if the queue was shuffled
   */
  queueLoop: [shuffled: boolean];

  /**
   * Emitted when an error occurs in the manager
   * @param error The error that occurred
   */
  error: [error: Error];
}

/**
 * Manager responsible for audio sources and playback queue
 *
 * This class coordinates playing audio sources, manages a queue,
 * and controls transitions between sources. It provides a higher-level
 * interface for controlling audio in a Discord voice connection.
 *
 * Main features:
 * - Queue of audio sources with automatic playback
 * - Configurable transitions between sources (cuts, fades, silences)
 * - Playback controls (pause, resume, skip, loop)
 * - Volume and speaking flag management
 *
 * The audio manager is designed to work with AudioPlayerService
 * which handles actual playback and encoding via OpusService.
 */
export class AudioManager extends EventEmitter<AudioManagerEvents> {
  /**
   * Current queue state
   * @private
   */
  #state: AudioQueueState = AudioQueueState.Idle;

  /**
   * Queue of audio sources
   * @private
   */
  #queue: QueuedAudio[] = [];

  /**
   * Index of the currently playing source in the queue
   * @private
   */
  #currentIndex = -1;

  /**
   * Current volume (0.0 to 1.0)
   * @private
   */
  #volume = 1.0;

  /**
   * Configured options for this manager
   * @private
   */
  readonly #options: AudioQueueOptions;

  /**
   * Audio player service used to play sources
   * @private
   */
  readonly #player: AudioPlayerService;

  /**
   * Counter for generating unique IDs
   * @private
   */
  #idCounter = 0;

  /**
   * Status check interval
   * @private
   */
  #statusCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Creates a new audio manager
   *
   * @param player - Audio player service
   * @param options - Configuration options
   */
  constructor(player: AudioPlayerService, options: AudioQueueOptions) {
    super();

    this.#player = player;
    this.#options = options;
    this.#volume = this.#options.volume;

    // Start the status check interval
    this.#startStatusCheck();
  }

  /**
   * Gets the current queue state
   *
   * @returns The current state
   */
  get state(): AudioQueueState {
    return this.#state;
  }

  /**
   * Gets the complete audio source queue
   *
   * @returns The queue as an array (copy)
   */
  get queue(): QueuedAudio[] {
    return [...this.#queue];
  }

  /**
   * Gets the index of the currently playing source
   *
   * @returns The current index or -1 if no playback in progress
   */
  get currentIndex(): number {
    return this.#currentIndex;
  }

  /**
   * Gets the currently playing audio source
   *
   * @returns The current source or undefined if no playback in progress
   */
  get current(): QueuedAudio | undefined {
    if (this.#currentIndex >= 0 && this.#currentIndex < this.#queue.length) {
      return this.#queue[this.#currentIndex];
    }
    return undefined;
  }

  /**
   * Gets the current volume
   *
   * @returns The volume (0.0 to 1.0)
   */
  get volume(): number {
    return this.#volume;
  }

  /**
   * Sets the playback volume
   *
   * @param value - New volume (0.0 to 1.0)
   */
  set volume(value: number) {
    // Limit to valid range
    this.#volume = Math.max(0, Math.min(2, value));

    // Update player volume if playing
    if (
      this.#state === AudioQueueState.Playing ||
      this.#state === AudioQueueState.Paused
    ) {
      // Implement: apply volume to current source
    }
  }

  /**
   * Adds an audio source to the queue
   *
   * @param source - Audio source to add
   * @param metadata - Optional metadata for this source
   * @returns The unique ID assigned to this queue entry
   */
  async enqueue(
    source: AudioSource,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    // Generate a unique ID
    const id = this.#generateId();

    // Create the queue entry
    const queuedItem: QueuedAudio = { source, id, metadata };

    // Add to the queue
    this.#queue.push(queuedItem);

    // If it's the first source and we're idle, start playback
    if (this.#queue.length === 1 && this.#state === AudioQueueState.Idle) {
      await this.#playNext();
    }

    return id;
  }

  /**
   * Adds multiple audio sources to the queue
   *
   * @param sources - Array of sources to add
   * @returns Array of IDs assigned to the sources
   */
  async enqueueMultiple(
    sources: Array<
      AudioSource | { source: AudioSource; metadata?: Record<string, unknown> }
    >,
  ): Promise<string[]> {
    const ids: string[] = [];

    for (const item of sources) {
      if ("source" in item) {
        ids.push(await this.enqueue(item.source, item.metadata));
      } else {
        ids.push(await this.enqueue(item));
      }
    }

    return ids;
  }

  /**
   * Removes an audio source from the queue
   *
   * @param id - ID of the entry to remove
   * @returns true if the entry was found and removed
   */
  async remove(id: string): Promise<boolean> {
    const index = this.#queue.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    // If it's the currently playing source, skip to the next one
    if (index === this.#currentIndex) {
      return this.skip();
    }

    // Adjust current index if necessary
    if (index < this.#currentIndex) {
      this.#currentIndex--;
    }

    // Remove from the queue
    this.#queue.splice(index, 1);

    return true;
  }

  /**
   * Completely clears the queue and stops playback
   *
   * @returns A promise that resolves when the operation is complete
   */
  async clear(): Promise<void> {
    // Stop current playback
    await this.stop();

    // Clear the queue
    this.#queue = [];
    this.#currentIndex = -1;
  }

  /**
   * Starts or resumes queue playback
   *
   * @returns A promise that resolves when playback starts
   */
  async play(): Promise<void> {
    if (this.#state === AudioQueueState.Playing) {
      return;
    }

    if (this.#state === AudioQueueState.Paused) {
      // Resume paused playback
      await this.#player.resume();
      this.#setState(AudioQueueState.Playing);
      return;
    }

    // Start playback from the beginning
    if (this.#queue.length > 0) {
      this.#currentIndex = -1;
      await this.#playNext();
    }
  }

  /**
   * Pauses current playback
   *
   * @returns A promise that resolves when playback is paused
   */
  async pause(): Promise<void> {
    if (this.#state !== AudioQueueState.Playing) {
      return;
    }

    await this.#player.pause();
    this.#setState(AudioQueueState.Paused);
  }

  /**
   * Stops current playback and resets queue position
   *
   * @returns A promise that resolves when playback is stopped
   */
  async stop(): Promise<void> {
    if (this.#state === AudioQueueState.Idle) {
      return;
    }

    await this.#player.stop();
    this.#currentIndex = -1;
    this.#setState(AudioQueueState.Idle);
  }

  /**
   * Skips to the next source in the queue
   *
   * @returns true if playback advances to the next source, false if there is no next source
   */
  async skip(): Promise<boolean> {
    // If the queue is empty or we're idle, nothing to do
    if (this.#queue.length === 0 || this.#state === AudioQueueState.Idle) {
      return false;
    }

    // If we have a currently playing source, emit the finish event
    const current = this.current;
    if (current) {
      this.emit("finish", current);
    }

    // If we're already at the end of the queue
    if (this.#currentIndex >= this.#queue.length - 1) {
      // If looping is enabled, return to the beginning
      if (this.#options.loop) {
        // Shuffle if configured
        if (this.#options.shuffle) {
          this.shuffle();
        }

        this.#currentIndex = -1;
        await this.#playNext();

        this.emit("queueLoop", this.#options.shuffle);
        return true;
      }

      // Otherwise, stop playback
      await this.stop();
      this.emit("queueEnd");
      return false;
    }

    // Advance to the next source
    return this.#playNext();
  }

  /**
   * Returns to the previous source in the queue
   *
   * @returns true if playback returns to the previous source, false if there is no previous source
   */
  async previous(): Promise<boolean> {
    // If the queue is empty or we're idle, nothing to do
    if (this.#queue.length === 0 || this.#state === AudioQueueState.Idle) {
      return false;
    }

    // If we're at the beginning of the queue
    if (this.#currentIndex <= 0) {
      // If looping is enabled, go to the end
      if (this.#options.loop) {
        this.#currentIndex = this.#queue.length;
        await this.#playPrevious();
        return true;
      }

      return false;
    }

    // Go to the previous source
    return this.#playPrevious();
  }

  /**
   * Randomly shuffles the order of the queue
   * Does not change the currently playing source
   */
  shuffle(): void {
    // If the queue is empty or has only one item, nothing to do
    if (this.#queue.length <= 1) {
      return;
    }

    // Save the current source
    const current = this.current;

    // Shuffle the queue
    for (let i = this.#queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // @ts-expect-error This is a workaround for TypeScript's type inference
      [this.#queue[i], this.#queue[j]] = [this.#queue[j], this.#queue[i]];
    }

    // If a source was playing, restore its index
    if (current) {
      this.#currentIndex = this.#queue.findIndex(
        (item) => item.id === current.id,
      );
    }
  }

  /**
   * Enables or disables queue looping
   *
   * @param value - New loop state
   */
  setLoop(value: boolean): void {
    this.#options.loop = value;
  }

  /**
   * Enables or disables automatic shuffling on repeat
   *
   * @param value - New shuffle state
   */
  setShuffle(value: boolean): void {
    this.#options.shuffle = value;
  }

  /**
   * Sets the transition type between audio sources
   *
   * @param type - Transition type
   * @param duration - Transition duration in milliseconds
   */
  setTransition(type: AudioTransitionType, duration?: number): void {
    this.#options.transitionType = type;

    if (duration !== undefined) {
      this.#options.transitionDuration = duration;
    }
  }

  /**
   * Releases all resources used by this manager
   */
  async destroy(): Promise<void> {
    // Stop the status check
    this.#stopStatusCheck();

    // Stop playback
    await this.stop();
    this.#queue = [];

    // Remove event listeners
    this.removeAllListeners();
  }

  /**
   * Starts the status check interval
   * @private
   */
  #startStatusCheck(): void {
    // Stop any existing interval
    this.#stopStatusCheck();

    // Create a new interval
    this.#statusCheckInterval = setInterval(() => {
      this.#checkPlaybackStatus();
    }, this.#options.statusCheckInterval);
  }

  /**
   * Stops the status check interval
   * @private
   */
  #stopStatusCheck(): void {
    if (this.#statusCheckInterval) {
      clearInterval(this.#statusCheckInterval);
      this.#statusCheckInterval = null;
    }
  }

  /**
   * Checks playback status and reacts to changes
   * @private
   */
  #checkPlaybackStatus(): void {
    // If we're not playing, nothing to do
    if (this.#state !== AudioQueueState.Playing) {
      return;
    }

    // Check if the player is still playing
    if (this.#player.state === AudioPlayerState.Idle) {
      // The player has finished playback, move to the next source
      const current = this.current;
      if (current) {
        this.emit("finish", current);
      }

      this.skip().catch((error) => {
        this.emit(
          "error",
          new Error(
            `Error during automatic skip: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      });
    }
  }

  /**
   * Plays the next source in the queue
   *
   * @returns true if a new source started, false otherwise
   * @private
   */
  async #playNext(): Promise<boolean> {
    // If the queue is empty, nothing to do
    if (this.#queue.length === 0) {
      return false;
    }

    // Advance to the next source
    this.#currentIndex++;

    // Check if we've reached the end
    if (this.#currentIndex >= this.#queue.length) {
      this.#currentIndex = 0;

      // If looping is not enabled, stop
      if (!this.#options.loop) {
        await this.stop();
        this.emit("queueEnd");
        return false;
      }
    }

    // Get the source to play
    const item = this.#queue[this.#currentIndex] as QueuedAudio;

    // Update state
    this.#setState(AudioQueueState.Playing);

    // Start playback
    await this.#player.play(item.source);

    // Emit event
    this.emit("start", item, this.#currentIndex);

    return true;
  }

  /**
   * Plays the previous source in the queue
   *
   * @returns true if a new source started, false otherwise
   * @private
   */
  async #playPrevious(): Promise<boolean> {
    // If the queue is empty, nothing to do
    if (this.#queue.length === 0) {
      return false;
    }

    // Go back to the previous source
    this.#currentIndex--;

    // Check if we're before the beginning
    if (this.#currentIndex < 0) {
      this.#currentIndex = this.#queue.length - 1;

      // If looping is not enabled, stop
      if (!this.#options.loop) {
        this.#currentIndex = 0;
      }
    }

    // Get the source to play
    const item = this.#queue[this.#currentIndex] as QueuedAudio;

    // Update state
    this.#setState(AudioQueueState.Playing);

    // Start playback
    await this.#player.play(item.source);

    // Emit event
    this.emit("start", item, this.#currentIndex);

    return true;
  }

  /**
   * Updates the queue state and emits an event if changed
   *
   * @param newState - New state
   * @private
   */
  #setState(newState: AudioQueueState): void {
    if (this.#state === newState) {
      return;
    }

    const oldState = this.#state;
    this.#state = newState;

    this.emit("stateChange", newState, oldState);
  }

  /**
   * Generates a unique ID for a queue entry
   *
   * @returns Unique ID as a string
   * @private
   */
  #generateId(): string {
    this.#idCounter++;
    return `queue_${Date.now()}_${this.#idCounter}`;
  }
}
