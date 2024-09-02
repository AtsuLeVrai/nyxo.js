export abstract class Base<T extends object> {
	protected constructor(data: Partial<T>) {
		this.patch(data);
	}

	public static from<U extends object, V extends Base<U>>(
		this: new (
			data: Partial<U>,
		) => V,
		data: Partial<U> | null,
	): V {
		return new this(data || {});
	}

	public toJSON(): T {
		const result: Partial<T> = {};
		for (const key of Object.keys(this) as Array<keyof T>) {
			const value = this[key as keyof this];
			if (value instanceof Base) {
				result[key] = value.toJSON() as any;
			} else if (Array.isArray(value)) {
				result[key] = value.map((item) =>
					item instanceof Base ? item.toJSON() : item,
				) as any;
			} else {
				result[key] = value as any;
			}
		}
		return result as T;
	}

	protected patch(data: Partial<T>): void {
		for (const [key, value] of Object.entries(data)) {
			if (value !== undefined && key in this) {
				const thisKey = key as keyof this;
				if (this[thisKey] instanceof Base) {
					(this[thisKey] as Base<any>).patch(value as any);
				} else if (Array.isArray(value) && Array.isArray(this[thisKey])) {
					(this[thisKey] as any[]) = value.map((item, index) => {
						const currentItem = (this[thisKey] as any[])[index];
						return currentItem instanceof Base
							? Base.from.call(
									currentItem.constructor as new (
										data: Partial<any>,
									) => Base<any>,
									item,
								)
							: item;
					});
				} else {
					(this[thisKey] as any) = value;
				}
			}
		}
	}
}
