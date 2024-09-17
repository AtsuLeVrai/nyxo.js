export class BitFieldProvider<T extends bigint | number> {
    private bitfield: bigint;

    public constructor(bits?: BitFieldProvider<T> | T | T[]) {
        this.bitfield = this.resolve(bits);
    }

    public static resolve<T extends bigint | number>(bit?: BitFieldProvider<T> | T | T[]): bigint {
        return new BitFieldProvider<T>().resolve(bit);
    }

    public add(...bits: (BitFieldProvider<T> | T | T[])[]): this {
        for (const bit of bits) {
            this.bitfield |= this.resolve(bit);
        }

        return this;
    }

    public remove(...bits: (BitFieldProvider<T> | T | T[])[]): this {
        for (const bit of bits) {
            this.bitfield &= ~this.resolve(bit);
        }

        return this;
    }

    public has(bit: BitFieldProvider<T> | T | T[]): boolean {
        const resolved = this.resolve(bit);
        return (this.bitfield & resolved) === resolved;
    }

    public valueOf(): bigint {
        return this.bitfield;
    }

    public set(bits: BitFieldProvider<T> | T | T[]): this {
        this.bitfield = this.resolve(bits);
        return this;
    }

    public toggle(...bits: (BitFieldProvider<T> | T | T[])[]): this {
        for (const bit of bits) {
            this.bitfield ^= this.resolve(bit);
        }

        return this;
    }

    public clear(): this {
        this.bitfield = 0n;
        return this;
    }

    public isEmpty(): boolean {
        return this.bitfield === 0n;
    }

    public toArray(): T[] {
        const result: T[] = [];
        for (let i = 0n; i < 64n; i++) {
            if (this.bitfield & (1n << i)) {
                result.push(Number(1n << i) as T);
            }
        }

        return result;
    }

    public toString(): string {
        return this.bitfield.toString(2).padStart(64, "0");
    }

    public resolve(bit?: BitFieldProvider<T> | T | T[]): bigint {
        if (bit === undefined) return 0n;
        if (bit instanceof BitFieldProvider) {
            return bit.bitfield;
        }

        if (Array.isArray(bit)) {
            return bit.reduce((acc, val) => acc | BigInt(val), 0n);
        }

        return BigInt(bit);
    }
}
