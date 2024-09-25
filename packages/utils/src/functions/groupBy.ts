export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
    return array.reduce<{ [key: string]: T[] }>((result, currentValue) => {
        (result[currentValue[key] as string] = result[currentValue[key] as string] || []).push(currentValue);
        return result;
    }, {});
}
