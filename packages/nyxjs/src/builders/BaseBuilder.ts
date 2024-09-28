export abstract class BaseBuilder<T> {
    public static from<U extends BaseBuilder<T>, T>(this: new (data: T) => U, data: T): U {
        return new this(data);
    }

    public abstract toJSON(): T;

    public validateLength(value: string, limit: number, fieldName: string): void {
        if (value.length > limit) {
            throw new Error(`${fieldName} must be less than or equal to ${limit} characters.`);
        }
    }

    public validateRange(value: number, min: number, max: number, fieldName: string): void {
        if (value < min || value > max) {
            throw new Error(`${fieldName} must be between ${min} and ${max}`);
        }
    }
}
