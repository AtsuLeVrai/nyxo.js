/**
 * Generates an array of numbers in a specified range with a given step.
 *
 * @param min - The starting value of the range.
 * @param max - The ending value of the range.
 * @param step - The step between each value in the range.
 * @returns An array of numbers in the specified range.
 */
export function range(min: number, max: number, step: number = 1): number[] {
    return Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, index) => min + index * step);
}
