export function paginate<T>(array: T[], pageSize: number, pageNumber: number): T[] {
    const startIndex = pageSize * (pageNumber - 1);
    return array.slice(startIndex, startIndex + pageSize);
}
