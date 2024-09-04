export abstract class Base<T extends object> {
    protected constructor(data: Partial<T>) {
        this.patch(data);
    }

    public static from<U extends object, V extends Base<U>>(
        this: new (data: Partial<U>) => V,
        data: Partial<U> | null
    ): V {
        return new this(data ?? {});
    }

    public toJSON(): T {
        const result: Partial<T> = {};
        for (const key of Object.keys(this) as (keyof T)[]) {
            const value = this[key as keyof this];
            if (value instanceof Base) {
                result[key] = value.toJSON() as any;
            } else if (Array.isArray(value)) {
                result[key] = value.map((item) => (item instanceof Base ? item.toJSON() : item)) as any;
            } else {
                result[key] = value as any;
            }
        }

        return result as T;
    }

    protected abstract patch(data: Partial<T>): void;
}
