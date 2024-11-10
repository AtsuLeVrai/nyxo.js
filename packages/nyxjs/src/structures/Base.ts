export abstract class Base<T, Q> {
    abstract patch(data: Partial<T>): void;

    abstract toJson(): Partial<T>;

    abstract clone(): Base<T, Q>;

    abstract toString(): string;

    abstract valueOf(): Q;

    abstract reset(): void;

    abstract equals(other: Partial<Base<T, Q>>): boolean;
}
