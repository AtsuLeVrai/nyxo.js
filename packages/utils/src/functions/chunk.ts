/**
 * Splits an array into chunks of a specified size.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} arr - The array to split into chunks.
 * @param {number} size - The size of each chunk.
 * @returns {T[][]} An array of arrays, where each sub-array is a chunk of the original array.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
    const res: T[][] = [];
    for (let index = 0; index < arr.length; index += size) {
        res.push(arr.slice(index, index + size));
    }

    return res;
}
