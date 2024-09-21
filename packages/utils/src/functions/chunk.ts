/**
 * Splits an array into chunks of a specified size.
 *
 * @param arr - The array to split into chunks.
 * @param size - The size of each chunk.
 * @returns An array of arrays, where each sub-array is a chunk of the original array.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
    const res: T[][] = [];
    for (let index = 0; index < arr.length; index += size) {
        res.push(arr.slice(index, index + size));
    }

    return res;
}
