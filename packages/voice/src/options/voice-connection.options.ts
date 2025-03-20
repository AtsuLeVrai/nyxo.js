import { z } from "zod";
import { EncryptionMode, VoiceGatewayVersion } from "../types/index.js";

/**
 * Voice heartbeat configuration options
 */
export const VoiceHeartbeatOptions = z.object({
  /**
   * Heartbeat interval in milliseconds
   * This is the base interval, actual interval is set by the server
   * @default 41250
   */
  interval: z.number().int().positive().default(41250),

  /**
   * Maximum number of missed heartbeats before reconnecting
   * @default 3
   */
  maxMissed: z.number().int().positive().default(3),
});

export type VoiceHeartbeatOptions = z.infer<typeof VoiceHeartbeatOptions>;

/**
 * Voice connection options
 */
export const VoiceConnectionOptions = z.object({
  /**
   * Auto reconnect on disconnect
   * When true, the client will automatically attempt to reconnect after
   * connection failures or disconnects.
   * @default true
   */
  autoReconnect: z.boolean().default(true),

  /**
   * Reconnection backoff schedule in milliseconds
   * These values determine the wait time between reconnection attempts
   * in case of connection failures.
   * @default [1000, 3000, 5000, 10000]
   */
  backoffSchedule: z
    .array(z.number().int().min(0))
    .default([1000, 3000, 5000, 10000]),

  /**
   * Heartbeat settings
   * Controls the behavior of the connection heartbeat system.
   */
  heartbeat: VoiceHeartbeatOptions.default({}),

  /**
   * Voice gateway version
   * @default 8
   */
  gatewayVersion: z
    .nativeEnum(VoiceGatewayVersion)
    .default(VoiceGatewayVersion.V8),

  /**
   * Preferred encryption mode
   * Please note that as of November 18, 2024, only aead_aes256_gcm_rtpsize and
   * aead_xchacha20_poly1305_rtpsize will be supported by Discord.
   * @default EncryptionMode.AeadAes256GcmRtpsize
   */
  preferredEncryption: z
    .nativeEnum(EncryptionMode)
    .default(EncryptionMode.AeadAes256GcmRtpsize)
    .refine(
      (mode) =>
        mode === EncryptionMode.AeadAes256GcmRtpsize ||
        mode === EncryptionMode.AeadXChaCha20Poly1305Rtpsize,
      {
        message:
          "Only aead_aes256_gcm_rtpsize and aead_xchacha20_poly1305_rtpsize encryption modes will be supported by Discord after November 18, 2024.",
      },
    ),
});

export type VoiceConnectionOptions = z.infer<typeof VoiceConnectionOptions>;
