import { z } from "zod/v4";
import type { VoiceGateway } from "../core/index.js";
import {
  SpeakingFlags,
  VoiceGatewayOpcode,
  type VoiceSpeakingEntity,
} from "../types/index.js";

/**
 * Speaking state information for a user in the voice channel.
 * Contains the current speaking status and associated metadata.
 */
export interface SpeakingState {
  /** Speaking flags indicating what type of audio is being transmitted */
  speaking: SpeakingFlags;
  /** Audio processing delay in milliseconds */
  delay: number;
  /** User's SSRC identifier for voice transmission */
  ssrc: number;
  /** Timestamp when the speaking state was last updated */
  lastUpdate: number;
}

/**
 * Zod schema for validating SpeakingManager configuration options.
 *
 * This schema ensures that all speaking manager configuration parameters
 * are properly validated according to Discord Voice Gateway requirements
 * and real-time voice communication best practices.
 */
export const SpeakingManagerOptions = z.object({
  /**
   * Default delay value for speaking payloads in milliseconds.
   *
   * Specifies the audio processing delay that should be reported to Discord's
   * voice servers. This value represents the latency introduced by audio
   * processing pipelines and should typically be set to 0 for bot applications
   * since they don't have the same audio processing overhead as human users.
   *
   * Discord uses this value for synchronization and echo cancellation purposes.
   * Higher values may be used for applications with significant audio processing
   * latency, but most Discord bots should use 0 for optimal performance.
   *
   * Valid range considerations:
   * - **0ms**: Recommended for bots (no processing delay)
   * - **0-20ms**: Typical for real-time applications
   * - **20-100ms**: Acceptable for non-critical applications
   * - **>100ms**: May cause noticeable audio synchronization issues
   *
   * @default 0
   * @minimum 0
   * @maximum 65535
   * @unit milliseconds
   */
  defaultDelay: z.number().int().min(0).max(65535).default(0),

  /**
   * Enable automatic speaking updates before voice transmission.
   *
   * When enabled, the speaking manager will automatically send speaking
   * payloads before voice data transmission begins. This ensures compliance
   * with Discord's protocol requirement that speaking payloads must be sent
   * before voice data to properly associate SSRC with speaking flags.
   *
   * Benefits of auto-update:
   * - **Protocol Compliance**: Ensures Discord requirements are met
   * - **Simplified API**: Reduces manual speaking state management
   * - **Error Prevention**: Prevents invalid SSRC errors from Discord
   * - **Seamless Experience**: Automatic handling of speaking transitions
   *
   * Disable this only if you need precise manual control over speaking
   * payloads or are implementing custom speaking state management logic.
   *
   * @default true
   */
  autoUpdate: z.boolean().default(false),

  /**
   * Minimum interval between speaking updates in milliseconds.
   *
   * Implements rate limiting for speaking state updates to prevent excessive
   * network traffic and comply with Discord's rate limiting policies. This
   * throttling mechanism ensures that rapid speaking state changes don't
   * overwhelm Discord's voice servers or consume unnecessary bandwidth.
   *
   * Throttling behavior:
   * - **Same State**: Duplicate speaking updates are automatically throttled
   * - **State Changes**: Legitimate state changes bypass throttling
   * - **Force Option**: Can be overridden with force parameter when needed
   * - **Reset on Success**: Throttle timer resets after each successful update
   *
   * Recommended values:
   * - **50-100ms**: Balanced performance and responsiveness
   * - **25-50ms**: High responsiveness for interactive applications
   * - **100-250ms**: Conservative approach for bandwidth-limited scenarios
   * - **>250ms**: May cause noticeable delays in speaking state updates
   *
   * @default 100
   * @minimum 0
   * @maximum 5000
   * @unit milliseconds
   */
  updateThrottle: z.number().int().min(0).max(5000).default(100),
});

/**
 * Inferred TypeScript type from the Zod schema.
 *
 * Use this type for function parameters, return values, and variable
 * declarations when working with validated speaking manager options.
 */
export type SpeakingManagerOptions = z.infer<typeof SpeakingManagerOptions>;

