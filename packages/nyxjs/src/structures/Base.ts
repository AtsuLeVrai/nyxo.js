export abstract class Base<T> {
    public static from<U extends Base<T>, T>(this: new (data: T) => U, data: T): U {
        return new this(data);
    }
}
