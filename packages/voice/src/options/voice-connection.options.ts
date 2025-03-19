import { z } from "zod";
import { EncryptionMode } from "../types/index.js";

/**
 * Voice connection options
 */
export const VoiceConnectionOptions = z.object({
  /**
   * Auto reconnect on disconnect
   */
  autoReconnect: z.boolean().default(true),

  /**
   * Reconnection backoff schedule in milliseconds
   */
  backoffSchedule: z
    .array(z.number().int().min(0))
    .default([1000, 3000, 5000, 10000]),

  /**
   * Heartbeat settings
   */
  heartbeat: z
    .object({
      /**
       * Heartbeat interval in milliseconds
       * This is the base interval, actual interval is set by the server
       */
      interval: z.number().int().positive().default(41250),

      /**
       * Maximum number of missed heartbeats before reconnecting
       */
      maxMissed: z.number().int().positive().default(3),
    })
    .default({}),

  /**
   * Voice gateway version
   */
  gatewayVersion: z.number().int().positive().default(8),

  /**
   * Preferred encryption mode
   */
  preferredEncryption: z
    .nativeEnum(EncryptionMode)
    .default(EncryptionMode.AeadAes256GcmRtpsize),
});

export type VoiceConnectionOptions = z.infer<typeof VoiceConnectionOptions>;
