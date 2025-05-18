import type { Readable } from "node:stream";
import { Transform } from "node:stream";
import { EventEmitter } from "eventemitter3";
import prism from "prism-media";
import { z } from "zod";
import { SpeakingMode } from "../types/index.js";

/**
 * Zod schema for opus encoder/decoder options
 */
const OpusOptionsSchema = z
  .object({
    /**
     * Number of audio channels (1 for mono, 2 for stereo)
     * Discord recommends stereo for voice
     * @default 2
     */
    channels: z.number().int().min(1).max(2).default(2),

    /**
     * Audio sample rate in Hz
     * Discord requires 48kHz
     * @default 48000
     */
    rate: z.number().int().positive().default(48000),

    /**
     * Frame size in samples
     * Affects latency and quality
     * @default 960 (20ms at 48kHz)
     */
    frameSize: z.number().int().positive().default(960),
  })
  .default({});

/**
 * Zod schema for playback options
 */
const PlaybackOptionsSchema = z
  .object({
    /**
     * Volume level for audio playback
     * 1.0 is normal volume, 0.5 is half volume, etc.
     * @default 1.0
     */
    volume: z.number().positive().default(1.0),

    /**
     * Maximum number of buffered packets before dropping
     * Helps manage memory usage and latency
     * @default 50
     */
    maxBufferedPackets: z.number().int().positive().default(50),

    /**
     * Whether to automatically handle stream errors
     * @default true
     */
    handleErrors: z.boolean().default(true),

    /**
     * Whether to normalize audio (automatic volume adjustment)
     * @default false
     */
    normalize: z.boolean().default(false),
  })
  .default({});

/**
 * Zod schema for audio service options
 */
export const AudioServiceOptionsSchema = z
  .object({
    /**
     * SSRC (Synchronization Source) identifier for this client
     * Required and must be provided by Discord's voice server
     */
    ssrc: z.number().int().positive(),

    /**
     * Opus encoder/decoder options
     */
    opus: OpusOptionsSchema,

    /**
     * Playback options
     */
    playback: PlaybackOptionsSchema,

    /**
     * Number of silence frames to send when stopping audio
     * Prevents unintended Opus interpolation with subsequent transmissions
     * @default 5
     */
    silenceFrameCount: z.number().int().min(0).max(10).default(5),

    /**
     * Delay between silence frames in milliseconds
     * @default 20
     */
    silenceFrameDelay: z.number().int().positive().default(20),
  })
  .strict();

export type AudioServiceOptions = z.infer<typeof AudioServiceOptionsSchema>;

/**
 * Events emitted by the Audio Service
 */
export interface AudioServiceEvents {
  /**
   * Emitted when an Opus packet is ready to send
   * @param packet Opus encoded audio packet
   */
  packet: [packet: Buffer];

  /**
   * Emitted when the speaking state changes
   * @param speaking Speaking state flags
   */
  speaking: [speaking: number];

  /**
   * Emitted when playback of a stream starts
   * @param streamId Unique identifier for the stream
   */
  playbackStart: [streamId: string];

  /**
   * Emitted when playback of a stream completes
   * @param streamId Unique identifier for the stream
   */
  playbackEnd: [streamId: string];

  /**
   * Emitted when an error occurs during audio processing
   * @param error The error that occurred
   * @param streamId Optional identifier of the stream that caused the error
   */
  error: [error: Error, streamId?: string];

  /**
   * Emitted when audio packets are being dropped due to buffer overflow
   * @param count Number of packets dropped
   */
  packetsDropped: [count: number];

  /**
   * Emitted when audio statistics are updated
   * @param stats Audio statistics object
   */
  stats: [stats: AudioStats];
}

/**
 * Audio statistics tracking
 */
export interface AudioStats {
  /**
   * Number of packets sent
   */
  packetsSent: number;

  /**
   * Number of packets dropped
   */
  packetsDropped: number;

  /**
   * Average packet size in bytes
   */
  averagePacketSize: number;

