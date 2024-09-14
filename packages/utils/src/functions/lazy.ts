/**
 * Creates a lazy-initialized function that caches its result after the first call.
 *
 * @template T - The type of the value returned by the function.
 * @param {() => T} fn - The function to be lazily initialized.
 * @returns {() => T} A function that returns the cached result of the original function after the first call.
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
