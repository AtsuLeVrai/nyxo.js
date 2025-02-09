export interface SessionState {
  sessionId: string;
  resumeUrl: string;
}

export interface SessionClose {
  code: number;
  sessionId: string;
}

export interface SessionInvalid {
  resumable: boolean;
}