/**
 * Manager responsible for handling speaking state updates in Discord Voice Gateway.
 *
 * This manager handles the communication of speaking status to Discord's voice servers,
 * which is required before transmitting voice data. It manages speaking flags that indicate
 * what type of audio is being transmitted (microphone, soundshare, priority) and ensures
 * proper SSRC association for voice packets.
 *
 * ## Speaking Protocol Requirements
 *
 * Discord Voice Gateway requires that clients:
 * 1. **Send Speaking Payload**: Must send at least one speaking payload before voice transmission
 * 2. **SSRC Association**: Speaking payload associates SSRC with speaking flags
 * 3. **Flag Management**: Proper management of speaking flags for different audio types
 * 4. **Timing Compliance**: Speaking updates must be sent before voice data transmission
 *
 * ## Speaking Flags
 *
 * - **Microphone (1)**: Normal voice transmission from microphone input
 * - **Soundshare (2)**: Audio from applications, music, or system sounds
 * - **Priority (4)**: Priority speaker status (stage channels)
 * - **Combinations**: Flags can be combined (e.g., Microphone | Priority = 5)
 *
 * ## Use Cases
 *
 * - **Voice Transmission**: Required before sending any voice data
 * - **Audio Type Indication**: Communicate what type of audio is being sent
 * - **Priority Speaking**: Indicate priority speaker status in stage channels
 * - **Silence Periods**: Update flags when stopping voice transmission
 *
 * ## Performance Considerations
 *
 * - **Lightweight Operations**: Speaking updates have minimal overhead
 * - **Throttling**: Automatic throttling prevents excessive updates
 * - **State Caching**: Avoids redundant speaking payloads for same state
 * - **Real-time Updates**: Immediate updates for time-sensitive speaking changes
 *
 * @see {@link https://discord.com/developers/docs/topics/voice-connections#speaking}
 */
export class SpeakingManager {
  /**
   * Reference to the parent VoiceGateway instance.
   * @internal
   */
  readonly #gateway: VoiceGateway;

  /**
   * Manager configuration options.
   * @internal
   */
  readonly #options: SpeakingManagerOptions;

  /**
   * Current speaking state for the local user.
   * @internal
   */
  #state: SpeakingState | null = null;

  /**
   * Timestamp of the last speaking update sent.
   * Used for throttling to prevent excessive updates.
   * @internal
   */
  #lastUpdateSent = 0;

  /**
   * Whether a speaking payload has been sent for the current session.
   * Discord requires at least one speaking payload before voice transmission.
   * @internal
   */
  #initialSpeakingSent = false;

  /**
   * Creates a new SpeakingManager instance.
   *
   * @param gateway - The parent VoiceGateway instance
   * @param options - Configuration options for speaking management
   */
  constructor(gateway: VoiceGateway, options: SpeakingManagerOptions) {
    this.#gateway = gateway;
    this.#options = options;
  }

  /**
   * Gets the current speaking state for the local user.
   *
   * @returns Current speaking state, or null if not set
   */
  get currentState(): Readonly<SpeakingState> | null {
    return this.#state ? { ...this.#state } : null;
  }

  /**
   * Gets whether the initial speaking payload has been sent.
   *
   * Discord requires at least one speaking payload before voice transmission.
   * This property indicates if that requirement has been satisfied.
   *
   * @returns True if initial speaking payload has been sent
   */
  get hasInitialSpeaking(): boolean {
    return this.#initialSpeakingSent;
  }

  /**
   * Gets whether the user is currently speaking (any speaking flags set).
   *
   * @returns True if any speaking flags are currently active
   */
  get isSpeaking(): boolean {
    return this.#state !== null && this.#state.speaking !== SpeakingFlags.None;
  }

