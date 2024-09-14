/**
 * Shuffles the elements of an array in place using the Fisher-Yates algorithm.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} array - The array to shuffle.
 * @returns {T[]} The shuffled array.
 */
export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let index = shuffled.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
}
