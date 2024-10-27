import type { Integer } from "@nyxjs/core";

export class SessionManager {
    #sequence: Integer | null = null;
    #sessionId: string | null = null;
    #resumeGatewayUrl: string | null = null;

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

    clear(): void {
        this.#sequence = null;
        this.#sessionId = null;
        this.#resumeGatewayUrl = null;
    }

    canResume(): boolean {
        return !!(this.#sessionId && this.#sequence && this.#resumeGatewayUrl);
    }
}
