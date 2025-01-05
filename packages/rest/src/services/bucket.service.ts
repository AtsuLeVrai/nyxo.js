import { Store } from "@nyxjs/store";
import type { BucketInfo } from "../types/index.js";

export class BucketService {
  readonly #buckets = new Store<string, BucketInfo>();
  readonly #routeToBucket = new Store<string, string>();

  getBucket(hash: string): BucketInfo | undefined {
    return this.#buckets.get(hash);
  }

  getBucketByRoute(route: string): BucketInfo | undefined {
    const hash = this.#routeToBucket.get(route);
    return hash ? this.#buckets.get(hash) : undefined;
  }

  setBucket(hash: string, info: BucketInfo): void {
    this.#buckets.set(hash, info);
  }

  mapRouteToBucket(route: string, hash: string): void {
    this.#routeToBucket.set(route, hash);
  }

  clear(): void {
    this.#buckets.clear();
    this.#routeToBucket.clear();
  }
}
