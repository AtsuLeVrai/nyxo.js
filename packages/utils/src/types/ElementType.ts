export type ElementType<T> = T extends (infer U)[] ? U : T extends { [key: string]: infer V } ? V : never;
