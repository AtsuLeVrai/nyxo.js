import type { Rest } from "../core/index.js";
import type { PathLike, RouteEntity } from "../types/index.js";

export abstract class BaseRouter {
  protected readonly rest: Rest;

  constructor(rest: Rest) {
    this.rest = rest;
  }

  protected get<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.rest.get(path, options);
  }

  protected post<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.rest.post(path, options);
  }

  protected put<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.rest.put(path, options);
  }

  protected patch<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.rest.patch(path, options);
  }

  protected delete<T>(
    path: PathLike,
    options?: Omit<RouteEntity, "method" | "path">,
  ): Promise<T> {
    return this.rest.delete(path, options);
  }
}
