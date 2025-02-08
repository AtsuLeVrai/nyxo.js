export interface HttpErrorJson {
  name: string;
  message: string;
  statusCode: number;
  requestId?: string;
  path?: string;
  method?: string;
}

// Enhanced error handling with more context
export class HttpError extends Error {
  statusCode: number;
  headers: Record<string, string>;
  requestId?: string;
  path?: string;
  method?: string;

  constructor(
    message: string,
    statusCode: number,
    headers: Record<string, string>,
    options?: {
      requestId?: string;
      path?: string;
      method?: string;
    },
  ) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.headers = headers;
    this.requestId = options?.requestId;
    this.path = options?.path;
    this.method = options?.method;
  }

  toJson(): HttpErrorJson {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      requestId: this.requestId,
      path: this.path,
      method: this.method,
    };
  }
}
