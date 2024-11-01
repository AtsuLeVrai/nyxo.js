import type { Integer } from "@nyxjs/core";
import type { GetGatewayBotJsonResponse } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import type { GatewayEvents } from "../types/index.js";

export class SessionManager extends EventEmitter<Pick<GatewayEvents, "DEBUG" | "ERROR">> {
    #gatewayInfo: GetGatewayBotJsonResponse | null = null;
    #waitQueue: Array<() => Promise<void>> = [];
    #processing = false;
    #sequence: Integer | null = null;
    #sessionId: string | null = null;
    #resumeGatewayUrl: string | null = null;

    get remaining(): number {
        return this.#gatewayInfo?.session_start_limit.remaining ?? 0;
    }

    get maxConcurrency(): number {
        return this.#gatewayInfo?.session_start_limit.max_concurrency ?? 1;
    }

    get shards(): Integer | null {
        return this.#gatewayInfo?.shards ?? null;
    }

    updateSequence(sequence: Integer): void {
        this.#sequence = sequence;
    }

    updateSession(sessionId: string, resumeUrl: string): void {
        this.#sessionId = sessionId;
        this.#resumeGatewayUrl = resumeUrl;
    }

    getSequence(): Integer | null {
        return this.#sequence;
    }

    getSessionId(): string | null {
        return this.#sessionId;
    }

    getResumeUrl(): string | null {
        return this.#resumeGatewayUrl;
    }

    canResume(): boolean {
        return !!(this.#sessionId && this.#sequence && this.#resumeGatewayUrl);
    }

    updateLimit(gateway: GetGatewayBotJsonResponse): void {
        this.#gatewayInfo = gateway;
        this.emit(
            "DEBUG",
            `[SESSION] Updated session limits - Remaining: ${gateway.session_start_limit.remaining}, Max Concurrency: ${gateway.session_start_limit.max_concurrency}`
        );
    }

    async acquire(): Promise<void> {
        if (!this.#gatewayInfo) {
            throw new Error("Session limits not initialized");
        }

        if (this.#gatewayInfo.session_start_limit.remaining <= 0) {
            await this.#waitForReset();
            return this.acquire();
        }

        return new Promise((resolve) => {
            this.#waitQueue.push(async () => {
                try {
                    this.#gatewayInfo!.session_start_limit.remaining--;
                    this.emit(
                        "DEBUG",
                        `[SESSION] Session acquired - Remaining: ${this.#gatewayInfo!.session_start_limit!.remaining}`
                    );
                    resolve();
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    this.emit("ERROR", new Error(`Failed to acquire session: ${message}`));
                    throw error;
                }
            });

            void this.#processQueue();
        });
    }

    clear(): void {
        this.#gatewayInfo = null;
        this.#waitQueue = [];
        this.#processing = false;
        this.#sequence = null;
        this.#sessionId = null;
        this.#resumeGatewayUrl = null;

        this.emit("DEBUG", "[SESSION] Session manager cleared");
    }

    async #waitForReset(): Promise<void> {
        if (!this.#gatewayInfo) {
            return;
        }

        const resetAfter = this.#gatewayInfo.session_start_limit.reset_after;
        this.emit("DEBUG", `[SESSION] Waiting ${resetAfter}ms for session limit reset`);

        await new Promise((resolve) => setTimeout(resolve, resetAfter));

        if (this.#gatewayInfo) {
            this.#gatewayInfo.session_start_limit.remaining = this.#gatewayInfo.session_start_limit.total;
            this.emit(
                "DEBUG",
                `[SESSION] Session limits reset - New remaining: ${this.#gatewayInfo.session_start_limit.remaining}`
            );
        }
    }

    async #processQueue(): Promise<void> {
        if (this.#processing || this.#waitQueue.length === 0) {
            return;
        }

        this.#processing = true;

        try {
            while (this.#waitQueue.length > 0) {
                const batch = this.#waitQueue.splice(0, this.maxConcurrency).map((fn) => fn());

                await Promise.all(batch);

                if (this.#waitQueue.length > 0) {
                    await new Promise((resolve) => setTimeout(resolve, 5_000));
                }
            }
        } finally {
            this.#processing = false;
        }
    }
}
