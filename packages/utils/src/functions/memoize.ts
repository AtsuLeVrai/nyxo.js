/**
 * Memoizes the provided function, caching the result based on the arguments.
 *
 * @param fn - The function to memoize.
 * @returns A memoized version of the provided function.
 */
export function memoize<F extends (...args: any[]) => any>(fn: F): (...args: Parameters<F>) => ReturnType<F> {
    const cache = new Map();
    return (...args: Parameters<F>): ReturnType<F> => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}
