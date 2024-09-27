export function range(start: number, end: number, step: number = 1): number[] {
    return Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, index) => start + index * step);
}
