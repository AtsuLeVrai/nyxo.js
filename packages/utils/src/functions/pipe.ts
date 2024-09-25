export function pipe(...fns: Function[]): (x: any) => any {
    return (initialValue: any) => fns.reduce((value, func) => func(value), initialValue);
}
