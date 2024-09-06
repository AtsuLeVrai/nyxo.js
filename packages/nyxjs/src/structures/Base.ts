export abstract class Base<T extends object> {
    protected constructor(data: Partial<T>) {
        this.patch(data);
    }

    public static from<U extends object, V extends Base<U>>(
        this: new (data: Readonly<Partial<U>>) => V,
        data: Partial<U> | null
    ): V {
        return new this(Object.freeze(data ?? {}));
    }

    public toJSON(): Readonly<T> {
        const result: Partial<T> = {};
        for (const key of Object.keys(this) as (keyof T)[]) {
            const value = this[key as keyof this];
            if (value instanceof Base) {
                result[key] = value.toJSON() as any;
            } else if (Array.isArray(value)) {
                result[key] = value.map((item) => (item instanceof Base ? item.toJSON() : this.cloneDeep(item))) as any;
            } else if (typeof value === "object" && value !== null) {
                result[key] = this.cloneDeep(value) as any;
            } else {
                result[key] = value as any;
            }
        }

        return Object.freeze(result as T);
    }

    protected abstract patch(data: Readonly<Partial<T>>): void;

    private cloneDeep<U>(obj: U): U {
        if (typeof obj !== "object" || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.cloneDeep(item)) as unknown as U;
        }

        const clone = {} as U;
        for (const key in obj) {
            if (Object.hasOwn(obj, key)) {
                clone[key] = this.cloneDeep(obj[key]);
            }
        }

        return clone;
    }
}
