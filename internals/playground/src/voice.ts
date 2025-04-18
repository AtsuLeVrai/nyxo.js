import type { AudioSource } from "@nyxjs/voice";

/**
 * Options for continuous tone generation
 */
interface ContinuousToneOptions {
  /**
   * Frequency of the tone in Hz
   * @default 440 (A4 note)
   */
  frequency?: number;

  /**
   * Volume of the tone (0.0 to 1.0)
   * @default 0.5
   */
  volume?: number;

  /**
   * Duration of the tone in seconds
   * @default 60 (1 minute)
   */
  duration?: number;

  /**
   * Sample rate in Hz
   * @default 48000 (required by Discord)
   */
  sampleRate?: number;
}

/**
 * Creates an audio source that generates a continuous sine wave.
 * Useful for testing that the bot is correctly speaking in a voice channel.
 *
 * @param options - Configuration options for the tone
 * @returns An audio source usable by VoiceClient
 */
export function createContinuousToneSource(
  options: ContinuousToneOptions = {},
): AudioSource {
  // Default parameters
  const frequency = options.frequency ?? 440; // 440 Hz = A4 note
  const volume = options.volume ?? 0.5; // 50% volume
  const duration = options.duration ?? 60; // 1 minute
  const sampleRate = options.sampleRate ?? 48000; // 48 kHz (required by Discord)

  // Constants for wave generation
  const channels = 2; // Stereo (required by Discord)
  const bytesPerSample = 2; // 16 bits per sample
  const totalSamples = duration * sampleRate;

  // Current position in the generation
  let currentSample = 0;
  let playing = true;

  return {
    /**
     * Reads an audio segment from the source
     * @param frameSize Number of samples to read
     * @returns Buffer containing PCM data or null if the end is reached
     */
    async read(frameSize: number): Promise<Buffer | null> {
      // If we've reached the total duration or playback is stopped, return null
      if (currentSample >= totalSamples || !playing) {
        return null;
      }

      // Calculate the actual number of samples to generate
      const samplesToGenerate = Math.min(
        frameSize,
        totalSamples - currentSample,
      );

      // Create a buffer for PCM data (format: 16-bit, signed, little-endian)
      const buffer = Buffer.alloc(
        samplesToGenerate * channels * bytesPerSample,
      );

      // Generate the sine wave
      for (let i = 0; i < samplesToGenerate; i++) {
        // Calculate the sine wave value
        const sampleTime = (currentSample + i) / sampleRate;
        const value = Math.sin(2 * Math.PI * frequency * sampleTime) * volume;

        // Convert to 16-bit signed integer (-32768 to 32767)
        const intValue = Math.floor(value * 32767);

        // Write the value for both channels (stereo)
        const offset = i * channels * bytesPerSample;
        buffer.writeInt16LE(intValue, offset); // Left channel
        buffer.writeInt16LE(intValue, offset + bytesPerSample); // Right channel
      }

      // Update current position
      currentSample += samplesToGenerate;

      return buffer;
    },

    /**
     * Pauses tone generation
     */
    async pause(): Promise<void> {
      playing = false;
    },

    /**
     * Resumes tone generation
     */
    async resume(): Promise<void> {
      playing = true;
    },

    /**
     * Releases resources used by the source
     */
    async destroy(): Promise<void> {
      playing = false;
      currentSample = totalSamples; // Force the end of generation
    },
  };
}

/**
 * Creates a simple beep audio source that's more reliable for testing
 *
 * @param options - Configuration options
 * @returns An audio source usable by VoiceClient
 */
export function createSimpleBeepSource(
  options: {
    frequency?: number;
    duration?: number;
    volume?: number;
  } = {},
): AudioSource {
  // Default parameters
  const frequency = options.frequency ?? 440; // 440 Hz = A4 note
  const duration = options.duration ?? 3; // 3 seconds
  const volume = options.volume ?? 0.5; // 50% volume

  // Constants
  const sampleRate = 48000; // Required by Discord
  const channels = 2; // Stereo
  const bytesPerSample = 2; // 16 bits
  const totalSamples = sampleRate * duration;

  // Generate the entire audio buffer in advance
  const fullBuffer = Buffer.alloc(totalSamples * channels * bytesPerSample);

  // Fill the buffer with the sine wave
  for (let i = 0; i < totalSamples; i++) {
    const value = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * volume;
    const intValue = Math.floor(value * 32767);
    const pos = i * channels * bytesPerSample;

    fullBuffer.writeInt16LE(intValue, pos);
    fullBuffer.writeInt16LE(intValue, pos + bytesPerSample);
  }

  let position = 0;

  return {
    async read(frameSize: number): Promise<Buffer | null> {
      if (position >= fullBuffer.length) {
        return null;
      }

      const remaining = fullBuffer.length - position;
      const bytesToRead = Math.min(
        frameSize * channels * bytesPerSample,
        remaining,
      );
      const buffer = fullBuffer.slice(position, position + bytesToRead);

      position += bytesToRead;
      return buffer;
    },
  };
}

/**
 * Creates a very basic silent audio source that can be used to "ping" the voice connection
 * This is useful to test if the connection works at all without playing actual audio
 *
 * @param durationMs - Duration in milliseconds
 * @returns An audio source usable by VoiceClient
 */
export function createSilenceSource(durationMs = 3000): AudioSource {
  const sampleRate = 48000; // Required by Discord
  const channels = 2;
  const bytesPerSample = 2;
  const samplesPerMs = sampleRate / 1000;
  const totalSamples = Math.floor(samplesPerMs * durationMs);

  // Create silence buffer - all zeros
  const silenceBuffer = Buffer.alloc(1920 * channels * bytesPerSample); // 20ms frame

  let samplesRead = 0;

  return {
    async read(frameSize: number): Promise<Buffer | null> {
      if (samplesRead >= totalSamples) {
        return null;
      }

      samplesRead += frameSize;
      return silenceBuffer;
    },
  };
}

/**
 * Utility function to create a PCM silence buffer
 *
 * @param frameSize Number of samples
 * @param channels Number of channels (typically 2 for stereo)
 * @returns PCM buffer containing silence
 */
export function createSilenceBuffer(frameSize: number, channels = 2): Buffer {
  const bytesPerSample = 2; // 16 bits per sample
  return Buffer.alloc(frameSize * channels * bytesPerSample);
}
