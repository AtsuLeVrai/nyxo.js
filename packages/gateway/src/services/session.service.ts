export class SessionService {
  #sessionId: string | null = null;
  #resumeUrl: string | null = null;
  #sequence = 0;

  get sessionId(): string | null {
    return this.#sessionId;
  }

  get resumeUrl(): string | null {
    return this.#resumeUrl;
  }

  get sequence(): number {
    return this.#sequence;
  }

  setSession(sessionId: string, resumeUrl: string): void {
    this.#sessionId = sessionId;
    this.#resumeUrl = resumeUrl;
  }

  updateSequence(sequence: number): void {
    this.#sequence = sequence;
  }

  canResume(): boolean {
    return Boolean(this.#sessionId && this.#sequence > 0);
  }

  reset(): void {
    this.#sessionId = null;
    this.#resumeUrl = null;
    this.#sequence = 0;
  }
}
