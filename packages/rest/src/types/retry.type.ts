export interface RetryAttemptEvent {
  error: Error;
  attempt: number;
  delay: number;
  method: string;
  path: string;
  timestamp: number;
}
