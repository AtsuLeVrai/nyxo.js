export enum StoreErrorCode {
    EXPIRED_KEY = "EXPIRED_KEY",
    INVALID_ARGUMENT = "INVALID_ARGUMENT",
    INVALID_KEY = "INVALID_KEY",
    INVALID_TTL = "INVALID_TTL",
    INVALID_VALUE = "INVALID_VALUE",
    KEY_NOT_FOUND = "KEY_NOT_FOUND",
    MAX_SIZE_EXCEEDED = "MAX_SIZE_EXCEEDED",
    OPERATION_FAILED = "OPERATION_FAILED",
    SERIALIZATION_ERROR = "SERIALIZATION_ERROR",
    STORE_FULL = "STORE_FULL",
}

export class StoreError extends Error {
    public constructor(
        message: string,
        public readonly code: StoreErrorCode,
        public readonly details?: any
    ) {
        super(message);
        this.name = "StoreError";
        Object.setPrototypeOf(this, StoreError.prototype);
    }

    public static keyNotFound(key: any): StoreError {
        return new StoreError(`Key not found: ${key}`, StoreErrorCode.KEY_NOT_FOUND, { key });
    }

    public static invalidKey(key: any): StoreError {
        return new StoreError(`Invalid key: ${key}`, StoreErrorCode.INVALID_KEY, { key });
    }

    public static maxSizeExceeded(currentSize: number, maxSize: number): StoreError {
        return new StoreError(`Max size exceeded: ${currentSize} > ${maxSize}`, StoreErrorCode.MAX_SIZE_EXCEEDED, {
            currentSize,
            maxSize,
        });
    }

    public static invalidTTL(ttl: any): StoreError {
        return new StoreError(`Invalid TTL: ${ttl}`, StoreErrorCode.INVALID_TTL, { ttl });
    }

    public static invalidValue(value: any): StoreError {
        return new StoreError(`Invalid value: ${value}`, StoreErrorCode.INVALID_VALUE, { value });
    }

    public static operationFailed(operation: string, reason: string): StoreError {
        return new StoreError(`Operation failed: ${operation}. Reason: ${reason}`, StoreErrorCode.OPERATION_FAILED, {
            operation,
            reason,
        });
    }

    public static invalidArgument(argument: string, expectedType: string): StoreError {
        return new StoreError(
            `Invalid argument: ${argument}. Expected type: ${expectedType}`,
            StoreErrorCode.INVALID_ARGUMENT,
            {
                argument,
                expectedType,
            }
        );
    }

    public static serializationError(key: any): StoreError {
        return new StoreError(`Failed to serialize key: ${key}`, StoreErrorCode.SERIALIZATION_ERROR, { key });
    }

    public static storeFull(): StoreError {
        return new StoreError(`Store is full. Cannot add more items.`, StoreErrorCode.STORE_FULL);
    }

    public static expiredKey(key: any): StoreError {
        return new StoreError(`Key has expired: ${key}`, StoreErrorCode.EXPIRED_KEY, { key });
    }
}
