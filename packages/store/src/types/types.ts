/**
 * Options for configuring the Store.
 */
export type StoreOptions = {
    /**
     * The maximum number of items the store can hold.
     * If not specified, the store will have no capacity limit.
     */
    capacity?: number;

    /**
     * A callback function called when an item is evicted from the store.
     *
     * @param key - The key of the evicted item.
     * @param value - The value of the evicted item.
     */
    onEvict?(key: any, value: any): void;

    /**
     * The time-to-live for items in the store, in milliseconds.
     * If not specified, items will not automatically expire.
     */
    ttl?: number;
};