  /**
   * Current audio sequence number
   */
  sequence: number;

  /**
   * Current audio timestamp
   */
  timestamp: number;

  /**
   * Current speaking state
   */
  speaking: number;

  /**
   * Number of active audio streams
   */
  activeStreams: number;
}

/**
 * Track information for an active audio stream
 */
export interface StreamTrack {
  /**
   * Unique identifier for the stream
   */
  id: string;

  /**
   * The readable stream providing audio data
   */
  stream: Readable;

  /**
   * The processing pipeline for this stream
   */
  pipeline: NodeJS.ReadWriteStream;

  /**
   * Volume level for this stream
   */
  volume: number;

  /**
   * Speaking mode for this stream
   */
  speakingMode: number;
}

/**
 * Volume transformer for adjusting audio volume
 */
export class VolumeTransformer extends Transform {
  /**
   * Volume level (1.0 = normal)
   */
  #volume: number;

  /**
   * Creates a new volume transformer
   * @param volume Initial volume level
   */
  constructor(volume = 1.0) {
    super({ readableObjectMode: true, writableObjectMode: true });
    this.#volume = volume;
  }

  /**
   * Gets the current volume level
   */
  get volume(): number {
    return this.#volume;
  }

  /**
   * Sets the volume level
   * @param volume New volume level
   */
  setVolume(volume: number): void {
    this.#volume = volume;
  }

