export class BitFieldManager<T extends bigint | number> {
    private bitfield: bigint;

    public constructor(bits?: BitFieldManager<T> | T | T[]) {
        this.bitfield = this.resolve(bits);
    }

    public add(...bits: (BitFieldManager<T> | T | T[])[]): this {
        for (const bit of bits) {
            this.bitfield |= this.resolve(bit);
        }

        return this;
    }

    public remove(...bits: (BitFieldManager<T> | T | T[])[]): this {
        for (const bit of bits) {
            this.bitfield &= ~this.resolve(bit);
        }

        return this;
    }

    public has(bit: BitFieldManager<T> | T | T[]): boolean {
        const resolved = this.resolve(bit);
        return (this.bitfield & resolved) === resolved;
    }

    public valueOf(): bigint {
        return this.bitfield;
    }

    public set(bits: BitFieldManager<T> | T | T[]): this {
        this.bitfield = this.resolve(bits);
        return this;
    }

    public toggle(...bits: (BitFieldManager<T> | T | T[])[]): this {
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

    private resolve(bit?: BitFieldManager<T> | T | T[]): bigint {
        if (bit === undefined) return 0n;
        if (bit instanceof BitFieldManager) {
            return bit.bitfield;
        }

        if (Array.isArray(bit)) {
            return bit.reduce((acc, val) => acc | BigInt(val), 0n);
        }

        return BigInt(bit);
    }
}
