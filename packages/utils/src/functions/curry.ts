/**
 * Curries the provided function, allowing it to be called with fewer arguments than it expects.
 *
 * @template T - The type of the function to be curried.
 * @param {T} fn - The function to curry.
 * @returns {any} A new function that can be called with fewer arguments, returning either a new curried function or the result of the original function.
 */
export function curry<T extends (...args: any[]) => any>(fn: T): any {
    return function curried(...args: any[]): any {
        return args.length >= fn.length ? fn(...args) : (...more: any[]) => curried(...args, ...more);
    };
}
