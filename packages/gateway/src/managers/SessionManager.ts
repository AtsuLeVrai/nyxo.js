import type { Integer } from "@nyxjs/core";
import { formatUrl } from "@nyxjs/logger";
import type { GetGatewayBotJsonResponse } from "@nyxjs/rest";
import { ErrorCodes, GatewayError } from "../GatewayError.js";
import { BaseManager } from "./BaseManager.js";

interface SessionState {
    sequence: Integer | null;
    sessionId: string | null;
    resumeUrl: string | null;
}

interface SessionLimits {
    remaining: Integer;
    total: Integer;
    resetAfter: Integer;
    maxConcurrency: Integer;
    recommendedShards: Integer;
}

export class SessionManager extends BaseManager {
    static readonly DEFAULT_CONCURRENCY = 1;
    static readonly RATE_LIMIT_DELAY = 5000;

    #limits: SessionLimits | null = null;
    #state: SessionState = {
        sequence: null,
        sessionId: null,
        resumeUrl: null,
    };

    #isProcessing = false;
    #resetTimeout: NodeJS.Timeout | null = null;
    #acquireQueue: Array<() => Promise<void>> = [];

    get remaining(): number {
        return this.#limits?.remaining ?? 0;
    }

    get maxConcurrency(): number {
        return this.#limits?.maxConcurrency ?? SessionManager.DEFAULT_CONCURRENCY;
    }

    get shards(): Integer | null {
        return this.#limits?.recommendedShards ?? null;
    }

    get isReady(): boolean {
        return this.#limits !== null;
    }

    get sequence(): Integer | null {
        return this.#state.sequence;
    }

    get sessionId(): string | null {
        return this.#state.sessionId;
    }

    get resumeUrl(): string | null {
        return this.#state.resumeUrl;
    }

    updateSequence(sequence: Integer): void {
        try {
            this.#state.sequence = sequence;
        } catch (error) {
            const sessionError = new GatewayError("Failed to update sequence", ErrorCodes.SessionStateError, {
                details: { sequence },
                cause: error,
            });
            this.error(sessionError);
            throw sessionError;
        }
    }

    updateSession(sessionId: string, resumeUrl: string): void {
        try {
            this.#state.sessionId = sessionId;
            this.#state.resumeUrl = resumeUrl;
            this.debug("New session established", {
                sessionId,
                resumeUrl: formatUrl(resumeUrl),
            });
        } catch (error) {
            const sessionError = new GatewayError("Failed to update session", ErrorCodes.SessionStateError, {
                details: { sessionId, resumeUrl },
                cause: error,
            });
            this.error(sessionError);
            throw sessionError;
        }
    }

    canResume(): boolean {
        const { sessionId, sequence, resumeUrl } = this.#state;
        return Boolean(sessionId && sequence !== null && resumeUrl);
    }

    updateLimit(gateway: GetGatewayBotJsonResponse): void {
        try {
            const { session_start_limit: limit, shards } = gateway;

            const newLimits = {
                remaining: limit.remaining,
                total: limit.total,
                resetAfter: limit.reset_after,
                maxConcurrency: limit.max_concurrency,
                recommendedShards: shards,
            };

            if (this.#haveLimitsChanged(newLimits)) {
                this.debug("Session limits updated", {
                    remaining: newLimits.remaining,
                    total: newLimits.total,
                    maxConcurrency: newLimits.maxConcurrency,
                });
            }

            this.#limits = newLimits;
            this.#clearResetTimeout();
        } catch (error) {
            const sessionError = new GatewayError("Failed to update session limits", ErrorCodes.SessionStateError, {
                details: { gateway },
                cause: error,
            });
            this.error(sessionError);
            throw sessionError;
        }
    }

    async acquire(): Promise<void> {
        try {
            if (!this.isReady) {
                throw new GatewayError("Session manager not initialized", ErrorCodes.SessionNotInitialized);
            }

            if (this.remaining <= 0) {
                this.debug("Session limit reached, waiting for reset");
                await this.#waitForReset();
                return this.acquire();
            }

            await this.#addToQueue();
        } catch (error) {
            const sessionError = new GatewayError("Failed to acquire session", ErrorCodes.SessionAcquisitionError, {
                cause: error,
            });
            this.error(sessionError);
            throw sessionError;
        }
    }

    destroy(): void {
        try {
            this.#clearResetTimeout();
            const hadSession = Boolean(this.#state.sessionId);

            this.#resetState();

            if (hadSession) {
                this.debug("Session destroyed");
            }
        } catch (error) {
            const sessionError = new GatewayError("Error during session destruction", ErrorCodes.SessionStateError, {
                cause: error,
            });
            this.error(sessionError);
            throw sessionError;
        }
    }

    #haveLimitsChanged(newLimits: SessionLimits): boolean {
        return (
            !this.#limits ||
            this.#limits.remaining !== newLimits.remaining ||
            this.#limits.total !== newLimits.total ||
            this.#limits.maxConcurrency !== newLimits.maxConcurrency
        );
    }

    async #addToQueue(): Promise<void> {
        const acquirePromise = (): Promise<void> => {
            if (!this.#limits) {
                throw new GatewayError("Limits lost during acquisition", ErrorCodes.SessionStateError);
            }
            this.#limits.remaining--;
            return Promise.resolve();
        };

        this.#acquireQueue.push(acquirePromise);
        return this.#processQueue();
    }

    async #waitForReset(): Promise<void> {
        if (!this.#limits) {
            throw new GatewayError("Cannot wait for reset: limits not initialized", ErrorCodes.SessionStateError);
        }

        const { resetAfter, total } = this.#limits;

        try {
            await new Promise<void>((resolve, reject) => {
                this.#resetTimeout = setTimeout(() => {
                    if (!this.#limits) {
                        reject(new GatewayError("Session limits lost during reset", ErrorCodes.SessionResetError));
                        return;
                    }

                    this.#limits.remaining = total;
                    this.debug("Session limits reset", {
                        availableSessions: total,
                    });
                    resolve();
                }, resetAfter);
            });
        } catch (error) {
            const sessionError = new GatewayError("Failed to wait for session reset", ErrorCodes.SessionResetError, {
                cause: error,
            });
            this.error(sessionError);
            throw sessionError;
        }
    }

    async #processQueue(): Promise<void> {
        if (this.#isProcessing || this.#acquireQueue.length === 0) {
            return;
        }

        this.#isProcessing = true;

        try {
            while (this.#acquireQueue.length > 0) {
                const batchSize = Math.min(this.maxConcurrency, this.#acquireQueue.length);
                const batch = this.#acquireQueue.splice(0, batchSize);

                await Promise.all(
                    batch.map((fn) =>
                        fn().catch((error) => {
                            throw new GatewayError(
                                "Failed to acquire session in batch",
                                ErrorCodes.SessionAcquisitionError,
                                { cause: error },
                            );
                        }),
                    ),
                );

                if (this.#acquireQueue.length > 0) {
                    await new Promise((resolve) => setTimeout(resolve, SessionManager.RATE_LIMIT_DELAY));
                }
            }
        } catch (error) {
            const sessionError = new GatewayError("Queue processing failed", ErrorCodes.SessionQueueError, {
                cause: error,
            });
            this.error(sessionError);
            throw sessionError;
        } finally {
            this.#isProcessing = false;
        }
    }

    #resetState(): void {
        this.#state = {
            sequence: null,
            sessionId: null,
            resumeUrl: null,
        };
        this.#limits = null;
        this.#acquireQueue = [];
        this.#isProcessing = false;
    }

    #clearResetTimeout(): void {
        if (this.#resetTimeout) {
            clearTimeout(this.#resetTimeout);
            this.#resetTimeout = null;
        }
    }
}
