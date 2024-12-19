export type Snowflake = string & {
  readonly __brand: unique symbol;
};

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
  static readonly DEFAULT_BATCH_SIZE = 100;
  static #incrementCounter = 0;
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
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
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

  static assertSnowflake(value: unknown): asserts value is Snowflake {
    if (typeof value !== "string" || !SnowflakeManager.isValid(value)) {
      throw new Error(`Expected Snowflake, got ${typeof value}`);
    }
  }

  static generateSequential(
    count: number,
    options: SnowflakeOptions = {},
  ): Snowflake[] {
    const results: Snowflake[] = [];
    const baseTimestamp = Date.now();
    const timestampStep = 1; // 1ms between each snowflake

    for (let i = 0; i < count; i++) {
      const timestamp = baseTimestamp + i * timestampStep;
      results.push(
        new SnowflakeManager(timestamp, {
          ...options,
          increment:
            SnowflakeManager.#incrementCounter++ %
            SnowflakeManager.MAX_INCREMENT,
        }).toString(),
      );
    }

    return results;
  }

  static createBulk(
    options: {
      startTime?: Date | number;
      endTime?: Date | number;
      count?: number;
      distribution?: "uniform" | "random";
      workerId?: number;
      processId?: number;
    } = {},
  ): Snowflake[] {
    const {
      startTime = new Date(Date.now() - 24 * 60 * 60 * 1000), // Default to last 24 hours
      endTime = new Date(),
      count = SnowflakeManager.DEFAULT_BATCH_SIZE,
      distribution = "uniform",
      workerId = 1,
      processId = 1,
    } = options;

    const start = startTime instanceof Date ? startTime.getTime() : startTime;
    const end = endTime instanceof Date ? endTime.getTime() : endTime;
    const results: Snowflake[] = [];

    if (distribution === "uniform") {
      const step = Math.floor((end - start) / (count - 1));
      for (let i = 0; i < count; i++) {
        const timestamp = start + step * i;
        results.push(
          new SnowflakeManager(timestamp, {
            workerId,
            processId,
            increment: Math.floor(
              Math.random() * SnowflakeManager.MAX_INCREMENT,
            ),
          }).toString(),
        );
      }
    } else {
      for (let i = 0; i < count; i++) {
        const timestamp = start + Math.floor(Math.random() * (end - start));
        results.push(
          new SnowflakeManager(timestamp, {
            workerId,
            processId,
            increment: Math.floor(
              Math.random() * SnowflakeManager.MAX_INCREMENT,
            ),
          }).toString(),
        );
      }
    }

    return results.sort((a, b) => Number(BigInt(a) - BigInt(b)));
  }

  static batch(count: number, options: SnowflakeOptions = {}): Snowflake[] {
    const results: Snowflake[] = [];
    const baseIncrement = options.increment ?? 0;

    for (let i = 0; i < count; i++) {
      results.push(
        new SnowflakeManager(Date.now(), {
          ...options,
          increment: (baseIncrement + i) % SnowflakeManager.MAX_INCREMENT,
        }).toString(),
      );
    }

    return results;
  }

  static getTimeDifference(
    first: SnowflakeResolvable,
    second: SnowflakeResolvable,
  ): number {
    const firstTimestamp = new SnowflakeManager(first).getTimestamp();
    const secondTimestamp = new SnowflakeManager(second).getTimestamp();
    return Math.abs(firstTimestamp - secondTimestamp);
  }

  static isInTimeRange(
    snowflake: SnowflakeResolvable,
    start: number | Date,
    end: number | Date = Date.now(),
  ): boolean {
    const timestamp = new SnowflakeManager(snowflake).getTimestamp();
    const startTime = start instanceof Date ? start.getTime() : start;
    const endTime = end instanceof Date ? end.getTime() : end;
    return timestamp >= startTime && timestamp <= endTime;
  }

  static filterByTimeRange(
    snowflakes: SnowflakeResolvable[],
    start: number | Date,
    end: number | Date = Date.now(),
  ): Snowflake[] {
    return snowflakes
      .filter((snowflake) =>
        SnowflakeManager.isInTimeRange(snowflake, start, end),
      )
      .map((snowflake) => new SnowflakeManager(snowflake).toString());
  }

  static getTimestampFrom(snowflake: string): number {
    if (!SnowflakeManager.isValid(snowflake)) {
      throw new Error("Invalid snowflake format");
    }
    return Number(BigInt(snowflake) >> 22n) + SnowflakeManager.DISCORD_EPOCH;
  }

  static isNewerThan(
    snowflake: SnowflakeResolvable,
    timestamp: number | Date,
  ): boolean {
    const snowflakeTime = new SnowflakeManager(snowflake).getTimestamp();
    const compareTime =
      timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return snowflakeTime > compareTime;
  }

  static fromDateString(
    dateString: string,
    options: SnowflakeOptions = {},
  ): SnowflakeManager {
    const timestamp = new Date(dateString).getTime();
    if (Number.isNaN(timestamp)) {
      throw new Error("Invalid date string");
    }
    return new SnowflakeManager(timestamp, options);
  }

  static generateRange(
    start: number | Date,
    end: number | Date,
    options: SnowflakeOptions & { count?: number } = {},
  ): Snowflake[] {
    const startTime = start instanceof Date ? start.getTime() : start;
    const endTime = end instanceof Date ? end.getTime() : end;
    const count = options.count || 10;

    const step = Math.floor((endTime - startTime) / (count - 1));
    const results: Snowflake[] = [];

    for (let i = 0; i < count; i++) {
      const timestamp = startTime + step * i;
      results.push(new SnowflakeManager(timestamp, options).toString());
    }

    return results;
  }

  static createTimeWindowSnowflakes(
    options: {
      windowSize?: number;
      count?: number;
      endTime?: Date | number;
      workerId?: number;
      processId?: number;
    } = {},
  ): Snowflake[] {
    const {
      windowSize = 60 * 60 * 1000, // Default 1 hour
      count = 10,
      endTime = Date.now(),
      workerId = 1,
      processId = 1,
    } = options;

    const end = endTime instanceof Date ? endTime.getTime() : endTime;
    const start = end - windowSize;

    return SnowflakeManager.createBulk({
      startTime: start,
      endTime: end,
      count,
      workerId,
      processId,
      distribution: "uniform",
    });
  }

  static findClosestTo(
    timestamp: number | Date,
    snowflakes: SnowflakeResolvable[],
  ): Snowflake {
    const targetTime =
      timestamp instanceof Date ? timestamp.getTime() : timestamp;

    return snowflakes
      .map((snowflake) => new SnowflakeManager(snowflake))
      .reduce((closest, current) => {
        const closestDiff = Math.abs(closest.getTimestamp() - targetTime);
        const currentDiff = Math.abs(current.getTimestamp() - targetTime);
        return currentDiff < closestDiff ? current : closest;
      })
      .toString();
  }

  static resolve(
    resolvable: SnowflakeResolvable,
    options: SnowflakeOptions = {},
  ): Snowflake {
    try {
      if (resolvable instanceof SnowflakeManager) {
        return resolvable.toString();
      }

      if (typeof resolvable === "bigint") {
        const snowflake = resolvable.toString();
        if (SnowflakeManager.isValid(snowflake)) {
          return SnowflakeManager.toSnowflake(snowflake);
        }
        throw new Error("Invalid bigint value for Snowflake");
      }

      if (resolvable instanceof Date) {
        return new SnowflakeManager(resolvable.getTime(), options).toString();
      }

      if (typeof resolvable === "number") {
        if (resolvable < 0 || !Number.isInteger(resolvable)) {
          throw new Error("Invalid timestamp value");
        }
        return new SnowflakeManager(resolvable, options).toString();
      }

      if (typeof resolvable === "string") {
        if (SnowflakeManager.isValid(resolvable)) {
          return SnowflakeManager.toSnowflake(resolvable);
        }

        if (/^\d+$/.test(resolvable)) {
          const numericValue = BigInt(resolvable);
          if (SnowflakeManager.isValid(numericValue.toString())) {
            return SnowflakeManager.toSnowflake(numericValue.toString());
          }
        }

        throw new Error("Invalid string value for Snowflake");
      }

      throw new Error("Unresolvable snowflake value");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to resolve Snowflake: ${error.message}`);
      }
      throw new Error("Failed to resolve Snowflake: Unknown error");
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

  static min(timestamp: number | Date = Date.now()): SnowflakeManager {
    return SnowflakeManager.fromTimestamp(timestamp, {
      workerId: 0,
      processId: 0,
      increment: 0,
    });
  }

  static max(timestamp: number | Date = Date.now()): SnowflakeManager {
    return SnowflakeManager.fromTimestamp(timestamp, {
      workerId: SnowflakeManager.MAX_WORKER_ID,
      processId: SnowflakeManager.MAX_PROCESS_ID,
      increment: SnowflakeManager.MAX_INCREMENT,
    });
  }

  getFormattedDate(locale = "en-US"): string {
    return this.toDate().toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  getAge(): number {
    return Date.now() - this.getTimestamp();
  }

  getAgeInSeconds(): number {
    return Math.floor(this.getAge() / 1000);
  }

  isMin(): boolean {
    return (
      this.getWorkerId() === 0 &&
      this.getProcessId() === 0 &&
      this.getIncrement() === 0
    );
  }

  isMax(): boolean {
    return (
      this.getWorkerId() === SnowflakeManager.MAX_WORKER_ID &&
      this.getProcessId() === SnowflakeManager.MAX_PROCESS_ID &&
      this.getIncrement() === SnowflakeManager.MAX_INCREMENT
    );
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

  toJson(): { id: string } & SnowflakeEntity {
    return {
      id: this.toString(),
      ...this.deconstruct(),
    };
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

  getRelativeAge(): string {
    const age = this.getAge();
    const seconds = Math.floor(age / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }
    return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  }

  isWithinLast(duration: number): boolean {
    return this.getAge() <= duration;
  }

  getNextSnowflake(options: SnowflakeOptions = {}): Snowflake {
    const timestamp = this.getTimestamp();
    const nextIncrement =
      (this.getIncrement() + 1) % SnowflakeManager.MAX_INCREMENT;

    return new SnowflakeManager(timestamp, {
      workerId: this.getWorkerId(),
      processId: this.getProcessId(),
      increment: nextIncrement,
      ...options,
    }).toString();
  }

  getPreviousSnowflake(options: SnowflakeOptions = {}): Snowflake {
    const timestamp = this.getTimestamp();
    const prevIncrement =
      this.getIncrement() === 0
        ? SnowflakeManager.MAX_INCREMENT
        : this.getIncrement() - 1;

    return new SnowflakeManager(timestamp, {
      workerId: this.getWorkerId(),
      processId: this.getProcessId(),
      increment: prevIncrement,
      ...options,
    }).toString();
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
