export abstract class BaseStructure<T> {
    public static from<U extends BaseStructure<T>, T>(this: new (data: T) => U, data: T): U {
        return new this(data);
    }

    public abstract toJSON(): T;
}