  /**
   * Transforms audio data by adjusting volume
   */
  override _transform(
    chunk: Buffer,
    _: string,
    callback: (error: Error | null, data?: Buffer) => void,
  ): void {
    // Fast path for normal volume
    if (this.#volume === 1.0) {
      callback(null, chunk);
      return;
    }

    // Skip processing for silence
    if (
      chunk.length <= 3 &&
      chunk[0] === 0xf8 &&
      chunk[1] === 0xff &&
      chunk[2] === 0xfe
    ) {
      callback(null, chunk);
      return;
    }

    // Apply volume transformation for PCM data only (not opus packets)
    // This should be applied before encoding to opus
    if (chunk.length % 2 === 0) {
      const newChunk = Buffer.alloc(chunk.length);

      for (let i = 0; i < chunk.length; i += 2) {
        // Read 16-bit PCM sample
        const sample = chunk.readInt16LE(i);

        // Apply volume transformation
        const adjusted = Math.max(
          -32768,
          Math.min(32767, Math.floor(sample * this.#volume)),
        );

        // Write adjusted sample
        newChunk.writeInt16LE(adjusted, i);
      }

      callback(null, newChunk);
    } else {
      // Not PCM data, pass through
      callback(null, chunk);
    }
  }
}

/**
 * Audio Service for Voice connections
 *
 * Handles audio processing, encoding and decoding using Opus.
 * Manages PCM to Opus conversion and generates packets for sending to Discord.
 */
export class AudioService extends EventEmitter<AudioServiceEvents> {
  /**
   * Validated configuration options
   * @private
   */
  readonly #options: AudioServiceOptions;

  /**
   * SSRC (Synchronization Source) identifier for this client
   * @private
   */
  readonly #ssrc: number;

  /**
   * Number of audio channels
   * @private
   */
  readonly #channels: number;

  /**
   * Audio sample rate in Hz
   * @private
   */
  readonly #sampleRate: number;

  /**
   * Frame size in samples
   * @private
   */
  readonly #frameSize: number;

  /**
   * Current speaking state flags
   * @private
   */
  #speaking = 0;

  /**
   * Current audio sequence number
   * @private
   */
  #sequence = 0;

  /**
   * Current audio timestamp
   * @private
   */
  #timestamp = 0;

  /**
   * Opus encoder instance
   * @private
   */
  #opusEncoder: prism.opus.Encoder | null = null;

  /**
   * Opus decoder instance
   * @private
   */
  #opusDecoder: prism.opus.Decoder | null = null;

  /**
   * Active audio stream tracks
   * @private
   */
  readonly #streams = new Map<string, StreamTrack>();

  /**
   * Packet buffer for storing encoded opus packets
   * @private
   */
  readonly #packetBuffer: Buffer[] = [];

  /**
   * Packet buffer interval timer
   * @private
   */
  #packetInterval: NodeJS.Timeout | null = null;

  /**
   * Stats tracking for audio service
   * @private
   */
  readonly #stats: AudioStats = {
    packetsSent: 0,
    packetsDropped: 0,
    averagePacketSize: 0,
    sequence: 0,
    timestamp: 0,
    speaking: 0,
    activeStreams: 0,
  };

  /**
   * Whether the service has been initialized
   * @private
   */
  #initialized = false;

  /**
   * Whether the service is currently paused
   * @private
   */
  #paused = false;

  /**
   * Creates a new Audio Service
   *
   * @param options Configuration options for the audio service
   * @throws {Error} If options validation fails
   */
  constructor(options: AudioServiceOptions) {
    super();
    this.#options = options;

    this.#ssrc = this.#options.ssrc;
    this.#channels = this.#options.opus.channels;
    this.#sampleRate = this.#options.opus.rate;
    this.#frameSize = this.#options.opus.frameSize;

    // Calculate initial timestamp - Discord expects this to start at a random value
    this.#timestamp = Math.floor(Math.random() * 4294967296);

    // Update stats with initial values
    this.#stats.sequence = this.#sequence;
    this.#stats.timestamp = this.#timestamp;
    this.#stats.speaking = this.#speaking;
  }

  /**
   * Gets the SSRC for this audio service
   * @returns The SSRC identifier
   */
  get ssrc(): number {
    return this.#ssrc;
  }

  /**
   * Gets the current speaking state
   * @returns The current speaking flags
   */
  get speaking(): number {
    return this.#speaking;
  }

  /**
   * Gets the current sequence number
   * @returns The current audio sequence number
   */
  get sequence(): number {
    return this.#sequence;
  }

  /**
   * Gets the current timestamp
   * @returns The current audio timestamp
   */
  get timestamp(): number {
    return this.#timestamp;
  }

  /**
   * Gets the number of active audio streams
   * @returns The number of active streams
   */
  get activeStreams(): number {
    return this.#streams.size;
  }

  /**
   * Gets the current audio statistics
   * @returns Audio statistics object
   */
  get stats(): AudioStats {
    // Update stats before returning
    this.#stats.sequence = this.#sequence;
    this.#stats.timestamp = this.#timestamp;
    this.#stats.speaking = this.#speaking;
    this.#stats.activeStreams = this.#streams.size;

    return { ...this.#stats };
  }

  /**
   * Checks if the service is initialized
   * @returns True if initialized, false otherwise
   */
  get isInitialized(): boolean {
    return this.#initialized;
  }

  /**
   * Checks if audio playback is paused
   * @returns True if paused, false otherwise
   */
  get isPaused(): boolean {
    return this.#paused;
  }

  /**
   * Initializes the audio service
   *
   * Creates Opus encoder and decoder instances.
   * Must be called before any audio processing can begin.
   *
   * @returns This instance for method chaining
   * @throws {Error} If initialization fails
   */
  initialize(): this {
    // Skip if already initialized
    if (this.#initialized) {
      return this;
    }

    try {
      // Create Opus encoder for outgoing audio
      this.#opusEncoder = new prism.opus.Encoder({
        rate: this.#sampleRate,
        channels: this.#channels,
        frameSize: this.#frameSize,
      });

      // Create Opus decoder for incoming audio
      this.#opusDecoder = new prism.opus.Decoder({
        rate: this.#sampleRate,
        channels: this.#channels,
        frameSize: this.#frameSize,
      });

      // Start packet interval if buffer size > 0
      if (this.#options.playback.maxBufferedPackets > 0) {
        this.#startPacketInterval();
      }

