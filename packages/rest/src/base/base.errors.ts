export interface BaseApiErrorContext {
  path?: string;
  method?: string;
  statusCode: number;
  headers?: Record<string, unknown>;
  timestamp?: string;
}

export abstract class BaseApiError extends Error {
  readonly context: BaseApiErrorContext;

  protected constructor(message: string, context: BaseApiErrorContext) {
    super(message);
    this.name = this.constructor.name;
    this.context = {
      ...context,
      timestamp: new Date().toISOString(),
    };
  }

  abstract toJson(): unknown;

  override toString(): string {
    return `${this.name}: ${this.message} (${this.context.method} ${this.context.path})`;
  }
}
