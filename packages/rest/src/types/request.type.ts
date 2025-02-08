import type { Dispatcher } from "undici";

export interface RequestResponse<T = unknown> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
  duration: number;
}

export interface ParsedRequest {
  url: URL;
  options: Dispatcher.RequestOptions;
  requestId: string;
}

export interface RequestErrorJson {
  name: string;
  message: string;
  statusCode: number;
  requestId?: string;
  path?: string;
  method?: string;
}
