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
}

export interface RequestErrorJson {
  name: string;
  message: string;
  statusCode: number;
  path?: string;
  method?: string;
}
