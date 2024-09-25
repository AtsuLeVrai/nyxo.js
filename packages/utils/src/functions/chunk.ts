export function chunk<T>(arr: T[], size: number): T[][] {
    const res: T[][] = [];
    for (let index = 0; index < arr.length; index += size) {
        res.push(arr.slice(index, index + size));
    }

    return res;
}
