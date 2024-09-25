export function lazy<T>(fn: () => T): () => T {
    let value: T | undefined;
    return () => {
        if (value === undefined) {
            value = fn();
        }

        return value;
    };
}