  /**
   * Gets whether microphone speaking is currently active.
   *
   * @returns True if microphone flag is set
   */
  get isMicrophoneSpeaking(): boolean {
    return (
      this.#state !== null &&
      (this.#state.speaking & SpeakingFlags.Microphone) !== 0
    );
  }

  /**
   * Gets whether soundshare is currently active.
   *
   * @returns True if soundshare flag is set
   */
  get isSoundsharing(): boolean {
    return (
      this.#state !== null &&
      (this.#state.speaking & SpeakingFlags.Soundshare) !== 0
    );
  }

  /**
   * Gets whether priority speaking is currently active.
   *
   * @returns True if priority flag is set
   */
  get isPrioritySpeaking(): boolean {
    return (
      this.#state !== null &&
      (this.#state.speaking & SpeakingFlags.Priority) !== 0
    );
  }

  /**
   * Updates the speaking state and sends it to Discord's voice server.
   *
   * This method is the primary interface for communicating speaking status changes
   * to Discord. It validates the speaking flags, applies throttling to prevent
   * excessive updates, and ensures the payload is properly formatted.
   *
   * ## Speaking Flag Guidelines
   *
   * - **Microphone**: Use for normal voice input from microphone
   * - **Soundshare**: Use for application audio, music, or system sounds
   * - **Priority**: Use for priority speakers in stage channels
   * - **None**: Use to indicate silence or stop speaking
   * - **Combinations**: Flags can be combined with bitwise OR
   *
   * ## Required Before Voice Transmission
   *
   * Discord requires at least one speaking payload before sending voice data.
   * Failure to send speaking payload will result in disconnection with invalid SSRC error.
   *
   * @param speaking - Speaking flags indicating audio type
   * @param ssrc - SSRC identifier for voice connection
   * @param delay - Audio processing delay in milliseconds (should be 0 for bots)
   * @param force - Whether to bypass throttling and send immediately
   * @throws {Error} If gateway not ready or speaking update fails
   */
  /**
   * Updates the speaking state and sends it to Discord's voice server.
   *
   * @param speaking - Speaking flags indicating audio type
   * @param ssrc - SSRC identifier for voice connection
   * @param delay - Audio processing delay in milliseconds (should be 0 for bots)
   * @param force - Whether to bypass throttling and send immediately
   * @throws {Error} If gateway not ready or speaking update fails
   */
  setSpeaking(
    speaking: SpeakingFlags,
    ssrc: number,
    delay?: number,
    force = false,
  ): void {
    if (!Number.isInteger(speaking) || speaking < 0 || speaking > 7) {
      throw new Error(
        `Invalid speaking flags: ${speaking}. Must be a valid SpeakingFlags value (0-7).`,
      );
    }

    if (!Number.isInteger(ssrc) || ssrc <= 0 || ssrc > 0xffffffff) {
      throw new Error(
        `Invalid SSRC: ${ssrc}. Must be a positive 32-bit unsigned integer.`,
      );
    }

    if (delay !== undefined) {
      if (!Number.isInteger(delay) || delay < 0 || delay > 65535) {
        throw new Error(
          `Invalid delay: ${delay}. Must be an integer between 0 and 65535 milliseconds.`,
        );
      }
    }

    const actualDelay = delay ?? this.#options.defaultDelay;
    const now = Date.now();

    // Check throttling unless forced
    if (!force && this.#shouldThrottle(now, speaking, ssrc, actualDelay)) {
      return;
    }

    try {
      if (!this.#gateway.isConnected) {
        throw new Error("Voice gateway not connected");
      }

      // Create speaking payload
      const speakingPayload: VoiceSpeakingEntity = {
        speaking,
        delay: actualDelay,
        ssrc,
      };

      // Send speaking update to voice gateway
      this.#gateway.send(VoiceGatewayOpcode.Speaking, speakingPayload);

      // Update internal state
      this.#state = {
        speaking,
        delay: actualDelay,
        ssrc,
        lastUpdate: now,
      };

      this.#lastUpdateSent = now;
      this.#initialSpeakingSent = true;
    } catch (error) {
      throw new Error(
        `Failed to update speaking state: ${(error as Error).message}`,
        { cause: error },
      );
    }
  }

  /**
   * Sets speaking state to microphone mode.
   *
   * Convenience method for setting microphone speaking mode with proper flags.
   * This is the most common speaking mode for voice communication.
   *
   * @param ssrc - SSRC identifier for voice connection
   * @param delay - Audio processing delay in milliseconds
   * @param force - Whether to bypass throttling
   */
  setMicrophoneSpeaking(ssrc: number, delay?: number, force = false): void {
    this.setSpeaking(SpeakingFlags.Microphone, ssrc, delay, force);
  }

  /**
   * Sets speaking state to soundshare mode.
   *
   * Convenience method for setting soundshare mode when transmitting application
   * audio, music, or system sounds instead of microphone input.
   *
   * @param ssrc - SSRC identifier for voice connection
   * @param delay - Audio processing delay in milliseconds
   * @param force - Whether to bypass throttling
   */
  setSoundshare(ssrc: number, delay?: number, force = false): void {
    this.setSpeaking(SpeakingFlags.Soundshare, ssrc, delay, force);
  }

  /**
   * Sets speaking state to priority mode.
   *
   * Convenience method for setting priority speaker status, typically used
   * in stage channels where priority speakers have elevated permissions.
   *
   * @param ssrc - SSRC identifier for voice connection
   * @param delay - Audio processing delay in milliseconds
   * @param force - Whether to bypass throttling
   */
  setPrioritySpeaking(ssrc: number, delay?: number, force = false): void {
    this.setSpeaking(SpeakingFlags.Priority, ssrc, delay, force);
  }

  /**
   * Stops speaking by setting flags to none.
   *
   * This method should be called when stopping voice transmission to properly
   * communicate the silence state to Discord's voice server.
   *
   * @param ssrc - SSRC identifier for voice connection
   * @param delay - Audio processing delay in milliseconds
   * @param force - Whether to bypass throttling
   */
  stopSpeaking(ssrc: number, delay?: number, force = false): void {
    this.setSpeaking(SpeakingFlags.None, ssrc, delay, force);
  }

  /**
   * Sends the required initial speaking payload.
   *
   * Discord requires at least one speaking payload before voice transmission.
   * This method ensures the initial payload is sent with appropriate flags
   * for the intended audio type.
   *
   * @param ssrc - SSRC identifier for voice connection
   * @param audioType - Type of audio that will be transmitted
   * @param delay - Audio processing delay in milliseconds
   */
  sendInitialSpeaking(
    ssrc: number,
    audioType: SpeakingFlags = SpeakingFlags.Microphone,
    delay?: number,
  ): void {
    if (this.#initialSpeakingSent) {
      return;
    }

    this.setSpeaking(audioType, ssrc, delay, true);
  }

  /**
   * Ensures that a speaking payload has been sent before allowing voice transmission.
   *
   * This method is used internally to enforce Discord's requirement that speaking
   * payloads must be sent before voice data transmission. It automatically sends
   * an initial speaking payload if none has been sent yet.
   *
   * @param ssrc - SSRC identifier for voice connection
   * @param audioType - Type of audio that will be transmitted
   * @throws {Error} If unable to send required speaking payload
   */
  ensureSpeakingBeforeTransmission(
    ssrc: number,
    audioType: SpeakingFlags = SpeakingFlags.Microphone,
  ): void {
    if (!this.#initialSpeakingSent) {
      this.sendInitialSpeaking(ssrc, audioType);
    }
  }

  /**
   * Resets the speaking manager state.
   *
   * This method clears all speaking state and resets flags. It should be called
   * when starting a new voice session or recovering from connection issues.
   */
  reset(): void {
    this.#state = null;
    this.#lastUpdateSent = 0;
    this.#initialSpeakingSent = false;
  }

  /**
   * Determines if a speaking update should be throttled.
   *
   * @param now - Current timestamp
   * @param speaking - Speaking flags
   * @param ssrc - SSRC value
   * @param delay - Delay value
   * @returns True if update should be throttled
   * @internal
   */
  #shouldThrottle(
    now: number,
    speaking: SpeakingFlags,
    ssrc: number,
    delay: number,
  ): boolean {
    // Don't throttle if no previous state
    if (!this.#state) {
      return false;
    }

    // Don't throttle if state actually changed
    if (
      this.#state.speaking !== speaking ||
      this.#state.ssrc !== ssrc ||
      this.#state.delay !== delay
    ) {
      return false;
    }

    // Throttle if within throttle interval
    return now - this.#lastUpdateSent < this.#options.updateThrottle;
  }
}
