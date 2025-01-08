import { z } from "zod";

export const Snowflake = z
  .string()
  .refine((value) => SnowflakeManager.isValid(value));

export type Snowflake = z.infer<typeof Snowflake>;

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
  static readonly MAX_SNOWFLAKE = 2n ** 64n - 1n;
  static readonly TIMESTAMP_SHIFT = 22n;
  static readonly WORKER_BITS = 0x3e0000n;
  static readonly PROCESS_BITS = 0x1f000n;
  static readonly INCREMENT_BITS = 0xfffn;

  readonly #id: Snowflake;
  readonly #epoch: number;

  constructor(snowflake: SnowflakeResolvable, options: SnowflakeOptions = {}) {
    this.#epoch = options.epoch ?? SnowflakeManager.DISCORD_EPOCH;
    this.#id = this.#resolveId(snowflake, options);
  }

  static from(
    snowflake: SnowflakeResolvable,
    options: SnowflakeOptions = {},
  ): SnowflakeManager {
    return new SnowflakeManager(snowflake, options);
  }

  static fromTimestamp(
    timestamp: number | Date,
    options: SnowflakeOptions = {},
  ): SnowflakeManager {
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return new SnowflakeManager(time, options);
  }

  static isValid(
    snowflake: string,
    epoch: number = SnowflakeManager.DISCORD_EPOCH,
  ): snowflake is Snowflake {
    return SnowflakeManager.#validateSnowflake(snowflake, epoch);
  }

  static resolve(
    resolvable: SnowflakeResolvable,
    options: SnowflakeOptions = {},
  ): Snowflake {
    return new SnowflakeManager(resolvable, options).toString();
  }

  static #validateSnowflake(
    value: string,
    epoch: number = SnowflakeManager.DISCORD_EPOCH,
  ): boolean {
    try {
      if (!SnowflakeManager.SNOWFLAKE_REGEX.test(value)) {
        return false;
      }

      const snowflakeValue = BigInt(value);
      if (snowflakeValue > SnowflakeManager.MAX_SNOWFLAKE) {
        return false;
      }

      const timestamp =
        Number(snowflakeValue >> SnowflakeManager.TIMESTAMP_SHIFT) + epoch;
      return timestamp >= epoch && timestamp <= Date.now();
    } catch {
      return false;
    }
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
    return (
      Number(this.toBigInt() >> SnowflakeManager.TIMESTAMP_SHIFT) + this.#epoch
    );
  }

  getWorkerId(): number {
    return Number((this.toBigInt() & SnowflakeManager.WORKER_BITS) >> 17n);
  }

  getProcessId(): number {
    return Number((this.toBigInt() & SnowflakeManager.PROCESS_BITS) >> 12n);
  }

  getIncrement(): number {
    return Number(this.toBigInt() & SnowflakeManager.INCREMENT_BITS);
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
      const stringValue = snowflake.toString();
      if (!SnowflakeManager.isValid(stringValue, this.#epoch)) {
        throw new Error("Invalid bigint snowflake value");
      }

      return stringValue as Snowflake;
    }

    if (typeof snowflake === "number") {
      if (snowflake < 0 || !Number.isInteger(snowflake)) {
        throw new Error("Invalid timestamp value");
      }

      return this.#generate(snowflake, options);
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
    if (timestamp < this.#epoch) {
      throw new Error("Timestamp cannot be before epoch");
    }

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
    if (
      !Number.isInteger(workerId) ||
      workerId < 0 ||
      workerId > SnowflakeManager.MAX_WORKER_ID
    ) {
      throw new Error(
        `Worker ID must be an integer between 0 and ${SnowflakeManager.MAX_WORKER_ID}`,
      );
    }
    if (
      !Number.isInteger(processId) ||
      processId < 0 ||
      processId > SnowflakeManager.MAX_PROCESS_ID
    ) {
      throw new Error(
        `Process ID must be an integer between 0 and ${SnowflakeManager.MAX_PROCESS_ID}`,
      );
    }
    if (
      !Number.isInteger(increment) ||
      increment < 0 ||
      increment > SnowflakeManager.MAX_INCREMENT
    ) {
      throw new Error(
        `Increment must be an integer between 0 and ${SnowflakeManager.MAX_INCREMENT}`,
      );
    }
  }
}
