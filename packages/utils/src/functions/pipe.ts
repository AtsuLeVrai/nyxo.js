/**
 * Pipes the provided functions, passing the result of each function to the next.
 *
 * @param {...Function[]} fns - The functions to pipe.
 * @returns {(x: any) => any} A function that takes an initial value and applies the piped functions to it.
 */
export function pipe(...fns: Function[]): (x: any) => any {
    return (initialValue: any) => fns.reduce((value, func) => func(value), initialValue);
}
