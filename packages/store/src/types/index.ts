export type StoreOptions = {
    /**
     * The time-to-live (in milliseconds) of the value.
     */
    default_ttL?: number;
    /**
     * The maximum size of the cache.
     */
    max_size?: number;
    /**
     * The callback function to be called when an item is evicted from the cache.
     *
     * @param key - The key of the evicted item.
     * @param value - The value of the evicted item.
     */
    onEvict?(this: void, key: any, value: any): void;
};

export type StoreSetOptions = {
    /**
     * The time-to-live (in milliseconds) of the value.
     */
    ttl?: number;
};
