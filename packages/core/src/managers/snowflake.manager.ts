import { z } from "zod";
import { fromError } from "zod-validation-error";

const DISCORD_EPOCH = 1420070400000;
const MAX_INCREMENT = 4095;
const MAX_PROCESS_ID = 31;
const MAX_WORKER_ID = 31;
const TIMESTAMP_SHIFT = 22n;
const WORKER_ID_SHIFT = 17n;
const PROCESS_ID_SHIFT = 12n;

export const Snowflake = z.string().refine((value) => {
  try {
    const timestamp = Number(BigInt(value) >> TIMESTAMP_SHIFT) + DISCORD_EPOCH;
    return timestamp >= DISCORD_EPOCH && timestamp <= Date.now() + 3600000;
  } catch {
    return false;
  }
});

export type Snowflake = z.infer<typeof Snowflake>;

export const SnowflakeOptions = z
  .object({
    workerId: z.number().int().min(0).max(MAX_WORKER_ID).default(0),
    processId: z.number().int().min(0).max(MAX_PROCESS_ID).default(0),
    increment: z.number().int().min(0).max(MAX_INCREMENT).default(0),
    epoch: z.number().int().default(DISCORD_EPOCH),
  })
  .default({});

export type SnowflakeOptions = z.infer<typeof SnowflakeOptions>;

export const SnowflakeResolvable = z.union([
  z.string(),
  z.number(),
  z.bigint(),
  z.date(),
]);

export type SnowflakeResolvable = z.infer<typeof SnowflakeResolvable>;

export const SnowflakeEntity = z.object({
  timestamp: z.number(),
  workerId: z.number(),
  processId: z.number(),
  increment: z.number(),
  date: z.date(),
});

export type SnowflakeEntity = z.infer<typeof SnowflakeEntity>;

export class SnowflakeManager {
  readonly #id: Snowflake;
  readonly #options: SnowflakeOptions;

  constructor(
    snowflake: SnowflakeResolvable,
    options: z.input<typeof SnowflakeOptions> = {},
  ) {
    try {
      this.#options = SnowflakeOptions.parse(options);
    } catch (error) {
      throw new Error(fromError(error).message);
    }

    this.#id = this.#resolveId(snowflake, this.#options);
  }

  static from(
    snowflake: SnowflakeResolvable,
    options: Partial<SnowflakeOptions> = {},
  ): SnowflakeManager {
    return new SnowflakeManager(snowflake, options);
  }

  static fromTimestamp(
    timestamp: number | Date,
    options: Partial<SnowflakeOptions> = {},
  ): SnowflakeManager {
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return new SnowflakeManager(time, options);
  }

  static isValid(snowflake: string): snowflake is Snowflake {
    return Snowflake.safeParse(snowflake).success;
  }

  static resolve(
    resolvable: SnowflakeResolvable,
    options: Partial<SnowflakeOptions> = {},
  ): Snowflake {
    return new SnowflakeManager(resolvable, options).toString();
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
    return Number(this.toBigInt() >> TIMESTAMP_SHIFT) + this.#options.epoch;
  }

  getWorkerId(): number {
    return Number((this.toBigInt() & 0x3e0000n) >> WORKER_ID_SHIFT);
  }

  getProcessId(): number {
    return Number((this.toBigInt() & 0x1f000n) >> PROCESS_ID_SHIFT);
  }

  getIncrement(): number {
    return Number(this.toBigInt() & 0xfffn);
  }

  deconstruct(): SnowflakeEntity {
    return SnowflakeEntity.parse({
      timestamp: this.getTimestamp(),
      workerId: this.getWorkerId(),
      processId: this.getProcessId(),
      increment: this.getIncrement(),
      date: this.toDate(),
    });
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
    const parsedResolvable = SnowflakeResolvable.parse(snowflake);

    if (parsedResolvable instanceof Date) {
      return this.#generate(parsedResolvable.getTime(), options);
    }

    if (typeof parsedResolvable === "bigint") {
      const stringValue = parsedResolvable.toString();
      if (!Snowflake.safeParse(stringValue).success) {
        throw new Error("Invalid bigint snowflake value");
      }

      return stringValue as Snowflake;
    }

    if (typeof parsedResolvable === "number") {
      if (parsedResolvable < 0 || !Number.isInteger(parsedResolvable)) {
        throw new Error("Invalid timestamp value");
      }

      return this.#generate(parsedResolvable, options);
    }

    const stringValue = String(parsedResolvable);
    if (!Snowflake.safeParse(stringValue).success) {
      throw new Error("Invalid snowflake provided");
    }

    return stringValue as Snowflake;
  }

  #generate(timestamp: number, options: SnowflakeOptions): Snowflake {
    if (timestamp < this.#options.epoch) {
      throw new Error("Timestamp cannot be before epoch");
    }

    const timestampBits =
      BigInt(timestamp - this.#options.epoch) << TIMESTAMP_SHIFT;
    const workerBits = BigInt(options.workerId) << WORKER_ID_SHIFT;
    const processBits = BigInt(options.processId) << PROCESS_ID_SHIFT;
    const incrementBits = BigInt(options.increment);

    const snowflake = (
      timestampBits |
      workerBits |
      processBits |
      incrementBits
    ).toString();
    return Snowflake.parse(snowflake);
  }
}
