export function flattenArray<T>(arr: (T | T[])[]): T[] {
    return arr.reduce<T[]>((acc, val) => (Array.isArray(val) ? acc.concat(flattenArray(val)) : acc.concat(val)), []);
}
