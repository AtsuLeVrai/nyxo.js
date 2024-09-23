/**
 * Options for creating a Store.
 */
export type StoreOptions = {
    /**
     * The time-to-live (in milliseconds) of the value.
     */
    default_ttl?: number;
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

/**
 * Enum representing various error codes that can occur in a Store operation.
 */
export enum StoreErrorCode {
    /**
     * The key has expired and is no longer valid.
     */
    ExpiredKey = "EXPIRED_KEY",
    /**
     * The provided key is invalid (e.g., null or undefined).
     */
    InvalidKey = "INVALID_KEY",
    /**
     * The provided Time To Live (TTL) value is invalid.
     */
    InvalidTTL = "INVALID_TTL",
    /**
     * The provided value is invalid (e.g., undefined).
     */
    InvalidValue = "INVALID_VALUE",
    /**
     * The maximum size of the store has been exceeded.
     */
    MaxSizeExceeded = "MAX_SIZE_EXCEEDED",
    /**
     * A general error indicating that an operation has failed.
     */
    OperationFailed = "OPERATION_FAILED",
    /**
     * An error occurred during serialization or deserialization of data.
     */
    SerializationError = "SERIALIZATION_ERROR",
    /**
     * The store is full and cannot accept new entries.
     */
    StoreFull = "STORE_FULL",
}
