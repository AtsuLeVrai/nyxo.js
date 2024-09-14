/**
 * Options for configuring the Cache.
 */
export type CacheOptions = {
    /**
     * The maximum number of items the cache can hold.
     * If not specified, the cache will have no capacity limit.
     */
    capacity?: number;

    /**
     * A callback function called when an item is evicted from the cache.
     *
     * @param key - The key of the evicted item.
     * @param value - The value of the evicted item.
     */
    onEvict?(key: any, value: any): void;

    /**
     * The time-to-live for items in the cache, in milliseconds.
     * If not specified, items will not automatically expire.
     */
    ttl?: number;
};
