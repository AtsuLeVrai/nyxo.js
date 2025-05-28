import type { Rest } from "../core/index.js";
import type { FileInput } from "../handlers/index.js";
import type { HttpRequestOptions } from "../types/index.js";

/**
 * Base abstract class for all Discord API router classes.
 * Provides common functionality and utilities shared across router implementations.
 */
export abstract class BaseRouter {
  /** The REST client used to make API requests */
  protected readonly rest: Rest;

  /**
   * Creates a new instance of a router.
   * @param rest - The REST client to use for making Discord API requests
   */
  constructor(rest: Rest) {
    this.rest = rest;
  }

  /**
   * Transforms a file input to a data URI format.
   * Utility method for handling files in API requests that need data URI format.
   *
   * @param file - The file input to transform
   * @returns A promise resolving to the data URI representation of the file
   */
  protected async toDataUri(file: FileInput): Promise<string> {
    return await this.rest.file.toDataUri(file);
  }

  /**
   * Transforms multiple files to data URI format.
   * Processes an array of file inputs in parallel.
   *
   * @param files - Array of file inputs to transform
   * @returns A promise resolving to an array of data URIs
   */
  protected async toDataUris(files: FileInput[]): Promise<string[]> {
    return await Promise.all(
      files.map((file) => this.rest.file.toDataUri(file)),
    );
  }

  /**
   * Prepares a request body with file transformations.
   * Converts any file inputs in the options to data URIs.
   *
   * @param options - The request options potentially containing file inputs
   * @param fileFields - Array of field names that might contain files
   * @returns A promise resolving to a processed copy of the options
   */
  protected async prepareBodyWithFiles<T extends object>(
    options: T,
    fileFields: (keyof T)[],
  ): Promise<T> {
    const result = { ...options };

    for (const field of fileFields) {
      if (result[field] !== undefined && result[field] !== null) {
        if (Array.isArray(result[field])) {
          (result[field] as string[]) = await this.toDataUris(result[field]);
        } else {
          (result[field] as string) = await this.toDataUri(
            result[field] as FileInput,
          );
        }
      }
    }

    return result;
  }

  /**
   * Creates an API request with JSON body.
   * Utility method for POST requests with proper content type.
   *
   * @param endpoint - The API endpoint to send the request to
   * @param data - The data to send in the request body
   * @param options - Additional request options
   * @returns A promise resolving to the API response
   */
  protected post<T, R = unknown>(
    endpoint: string,
    data?: T,
    options?: Pick<HttpRequestOptions, "files" | "reason" | "query">,
  ): Promise<R> {
    return this.rest.post(endpoint, {
      body: data ? JSON.stringify(data) : undefined,
      reason: options?.reason,
      query: options?.query,
      files: options?.files,
    });
  }

  /**
   * Updates a resource with PATCH request.
   * Utility method for PATCH requests with proper content type.
   *
   * @param endpoint - The API endpoint to send the request to
   * @param data - The data to send in the request body
   * @param options - Additional request options
   * @returns A promise resolving to the API response
   */
  protected patch<T, R = unknown>(
    endpoint: string,
    data?: T,
    options?: Pick<HttpRequestOptions, "files" | "reason" | "query">,
  ): Promise<R> {
    return this.rest.patch(endpoint, {
      body: data ? JSON.stringify(data) : undefined,
      reason: options?.reason,
      query: options?.query,
      files: options?.files,
    });
  }

  /**
   * Updates a resource with PUT request.
   * Utility method for PUT requests with proper content type.
   *
   * @param endpoint - The API endpoint to send the request to
   * @param data - The data to send in the request body
   * @param options - Additional request options
   * @returns A promise resolving to the API response
   */
  protected put<T, R = unknown>(
    endpoint: string,
    data?: T,
    options?: Pick<HttpRequestOptions, "files" | "reason" | "query">,
  ): Promise<R> {
    return this.rest.put(endpoint, {
      body: data ? JSON.stringify(data) : undefined,
      reason: options?.reason,
      query: options?.query,
      files: options?.files,
    });
  }

  /**
   * Fetches a resource with GET request.
   * Utility method for GET requests with optional query parameters.
   *
   * @param endpoint - The API endpoint to send the request to
   * @param options - Request options including query parameters
   * @returns A promise resolving to the API response
   */
  protected get<R = unknown>(
    endpoint: string,
    options?: Pick<HttpRequestOptions, "query">,
  ): Promise<R> {
    return this.rest.get(endpoint, {
      query: options?.query,
    });
  }

  /**
   * Deletes a resource with DELETE request.
   * Utility method for DELETE requests with optional reason.
   *
   * @param endpoint - The API endpoint to send the request to
   * @param options - Request options including audit log reason
   * @returns A promise resolving to the API response
   */
  protected delete<R = void>(
    endpoint: string,
    options?: Pick<HttpRequestOptions, "reason" | "query">,
  ): Promise<R> {
    return this.rest.delete(endpoint, {
      reason: options?.reason,
      query: options?.query,
    });
  }
}
