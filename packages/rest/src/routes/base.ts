import type { Dispatcher } from "undici";
import type { RestRequestOptions } from "../types";

/**
 * @todo Possibility of creating a BaseRouteBuilder that includes management of scopes and discord permissions with RestRequestOptions.
 */
export class BaseRoutes {
    protected static get<T>(
        path: string,
        options: Partial<Omit<RestRequestOptions<T>, "body" | "method" | "path">> = {}
    ): RestRequestOptions<T> {
        return this.createRequest("GET", path, options);
    }

    protected static post<T>(
        path: string,
        options: Partial<Omit<RestRequestOptions<T>, "method" | "path">> = {}
    ): RestRequestOptions<T> {
        return this.createRequest("POST", path, options);
    }

    protected static put<T>(
        path: string,
        options: Partial<Omit<RestRequestOptions<T>, "method" | "path">> = {}
    ): RestRequestOptions<T> {
        return this.createRequest("PUT", path, options);
    }

    protected static patch<T>(
        path: string,
        options: Partial<Omit<RestRequestOptions<T>, "method" | "path">> = {}
    ): RestRequestOptions<T> {
        return this.createRequest("PATCH", path, options);
    }

    protected static delete<T>(
        path: string,
        options: Partial<Omit<RestRequestOptions<T>, "body" | "method" | "path">> = {}
    ): RestRequestOptions<T> {
        return this.createRequest("DELETE", path, options);
    }

    private static createRequest<T>(
        method: Dispatcher.HttpMethod,
        path: string,
        options: Partial<RestRequestOptions<T>> = {}
    ): RestRequestOptions<T> {
        return {
            method,
            path,
            ...options,
        };
    }
}