      this.#initialized = true;
      return this;
    } catch (error) {
      throw new Error(
        `Failed to initialize audio service: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Updates the speaking state and emits an event
   *
   * @param speaking New speaking state flags
   * @returns This instance for method chaining
   */
  setSpeaking(speaking: number): this {
    // Only emit event if speaking state has changed
    if (this.#speaking !== speaking) {
      this.#speaking = speaking;
      this.emit("speaking", speaking);
      this.#stats.speaking = speaking;
    }

    return this;
  }

  /**
   * Plays audio from a stream
   *
   * The stream should provide PCM audio data that can be encoded to Opus.
   * Returns a unique ID that can be used to stop or manipulate this specific stream.
   *
   * @param stream Readable stream with PCM audio data
   * @param speakingMode Speaking mode flags to set while playing
   * @param streamOptions Additional options for this stream
   * @returns Promise with a unique stream ID that resolves when playback completes
   * @throws {Error} If the service is not initialized
   */
  playStream(
    stream: Readable,
    speakingMode = SpeakingMode.Microphone,
    streamOptions: {
      id?: string;
      volume?: number;
    } = {},
  ): Promise<string> {
    // Ensure audio service is initialized
    if (!(this.#initialized && this.#opusEncoder)) {
      throw new Error("Audio service not initialized; call initialize() first");
    }

    // Don't process if paused
    if (this.#paused) {
      throw new Error("Audio service is paused; call resume() first");
    }

    // Generate a unique ID for this stream if not provided
    const streamId =
      streamOptions.id ?? Math.random().toString(36).substring(2, 15);

    // Set volume to provided value or default
    const volume = streamOptions.volume ?? this.#options.playback.volume;

    return new Promise((resolve, reject) => {
      try {
        // Create volume transformer
        const volumeTransformer = new VolumeTransformer(volume);

        // Create Opus encoder for this stream
        const encoder = new prism.opus.Encoder({
          rate: this.#sampleRate,
          channels: this.#channels,
          frameSize: this.#frameSize,
        });

        // Update speaking state if needed
        this.#updateSpeakingFromStreams(speakingMode);

        // Store stream info
        this.#streams.set(streamId, {
          id: streamId,
          stream: stream,
          pipeline: encoder,
          volume: volume,
          speakingMode: speakingMode,
        });

        // Clean up function to remove stream
        const cleanup = (): void => {
          // Remove stream from collection
          this.#streams.delete(streamId);

          // Update speaking state
          this.#updateSpeakingFromStreams();

          // Clean up event listeners
          encoder.removeAllListeners();

          // Emit playback end event
          this.emit("playbackEnd", streamId);
        };

        // Process incoming audio data
        const onData = (opusPacket: Buffer): void => {
          // If paused, don't process packets
          if (this.#paused) {
            return;
          }

          // Add packet to buffer if buffering is enabled
          if (this.#options.playback.maxBufferedPackets > 0) {
            this.#addPacketToBuffer(opusPacket);
          } else {
            // Send packet immediately
            this.#sendPacket(opusPacket);
          }
        };

        // Handle stream end
        const onEnd = (): void => {
          this.#sendSilenceFrames()
            .then(() => {
              cleanup();
              resolve(streamId);
            })
            .catch((error) => {
              cleanup();
              reject(error);
            });
        };

        // Handle errors in the pipeline
        const onError = (error: Error): void => {
          if (this.#options.playback.handleErrors) {
            // Emit error but don't reject the promise
            this.emit("error", error, streamId);

            // Clean up and resolve
            cleanup();
            resolve(streamId);
          } else {
            // Reject with error
            cleanup();
            reject(error);
          }
        };

        // Attach listeners
        encoder.on("data", onData);
        encoder.on("end", onEnd);
        encoder.on("error", onError);

        // Emit playback start event
        this.emit("playbackStart", streamId);

        // Start the pipeline
        stream.pipe(volumeTransformer).pipe(encoder);
      } catch (error) {
        // Remove stream from collection
        this.#streams.delete(streamId);

        // Update speaking state
        this.#updateSpeakingFromStreams();

        // Reject with error
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Plays a Buffer containing PCM audio data
   * Converts the buffer to a stream and plays it
   *
   * @param buffer Buffer containing PCM audio data
   * @param speakingMode Speaking mode flags to use
   * @param options Additional options for playback
   * @returns Promise that resolves when playback completes
   */
  playPcmBuffer(
    buffer: Buffer,
    speakingMode = SpeakingMode.Microphone,
    options: {
      volume?: number;
    } = {},
  ): Promise<string> {
    // Create a readable stream from the buffer
    const stream = new Transform({
      readableObjectMode: true,
      transform(chunk, _, callback) {
        callback(null, chunk);
      },
    });

    // Push the buffer data and end the stream
    stream.push(buffer);
    stream.push(null);

    // Play the stream
    return this.playStream(stream, speakingMode, { volume: options.volume });
  }

  /**
   * Plays a single audio packet
   *
   * @param packet Opus audio packet to play
   * @param speakingMode Speaking mode flags to use for this packet
   */
  playOpusPacket(packet: Buffer, speakingMode = SpeakingMode.Microphone): void {
    // Ensure audio service is initialized
    if (!this.#initialized) {
      throw new Error("Audio service not initialized; call initialize() first");
    }

    // Don't process if paused
    if (this.#paused) {
      return;
    }

    // Set speaking state to active if needed
    if (!this.#speaking) {
      this.setSpeaking(speakingMode);
    }

    // Send packet
    if (this.#options.playback.maxBufferedPackets > 0) {
      this.#addPacketToBuffer(packet);
    } else {
      this.#sendPacket(packet);
    }
  }

  /**
   * Stops playback of a specific stream
   *
   * @param streamId ID of the stream to stop
   * @returns True if stream was found and stopped, false otherwise
   */
  stopStream(streamId: string): boolean {
    const streamTrack = this.#streams.get(streamId);
    if (streamTrack) {
      try {
        // Unpipe stream from pipeline
        streamTrack.stream.unpipe();

        // Remove from collection
        this.#streams.delete(streamId);

        // Update speaking state
        this.#updateSpeakingFromStreams();

        // Emit playback end event
        this.emit("playbackEnd", streamId);

        return true;
      } catch (error) {
        this.emit(
          "error",
          error instanceof Error ? error : new Error(String(error)),
          streamId,
        );
      }
    }

    return false;
  }

  /**
   * Stops all currently playing audio
   *
   * @returns This instance for method chaining
   */
  stopAllStreams(): this {
    // Get all stream IDs
    const streamIds = Array.from(this.#streams.keys());

    // Stop each stream
    for (const id of streamIds) {
      this.stopStream(id);
    }

    // Send silence frames to prevent Opus interpolation
    this.#sendSilenceFrames()
      .then(() => this.setSpeaking(0))
      .catch((error) =>
        this.emit(
          "error",
          error instanceof Error ? error : new Error(String(error)),
        ),
      );

    return this;
  }

  /**
   * Pauses all audio playback
   *
   * @returns This instance for method chaining
   */
  pause(): this {
    if (!this.#paused) {
      this.#paused = true;

      // Save current speaking state and set to silent
      if (this.#speaking !== 0) {
        this.setSpeaking(0);
      }
    }

    return this;
  }

  /**
   * Resumes paused audio playback
   *
   * @returns This instance for method chaining
   */
  resume(): this {
    if (this.#paused) {
      this.#paused = false;

      // Update speaking state from active streams
      this.#updateSpeakingFromStreams();
    }

    return this;
  }

  /**
   * Sets the volume for a specific stream
   *
   * @param streamId ID of the stream to adjust
   * @param volume New volume level (0.0-2.0)
   * @returns True if stream was found and volume adjusted, false otherwise
   */
  setStreamVolume(streamId: string, volume: number): boolean {
    const streamTrack = this.#streams.get(streamId);
    if (streamTrack && streamTrack.pipeline instanceof VolumeTransformer) {
      try {
        // Update volume in the transformer
        (streamTrack.pipeline as VolumeTransformer).setVolume(volume);

        // Update stored volume
        streamTrack.volume = volume;

        return true;
      } catch (error) {
        this.emit(
          "error",
          error instanceof Error ? error : new Error(String(error)),
          streamId,
        );
      }
    }

    return false;
  }

  /**
   * Sets global volume for all streams
   *
   * @param volume New volume level (0.0-2.0)
   * @returns This instance for method chaining
   */
  setGlobalVolume(volume: number): this {
    // Update volume for all active streams
    for (const [streamId, _track] of this.#streams.entries()) {
      this.setStreamVolume(streamId, volume);
    }

    // Update default volume in options
    this.#options.playback.volume = volume;

    return this;
  }

  /**
   * Decodes an Opus packet to PCM audio
   *
   * @param opusPacket Opus encoded audio packet
   * @returns Promise resolving to Buffer containing PCM audio data
   * @throws {Error} If the service is not initialized
   */
  decodeOpusPacket(opusPacket: Buffer): Promise<Buffer> {
    if (!(this.#initialized && this.#opusDecoder)) {
      throw new Error("Audio service not initialized; call initialize() first");
    }

    return new Promise((resolve, reject) => {
      try {
        // Create a one-time decoder instance for this packet
        const decoder = new prism.opus.Decoder({
          rate: this.#sampleRate,
          channels: this.#channels,
          frameSize: this.#frameSize,
        });

        // Collect decoded chunks
        const chunks: Buffer[] = [];

        // Listen for decoded data
        decoder.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        // Handle completion
        decoder.on("end", () => {
          // Combine all chunks into a single buffer
          resolve(Buffer.concat(chunks));
        });

        // Handle errors
        decoder.on("error", (error: Error) => {
          reject(new Error(`Failed to decode Opus packet: ${error.message}`));
        });

        // Write the packet to the decoder and end the stream
        decoder.write(opusPacket);
        decoder.end();
      } catch (error) {
        reject(
          new Error(
            `Failed to decode Opus packet: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }
    });
  }

  /**
   * Synchronously decodes an Opus packet to PCM audio
   * Note: This method is less efficient than the async version and should be used
   * only when synchronous operation is required
   *
   * @param opusPacket Opus encoded audio packet
   * @returns Buffer containing PCM audio data
   * @throws {Error} If decoding fails
   */
  decodeOpusPacketSync(opusPacket: Buffer): Buffer {
    if (!(this.#initialized && this.#opusDecoder)) {
      throw new Error("Audio service not initialized; call initialize() first");
    }

    try {
      // Create a temporary decoder
      const decoder = new prism.opus.Decoder({
        rate: this.#sampleRate,
        channels: this.#channels,
        frameSize: this.#frameSize,
      });

      // Use a synchronous approach with a dummy transform
      let resultBuffer: Buffer | null = null;

      // Create a simple transform to capture output
      const capture = new Transform({
        transform(chunk, _, callback) {
          resultBuffer = chunk;
          callback(null);
        },
      });

      // Connect the pipeline synchronously
      decoder.pipe(capture);

      // Write and end the stream
      decoder.write(opusPacket);
      decoder.end();

      // If we didn't get a result, throw an error
      if (!resultBuffer) {
        throw new Error("Failed to decode Opus packet: No data received");
      }

      return resultBuffer;
    } catch (error) {
      throw new Error(
        `Failed to decode Opus packet: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Cleans up resources used by the audio service
   *
   * Stops playback and destroys encoder/decoder instances.
   */
  destroy(): void {
    // Stop any packet processing interval
    if (this.#packetInterval) {
      clearInterval(this.#packetInterval);
      this.#packetInterval = null;
    }

    // Stop all streams
    this.stopAllStreams();

    // Clean up Opus encoder and decoder
    this.#opusEncoder = null;
    this.#opusDecoder = null;

    // Clear packet buffer
    this.#packetBuffer.length = 0;

    // Mark as uninitialized
    this.#initialized = false;

    // Clear all event listeners
    this.removeAllListeners();
  }

  /**
   * Sends silence frames to prevent Opus interpolation
   *
   * @returns Promise that resolves when all silence frames have been sent
   * @private
   */
  async #sendSilenceFrames(): Promise<void> {
    // Discord-compatible silence frame (3 bytes)
    const silenceFrame = Buffer.from([0xf8, 0xff, 0xfe]);

    // Use configured count and delay
    const { silenceFrameCount, silenceFrameDelay } = this.#options;

    // Don't send any frames if count is 0
    if (silenceFrameCount <= 0) {
      return;
    }

    // Send the specified number of silence frames
    for (let i = 0; i < silenceFrameCount; i++) {
      if (this.#options.playback.maxBufferedPackets > 0) {
        this.#addPacketToBuffer(silenceFrame);
      } else {
        this.#sendPacket(silenceFrame);
      }

      // Add a configurable delay between frames
      if (i < silenceFrameCount - 1 && silenceFrameDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, silenceFrameDelay));
      }
    }
  }

  /**
   * Adds a packet to the buffer
   *
   * @param packet Opus packet to buffer
   * @private
   */
  #addPacketToBuffer(packet: Buffer): void {
    // Check if buffer is full
    if (
      this.#packetBuffer.length >= this.#options.playback.maxBufferedPackets
    ) {
      // Drop oldest packet
      this.#packetBuffer.shift();
      this.#stats.packetsDropped++;
      this.emit("packetsDropped", 1);
    }

    // Add packet to buffer
    this.#packetBuffer.push(Buffer.from(packet));
  }

  /**
   * Starts the packet processing interval
   *
   * @private
   */
  #startPacketInterval(): void {
    // Clear any existing interval
    if (this.#packetInterval) {
      clearInterval(this.#packetInterval);
    }

    // Calculate interval based on frame size and sample rate
    // Frame size is in samples, so we need to convert to ms
    // 20ms = 960 samples at 48kHz
    const intervalMs = (this.#frameSize / this.#sampleRate) * 1000;

    // Set up the interval for packet sending
    this.#packetInterval = setInterval(() => {
      // Skip if paused or no packets
      if (this.#paused || this.#packetBuffer.length === 0) {
        return;
      }

      // Get the next packet from the buffer
      const packet = this.#packetBuffer.shift();
      if (packet) {
        // Send the packet
        this.#sendPacket(packet);
      }
    }, intervalMs);
  }

  /**
   * Sends a packet and updates sequence/timestamp
   *
   * @param packet Opus packet to send
   * @private
   */
  #sendPacket(packet: Buffer): void {
    // Emit the packet event for sending
    this.emit("packet", packet);

    // Update statistics
    this.#stats.packetsSent++;
    this.#stats.averagePacketSize =
      (this.#stats.averagePacketSize * (this.#stats.packetsSent - 1) +
        packet.length) /
      this.#stats.packetsSent;

    // Increment sequence and timestamp for next packet
    this.#sequence = (this.#sequence + 1) & 0xffff;
    this.#timestamp = (this.#timestamp + this.#frameSize) & 0xffffffff;

    // Emit stats update periodically (every 50 packets)
    if (this.#stats.packetsSent % 50 === 0) {
      this.emit("stats", this.stats);
    }
  }

  /**
   * Updates speaking state based on active streams
   *
   * @param newStreamSpeaking Optional speaking mode for a new stream
   * @private
   */
  #updateSpeakingFromStreams(newStreamSpeaking?: number): void {
    // If no streams and no new stream, set speaking to 0
    if (this.#streams.size === 0 && !newStreamSpeaking) {
      this.setSpeaking(0);
      return;
    }

    // Calculate combined speaking state from all streams
    let combinedSpeaking = newStreamSpeaking || 0;

    // Add all existing stream speaking modes
    for (const { speakingMode } of this.#streams.values()) {
      combinedSpeaking |= speakingMode;
    }

    // Update speaking state
    this.setSpeaking(combinedSpeaking);
  }
}
