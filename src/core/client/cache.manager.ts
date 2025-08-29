import QuickLRU from "quick-lru";
import { z } from "zod";
import type { GuildEntity } from "../../resources/index.js";
import type { Rest } from "../rest/index.js";

export interface CacheEntityMap {
  guilds: GuildEntity;
}

export type CacheKey = keyof CacheEntityMap;
export type CacheEntity<K extends CacheKey> = CacheEntityMap[K];

export const CacheEntityOptions = z.object({
  enabled: z.boolean().default(true),
  maxSize: z.number().positive().default(1000),
  maxAge: z.number().positive().optional(),
  preFetch: z.boolean().default(true),
});

export const CacheOptions = z.object({
  guilds: CacheEntityOptions.prefault({}),
} satisfies Record<CacheKey, z.ZodTypeAny>);

export class CacheManager {
  readonly #caches = new Map<CacheKey, QuickLRU<string, any>>();

  readonly #options: z.infer<typeof CacheOptions>;
  readonly #rest: Rest;

  constructor(rest: Rest, options: z.input<typeof CacheOptions> = {}) {
    this.#rest = rest;

    try {
      this.#options = CacheOptions.parse(options);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(z.prettifyError(error));
      }
      throw error;
    }
  }

  async initialize(): Promise<void> {
    for (const [key, config] of Object.entries(this.#options)) {
      if (config.enabled) {
        this.#caches.set(
          key as CacheKey,
          new QuickLRU({
            maxSize: config.maxSize,
            maxAge: config.maxAge,
          }),
        );
      }
    }

    if (this.#options.guilds.preFetch) {
      await this.#preFetchGuilds();
    }
  }

  get<K extends CacheKey>(cacheKey: K, id: string): CacheEntity<K> | undefined {
    const cache = this.#caches.get(cacheKey);
    return cache?.get(id);
  }

  set<K extends CacheKey>(cacheKey: K, id: string, value: CacheEntity<K>): void {
    const cache = this.#caches.get(cacheKey);
    if (!cache) {
      return;
    }

    cache.set(id, value);
  }

  delete(cacheKey: CacheKey, id: string): boolean {
    const cache = this.#caches.get(cacheKey);
    return cache?.delete(id) ?? false;
  }

  clear(cacheKey?: CacheKey): void {
    if (cacheKey) {
      this.#caches.get(cacheKey)?.clear();
    } else {
      for (const cache of this.#caches.values()) {
        cache.clear();
      }
    }
  }

  has(cacheKey: CacheKey, id: string): boolean {
    const cache = this.#caches.get(cacheKey);
    return cache?.has(id) ?? false;
  }

  getOld<K extends CacheKey>(cacheKey: K, id: string): CacheEntity<K> | null {
    return this.get(cacheKey, id) ?? null;
  }

  updateWithOld<K extends CacheKey>(
    cacheKey: K,
    id: string,
    newValue: CacheEntity<K>,
  ): { old: CacheEntity<K> | null; new: CacheEntity<K> } {
    const old = this.getOld(cacheKey, id);
    this.set(cacheKey, id, newValue);
    return { old, new: newValue };
  }

  destroy(): void {
    this.#caches.clear();
  }

  async #preFetchGuilds(): Promise<void> {
    const guildsCache = this.#caches.get("guilds");
    if (!guildsCache) {
      return;
    }

    try {
      const guilds = await this.#rest.user.getCurrentUserGuilds();
      const guildCount = guilds.length;

      const updatedConfig = {
        maxSize: Math.max(guildCount * 1.2, guildsCache.maxSize),
        maxAge: this.#options.guilds.maxAge,
      };

      this.#caches.set("guilds", new QuickLRU(updatedConfig));
      const newGuildsCache = this.#caches.get("guilds");

      for (const guild of guilds) {
        newGuildsCache?.set(guild.id as string, guild);
      }
    } catch {
      // Ignore pre-fetch errors
    }
  }
}
