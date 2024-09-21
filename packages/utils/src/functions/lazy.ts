/**
 * Creates a lazy-initialized function that caches its result after the first call.
 *
 * @param fn - The function to be lazily initialized.
 * @returns A function that returns the cached result of the original function after the first call.
 */
export function lazy<T>(fn: () => T): () => T {
    let value: T | undefined;
    return () => {
        if (value === undefined) {
            value = fn();
        }

        return value;
    };
}
