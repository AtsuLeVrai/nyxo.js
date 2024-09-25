export function fromPairs<T = any>(pairs: [string, T][]): { [key: string]: T } {
    return pairs.reduce<{ [key: string]: T }>((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});
}
