import { z } from "zod";

export const SnowflakeSchema = z
  .string()
  .refine((value) => SnowflakeManager.isValid(value));

export type Snowflake = z.infer<typeof SnowflakeSchema>;

export type SnowflakeResolvable =
  | string
  | number
  | bigint
  | Date
  | SnowflakeManager;

export interface SnowflakeEntity {
  timestamp: number;
  workerId: number;
  processId: number;
  increment: number;
  date: Date;
}

export interface SnowflakeOptions {
  workerId?: number;
  processId?: number;
  increment?: number;
  epoch?: number;
}

export class SnowflakeManager {
  static readonly DISCORD_EPOCH = 1420070400000;
  static readonly SNOWFLAKE_REGEX = /^\d{17,19}$/;
  static readonly MAX_INCREMENT = 4095;
  static readonly MAX_PROCESS_ID = 31;
  static readonly MAX_WORKER_ID = 31;

  readonly #id: Snowflake;
  readonly #epoch: number;

  constructor(snowflake: SnowflakeResolvable, options: SnowflakeOptions = {}) {
    this.#epoch = options.epoch ?? SnowflakeManager.DISCORD_EPOCH;
    this.#id = this.#resolveId(snowflake, options);
  }

  static fromTimestamp(
    timestamp: number | Date,
    options: SnowflakeOptions = {},
  ): SnowflakeManager {
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return new SnowflakeManager(time, options);
  }

  static toSnowflake(value: string): Snowflake {
    if (!SnowflakeManager.SNOWFLAKE_REGEX.test(value)) {
      throw new Error("Invalid Snowflake format: Must be 17-19 digits");
    }

    try {
      const timestamp =
        Number(BigInt(value) >> 22n) + SnowflakeManager.DISCORD_EPOCH;
      if (
        timestamp < SnowflakeManager.DISCORD_EPOCH ||
        timestamp > Date.now()
      ) {
        throw new Error("Invalid Snowflake: Timestamp out of valid range");
      }
      return value as Snowflake;
    } catch (_error) {
      throw new Error("Invalid Snowflake: Failed to parse value");
    }
  }

  static toSnowflakeSafe(value: string): Snowflake | null {
    try {
      return SnowflakeManager.toSnowflake(value);
    } catch {
      return null;
    }
  }

  static isValid(
    snowflake: string,
    epoch: number = SnowflakeManager.DISCORD_EPOCH,
  ): snowflake is Snowflake {
    try {
      if (!SnowflakeManager.SNOWFLAKE_REGEX.test(snowflake)) {
        return false;
      }
      const timestamp = Number(BigInt(snowflake) >> 22n) + epoch;
      return timestamp >= epoch && timestamp <= Date.now();
    } catch {
      return false;
    }
  }

  static resolve(
    resolvable: SnowflakeResolvable,
    options: SnowflakeOptions = {},
  ): Snowflake {
    if (resolvable instanceof SnowflakeManager) {
      return resolvable.toString();
    }

    if (resolvable instanceof Date) {
      return new SnowflakeManager(resolvable.getTime(), options).toString();
    }

    if (typeof resolvable === "bigint") {
      const snowflake = resolvable.toString();
      if (SnowflakeManager.isValid(snowflake)) {
        return SnowflakeManager.toSnowflake(snowflake);
      }
      throw new Error("Invalid bigint value for Snowflake");
    }

    if (typeof resolvable === "number") {
      if (resolvable < 0 || !Number.isInteger(resolvable)) {
        throw new Error("Invalid timestamp value");
      }
      return new SnowflakeManager(resolvable, options).toString();
    }

    if (
      typeof resolvable === "string" &&
      SnowflakeManager.isValid(resolvable)
    ) {
      return SnowflakeManager.toSnowflake(resolvable);
    }

    throw new Error("Invalid Snowflake value");
  }

  toString(): Snowflake {
    return this.#id;
  }

  toBigInt(): bigint {
    return BigInt(this.#id);
  }

  toDate(): Date {
    return new Date(this.getTimestamp());
  }

  getTimestamp(): number {
    return Number(this.toBigInt() >> 22n) + this.#epoch;
  }

  getWorkerId(): number {
    return Number((this.toBigInt() & 0x3e0000n) >> 17n);
  }

  getProcessId(): number {
    return Number((this.toBigInt() & 0x1f000n) >> 12n);
  }

  getIncrement(): number {
    return Number(this.toBigInt() & 0xfffn);
  }

  deconstruct(): SnowflakeEntity {
    return {
      timestamp: this.getTimestamp(),
      workerId: this.getWorkerId(),
      processId: this.getProcessId(),
      increment: this.getIncrement(),
      date: this.toDate(),
    };
  }

  compare(other: SnowflakeResolvable): number {
    const thisId = this.toBigInt();
    const otherId = new SnowflakeManager(other).toBigInt();
    if (thisId === otherId) {
      return 0;
    }
    return thisId > otherId ? 1 : -1;
  }

  isNewerThan(other: SnowflakeResolvable): boolean {
    return this.compare(other) > 0;
  }

  isOlderThan(other: SnowflakeResolvable): boolean {
    return this.compare(other) < 0;
  }

  equals(other: SnowflakeResolvable): boolean {
    return this.compare(other) === 0;
  }

  #resolveId(
    snowflake: SnowflakeResolvable,
    options: SnowflakeOptions,
  ): Snowflake {
    if (snowflake instanceof SnowflakeManager) {
      return snowflake.toString();
    }

    if (snowflake instanceof Date) {
      return this.#generate(snowflake.getTime(), options);
    }

    if (typeof snowflake === "bigint") {
      return snowflake.toString() as Snowflake;
    }

    const stringValue = String(snowflake);
    if (!SnowflakeManager.isValid(stringValue, this.#epoch)) {
      throw new Error("Invalid snowflake provided");
    }

    return stringValue as Snowflake;
  }

  #generate(
    timestamp: number = Date.now(),
    options: SnowflakeOptions = {},
  ): Snowflake {
    const { workerId = 0, processId = 0, increment = 0 } = options;
    this.#validateComponents(workerId, processId, increment);

    const timestampBits = BigInt(timestamp - this.#epoch) << 22n;
    const workerBits = BigInt(workerId) << 17n;
    const processBits = BigInt(processId) << 12n;
    const incrementBits = BigInt(increment);

    return (
      timestampBits |
      workerBits |
      processBits |
      incrementBits
    ).toString() as Snowflake;
  }

  #validateComponents(
    workerId: number,
    processId: number,
    increment: number,
  ): void {
    if (workerId < 0 || workerId > SnowflakeManager.MAX_WORKER_ID) {
      throw new Error(
        `Worker ID must be between 0 and ${SnowflakeManager.MAX_WORKER_ID}`,
      );
    }
    if (processId < 0 || processId > SnowflakeManager.MAX_PROCESS_ID) {
      throw new Error(
        `Process ID must be between 0 and ${SnowflakeManager.MAX_PROCESS_ID}`,
      );
    }
    if (increment < 0 || increment > SnowflakeManager.MAX_INCREMENT) {
      throw new Error(
        `Increment must be between 0 and ${SnowflakeManager.MAX_INCREMENT}`,
      );
    }
  }
}
