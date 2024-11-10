import type { Integer } from "@nyxjs/core";
import { Logger } from "@nyxjs/logger";
import type { GetGatewayBotJsonResponse } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import type { GatewayEvents } from "../types/index.js";

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

export enum SessionErrorCode {
    NotInitialized = "SESSION_NOT_INITIALIZED",
    LimitExceeded = "SESSION_LIMIT_EXCEEDED",
    AcquisitionError = "SESSION_ACQUISITION_ERROR",
    QueueProcessingError = "QUEUE_PROCESSING_ERROR",
    ResetError = "SESSION_RESET_ERROR",
    StateError = "SESSION_STATE_ERROR",
}

export class SessionError extends Error {
    code: SessionErrorCode;
    details?: Record<string, unknown>;

    constructor(message: string, code: SessionErrorCode, details?: Record<string, unknown>, cause?: Error) {
        super(message);
        this.name = "SessionError";
        this.code = code;
        this.details = details;
        this.cause = cause;
    }
}

export class SessionManager extends EventEmitter<Pick<GatewayEvents, "error" | "debug" | "warn">> {
    #defaultConcurrency = 1;
    #rateLimitDelay = 5000;
    #limits: SessionLimits | null = null;
    #acquireQueue: Array<() => Promise<void>> = [];
    #isProcessing = false;
    #resetTimeout: NodeJS.Timeout | null = null;
    #state: SessionState = {
        sequence: null,
        sessionId: null,
        resumeUrl: null,
    };

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
            this.#emitDebug(`Sequence updated to ${sequence}`);
        } catch (error) {
            const sessionError = new SessionError("Failed to update sequence", SessionErrorCode.StateError, {
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
            this.#emitDebug(`Session updated - ID: ${sessionId}, URL: ${resumeUrl}`);
        } catch (error) {
            const sessionError = new SessionError("Failed to update session", SessionErrorCode.StateError, {
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
        const canResume = Boolean(sessionId && sequence !== null && resumeUrl);
        this.#emitDebug(`Resume availability checked: ${canResume}`);
        return canResume;
    }

    updateLimit(gateway: GetGatewayBotJsonResponse): void {
        try {
            const { remaining, total, reset_after, max_concurrency } = gateway.session_start_limit;

            this.#limits = {
                remaining,
                total,
                resetAfter: reset_after,
                maxConcurrency: max_concurrency,
                recommendedShards: gateway.shards,
            };

            this.#emitDebug(
                `Limits updated - Remaining: ${remaining}/${total}, Max Concurrency: ${max_concurrency}, Reset After: ${reset_after}ms`,
            );

            if (this.#resetTimeout) {
                clearTimeout(this.#resetTimeout);
                this.#resetTimeout = null;
            }
        } catch (error) {
            const sessionError = new SessionError("Failed to update session limits", SessionErrorCode.StateError, {
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
                const error = new SessionError(
                    "Session manager not initialized with gateway info",
                    SessionErrorCode.NotInitialized,
                );
                this.#emitError(error);
                throw error;
            }

            if (this.remaining <= 0) {
                this.#emitDebug("No sessions remaining, waiting for reset");
                await this.#waitForReset();
                return this.acquire();
            }

            const acquirePromise = (): Promise<void> => {
                if (!this.#limits) {
                    const error = new SessionError("Limits lost during acquisition", SessionErrorCode.StateError);
                    this.#emitError(error);
                    throw error;
                }

                this.#limits.remaining--;
                this.#emitDebug(`Session acquired - ${this.remaining} remaining`);
                return Promise.resolve();
            };

            this.#acquireQueue.push(acquirePromise);
            await this.#processQueue();
        } catch (error) {
            const sessionError =
                error instanceof SessionError
                    ? error
                    : new SessionError("Failed to acquire session", SessionErrorCode.AcquisitionError, { error });
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

            this.#state = {
                sequence: null,
                sessionId: null,
                resumeUrl: null,
            };

            this.#limits = null;
            this.#acquireQueue = [];
            this.#isProcessing = false;

            this.#emitDebug("Session manager destroyed");
        } catch (error) {
            const sessionError = new SessionError(
                "Error during session manager destruction",
                SessionErrorCode.StateError,
                { error },
            );
            this.#emitError(sessionError);
        }
    }

    async #waitForReset(): Promise<void> {
        if (!this.#limits) {
            const error = new SessionError(
                "Cannot wait for reset: limits not initialized",
                SessionErrorCode.StateError,
            );
            this.#emitError(error);
            throw error;
        }

        const { resetAfter, total } = this.#limits;
        this.#emitDebug(`Waiting ${resetAfter}ms for session limit reset`);

        try {
            await new Promise<void>((resolve, reject) => {
                this.#resetTimeout = setTimeout(() => {
                    if (!this.#limits) {
                        const error = new SessionError(
                            "Session limits lost during reset wait",
                            SessionErrorCode.ResetError,
                        );
                        reject(error);
                        return;
                    }

                    this.#limits.remaining = total;
                    this.#emitDebug(`Session limits reset - ${total} sessions available`);
                    resolve();
                }, resetAfter);
            });
        } catch (error) {
            const sessionError =
                error instanceof SessionError
                    ? error
                    : new SessionError("Failed to wait for session reset", SessionErrorCode.ResetError, { error });
            this.#emitError(sessionError);
            throw sessionError;
        }
    }

    async #processQueue(): Promise<void> {
        if (this.#isProcessing || this.#acquireQueue.length === 0) {
            return;
        }

        this.#isProcessing = true;
        this.#emitDebug("Starting queue processing");

        try {
            while (this.#acquireQueue.length > 0) {
                const batchSize = Math.min(this.maxConcurrency, this.#acquireQueue.length);
                const batch = this.#acquireQueue.splice(0, batchSize);

                this.#emitDebug(`Processing batch of ${batchSize} sessions`);

                await Promise.all(
                    batch.map((fn) =>
                        fn().catch((error) => {
                            const sessionError = new SessionError(
                                "Failed to acquire session in batch",
                                SessionErrorCode.AcquisitionError,
                                { error },
                            );
                            this.#emitError(sessionError);
                            throw sessionError;
                        }),
                    ),
                );

                if (this.#acquireQueue.length > 0) {
                    this.#emitDebug(`Waiting ${this.#rateLimitDelay}ms before next batch`);
                    await new Promise((resolve) => setTimeout(resolve, this.#rateLimitDelay));
                }
            }
        } catch (error) {
            const sessionError =
                error instanceof SessionError
                    ? error
                    : new SessionError("Queue processing failed", SessionErrorCode.QueueProcessingError, { error });
            this.#emitError(sessionError);
            throw sessionError;
        } finally {
            this.#isProcessing = false;
            this.#emitDebug("Queue processing completed");
        }
    }

    #emitError(error: SessionError): void {
        this.emit(
            "error",
            Logger.error(error.message, {
                component: "SessionManager",
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }

    #emitDebug(message: string): void {
        this.emit(
            "debug",
            Logger.debug(message, {
                component: "SessionManager",
            }),
        );
    }
}
