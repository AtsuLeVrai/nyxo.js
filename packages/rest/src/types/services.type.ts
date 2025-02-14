import type { Dispatcher } from "undici";

export interface HttpResponse<T = unknown> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
  duration: number;
}

export interface ParsedRequest {
  url: URL;
  options: Dispatcher.RequestOptions;
}
