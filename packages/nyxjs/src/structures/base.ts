export abstract class Base<T> {
	protected constructor(data: Partial<T>) {
		this.patch(data);
	}

	public static from<U, V extends Base<U>>(this: new (data: Partial<U>) => V, data: Partial<U>): V {
		return new this(data);
	}

	public abstract toJSON(): T;

	protected abstract patch(data: Partial<T>): void;
}
