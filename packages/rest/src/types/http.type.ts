import type { IncomingHttpHeaders } from "node:http";

export interface HttpResponse<T> {
  data: T;
  status?: number;
  headers?: IncomingHttpHeaders;
  context?: object;
  opaque?: unknown;
  trailers?: Record<string, string>;
  cached?: boolean;
}
