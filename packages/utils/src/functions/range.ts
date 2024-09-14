/**
 * Generates an array of numbers in a specified range with a given step.
 *
 * @param {number} min - The starting value of the range.
 * @param {number} max - The ending value of the range.
 * @param {number} step - The step between each value in the range.
 * @returns {number[]} An array of numbers in the specified range.
 */
export function range(min: number, max: number, step: number = 1): number[] {
    return Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, index) => min + index * step);
}
