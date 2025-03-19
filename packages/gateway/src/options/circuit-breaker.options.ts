import { z } from "zod";
import { FailureType } from "../services/index.js";

/**
 * Configuration options for the circuit breaker
 */
export const CircuitBreakerOptions = z
  .object({
    /**
     * Number of consecutive failures before opening the circuit
     * @default 5
     */
    failureThreshold: z.number().int().positive().default(5),

    /**
     * Duration in milliseconds for which the circuit remains open
     * @default 30000 (30 seconds)
     */
    resetTimeout: z.number().int().positive().default(30000),

    /**
     * Multiplier for reset time after repeated failures
     * @default 2.0
     */
    resetTimeoutMultiplier: z.number().positive().default(2.0),

    /**
     * Maximum duration in milliseconds for the reset time
     * @default 300000 (5 minutes)
     */
    maxResetTimeout: z.number().int().positive().default(300000),

    /**
     * Configuration by failure type
     */
    failureTypeOptions: z
      .record(
        z.nativeEnum(FailureType),
        z.object({
          /**
           * Specific failure threshold for this failure type
           */
          threshold: z.number().int().positive().optional(),

          /**
           * Specific reset time for this failure type
           */
          resetTimeout: z.number().int().positive().optional(),

          /**
           * If true, this failure immediately opens the circuit
           */
          breakImmediately: z.boolean().default(false),
        }),
      )
      .default({}),
  })
  .strict()
  .readonly();

export type CircuitBreakerOptions = z.infer<typeof CircuitBreakerOptions>;
