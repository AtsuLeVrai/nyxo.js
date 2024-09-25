export function curry<T extends (...args: any[]) => any>(fn: T): any {
    return function curried(...args: any[]): any {
        return args.length >= fn.length ? fn(...args) : (...more: any[]) => curried(...args, ...more);
    };
}
