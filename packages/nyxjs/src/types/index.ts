export type PickMethodsOnly<T> = {
    [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

export type PickPropsOnly<T> = {
    [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export type PickWithMethods<T, P extends keyof T> = Pick<T, P> & PickMethodsOnly<T>;

export * from "./Client.js";
