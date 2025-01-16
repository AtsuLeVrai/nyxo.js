export interface RestErrorContext {
  cause?: Error;
  path?: string;
  method?: string;
}

export class RestError extends Error {
  readonly context: RestErrorContext;

  constructor(message: string, context: RestErrorContext = {}) {
    super(message);
    this.name = "RestError";
    this.context = context;
  }
}
