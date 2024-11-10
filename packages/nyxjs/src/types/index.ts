export type PickPropsOnly<T> = {
    [K in keyof T as T[K] extends (...args: unknown[]) => unknown ? never : K]: T[K];
};

type AnyMethod = (this: unknown, ...args: never[]) => unknown;

export type PickMethodsOnly<T> = {
    [K in keyof T as T[K] extends AnyMethod ? K : never]: T[K];
};

export type PickWithMethods<T, P extends keyof T> = Pick<T, P> & PickMethodsOnly<T>;

export * from "./Client.js";
