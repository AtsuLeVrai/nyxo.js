export type PickWithPublicMethods<T, K extends keyof T> = Pick<
    T,
    {
        [P in keyof T]: T[P] extends Function ? P : never;
    }[keyof T]
> &
    Pick<T, K>;
