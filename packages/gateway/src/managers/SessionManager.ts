import type { Integer } from "@nyxjs/core";
import { Logger, formatUrl } from "@nyxjs/logger";
import type { GetGatewayBotJsonResponse } from "@nyxjs/rest";
import type { Gateway } from "../Gateway.js";
import { BaseError, ErrorCodes } from "../errors/index.js";

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

export class SessionError extends BaseError {}

export class SessionManager {
    readonly #gateway: Gateway;
    #isProcessing = false;
    readonly #defaultConcurrency = 1;
    readonly #rateLimitDelay = 5000;
    #limits: SessionLimits | null = null;
    #resetTimeout: NodeJS.Timeout | null = null;
    #acquireQueue: Array<() => Promise<void>> = [];
    #state: SessionState = {
        sequence: null,
        sessionId: null,
        resumeUrl: null,
    };

    constructor(gateway: Gateway) {
        this.#gateway = gateway;
    }

    get remaining(): number {
        return this.#limits?.remaining ?? 0;
    }

    get maxConcurrency(): number {
        return this.#limits?.maxConcurrency ?? this.#defaultConcurrency;
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
            const sessionError = new SessionError("Failed to update sequence", ErrorCodes.SessionStateError, {
                sequence,
                error,
            });
            this.#emitError(sessionError);
            throw sessionError;
        }
    }

    updateSession(sessionId: string, resumeUrl: string): void {
        try {
            this.#state.sessionId = sessionId;
            this.#state.resumeUrl = resumeUrl;
            this.#emitDebug("New session established", { sessionId, resumeUrl: formatUrl(resumeUrl) });
        } catch (error) {
            const sessionError = new SessionError("Failed to update session", ErrorCodes.SessionStateError, {
                sessionId,
                resumeUrl,
                error,
            });
            this.#emitError(sessionError);
            throw sessionError;
        }
    }

    canResume(): boolean {
        const { sessionId, sequence, resumeUrl } = this.#state;
        return Boolean(sessionId && sequence !== null && resumeUrl);
    }

    updateLimit(gateway: GetGatewayBotJsonResponse): void {
        try {
            const { remaining, total, reset_after, max_concurrency } = gateway.session_start_limit;

            const limitsChanged =
                !this.#limits ||
                this.#limits.remaining !== remaining ||
                this.#limits.total !== total ||
                this.#limits.maxConcurrency !== max_concurrency;

            if (limitsChanged) {
                this.#emitDebug("Session limits updated", {
                    remaining,
                    total,
                    maxConcurrency: max_concurrency,
                });
            }

            this.#limits = {
                remaining,
                total,
                resetAfter: reset_after,
                maxConcurrency: max_concurrency,
                recommendedShards: gateway.shards,
            };

            if (this.#resetTimeout) {
                clearTimeout(this.#resetTimeout);
                this.#resetTimeout = null;
            }
        } catch (error) {
            const sessionError = new SessionError("Failed to update session limits", ErrorCodes.SessionStateError, {
                gateway,
                error,
            });
            this.#emitError(sessionError);
            throw sessionError;
        }
    }

    async acquire(): Promise<void> {
        try {
            if (!this.isReady) {
                throw new SessionError(
                    "Session manager not initialized with gateway info",
                    ErrorCodes.SessionNotInitialized,
                );
            }

            if (this.remaining <= 0) {
                this.#emitDebug("Session limit reached, waiting for reset");
                await this.#waitForReset();
                return this.acquire();
            }

            const acquirePromise = (): Promise<void> => {
                if (!this.#limits) {
                    throw new SessionError("Limits lost during acquisition", ErrorCodes.SessionStateError);
                }

                this.#limits.remaining--;
                return Promise.resolve();
            };

            this.#acquireQueue.push(acquirePromise);
            await this.#processQueue();
        } catch (error) {
            const sessionError =
                error instanceof SessionError
                    ? error
                    : new SessionError("Failed to acquire session", ErrorCodes.SessionAcquisitionError, { error });
            this.#emitError(sessionError);
            throw sessionError;
        }
    }

    destroy(): void {
        try {
            if (this.#resetTimeout) {
                clearTimeout(this.#resetTimeout);
                this.#resetTimeout = null;
            }

            const hadSession = Boolean(this.#state.sessionId);

            this.#state = {
                sequence: null,
                sessionId: null,
                resumeUrl: null,
            };

            this.#limits = null;
            this.#acquireQueue = [];
            this.#isProcessing = false;

            if (hadSession) {
                this.#emitDebug("Session destroyed");
            }
        } catch (error) {
            const sessionError = new SessionError(
                "Error during session manager destruction",
                ErrorCodes.SessionStateError,
                { error },
            );
            this.#emitError(sessionError);
        }
    }

    async #waitForReset(): Promise<void> {
        if (!this.#limits) {
            throw new SessionError("Cannot wait for reset: limits not initialized", ErrorCodes.SessionStateError);
        }

        const { resetAfter, total } = this.#limits;

        try {
            await new Promise<void>((resolve, reject) => {
                this.#resetTimeout = setTimeout(() => {
                    if (!this.#limits) {
                        reject(new SessionError("Session limits lost during reset wait", ErrorCodes.SessionResetError));
                        return;
                    }

                    this.#limits.remaining = total;
                    this.#emitDebug("Session limits reset", { availableSessions: total });
                    resolve();
                }, resetAfter);
            });
        } catch (error) {
            const sessionError =
                error instanceof SessionError
                    ? error
                    : new SessionError("Failed to wait for session reset", ErrorCodes.SessionResetError, { error });
            this.#emitError(sessionError);
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
                            throw new SessionError(
                                "Failed to acquire session in batch",
                                ErrorCodes.SessionAcquisitionError,
                                { error },
                            );
                        }),
                    ),
                );

                if (this.#acquireQueue.length > 0) {
                    await new Promise((resolve) => setTimeout(resolve, this.#rateLimitDelay));
                }
            }
        } catch (error) {
            const sessionError =
                error instanceof SessionError
                    ? error
                    : new SessionError("Queue processing failed", ErrorCodes.SessionQueueError, { error });
            this.#emitError(sessionError);
            throw sessionError;
        } finally {
            this.#isProcessing = false;
        }
    }

    #emitError(error: SessionError): void {
        this.#gateway.emit(
            "error",
            Logger.error(error.message, {
                component: "SessionManager",
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }

    #emitDebug(message: string, details?: Record<string, unknown>): void {
        this.#gateway.emit(
            "debug",
            Logger.debug(message, {
                component: "SessionManager",
                details,
            }),
        );
    }
}
