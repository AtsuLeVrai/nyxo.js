export type Snowflake = string;

export type SnowflakeDateFormat = "short" | "long" | "relative" | "iso";

export interface DeconstructedSnowflake {
  timestamp: number;
  workerId: number;
  processId: number;
  increment: number;
  date: Date;
}

export const DISCORD_EPOCH = 1420070400000 as const;
export const TIMESTAMP_SHIFT = 22n as const;
export const WORKER_ID_SHIFT = 17n as const;
export const PROCESS_ID_SHIFT = 12n as const;
export const INCREMENT_MASK = 0xfffn as const;

export const SnowflakeUtil = {
  isValid(snowflake: string): snowflake is Snowflake {
    try {
      return /^\d{17,20}$/.test(snowflake);
    } catch {
      return false;
    }
  },

  deconstruct(snowflake: Snowflake): DeconstructedSnowflake {
    const bigintSnowflake = BigInt(snowflake);

    const timestamp = Number((bigintSnowflake >> TIMESTAMP_SHIFT) + BigInt(DISCORD_EPOCH));
    const workerId = Number((bigintSnowflake & 0x3e0000n) >> WORKER_ID_SHIFT);
    const processId = Number((bigintSnowflake & 0x1f000n) >> PROCESS_ID_SHIFT);
    const increment = Number(bigintSnowflake & INCREMENT_MASK);

    return {
      timestamp,
      workerId,
      processId,
      increment,
      date: new Date(timestamp),
    };
  },

  getTimestamp(snowflake: Snowflake): number {
    return Number((BigInt(snowflake) >> TIMESTAMP_SHIFT) + BigInt(DISCORD_EPOCH));
  },

  getDate(snowflake: Snowflake): Date {
    return new Date(this.getTimestamp(snowflake));
  },

  generate(
    timestamp: number | Date = Date.now(),
    increment: number = Math.floor(Math.random() * 4095),
    workerId = 1,
    processId = 0,
  ): Snowflake {
    const resolvedTimestamp = timestamp instanceof Date ? timestamp.getTime() : timestamp;

    const timestampRelative = BigInt(resolvedTimestamp - DISCORD_EPOCH);

    const snowflake =
      (timestampRelative << TIMESTAMP_SHIFT) |
      (BigInt(workerId & 0x1f) << WORKER_ID_SHIFT) |
      (BigInt(processId & 0x1f) << PROCESS_ID_SHIFT) |
      BigInt(increment & 0xfff);

    return snowflake.toString() as Snowflake;
  },

  generateFromReference(referenceId: Snowflake, timeOffset: number): Snowflake {
    const timestamp = this.getTimestamp(referenceId) + timeOffset;
    return this.generate(timestamp);
  },

  compare(snowflake1: Snowflake, snowflake2: Snowflake): number {
    const timestamp1 = this.getTimestamp(snowflake1);
    const timestamp2 = this.getTimestamp(snowflake2);
    return timestamp1 - timestamp2;
  },

  timeBetween(snowflake1: Snowflake, snowflake2: Snowflake): number {
    return Math.abs(this.getTimestamp(snowflake1) - this.getTimestamp(snowflake2));
  },

  isOlderThan(snowflake: Snowflake, date: Date): boolean {
    return this.getTimestamp(snowflake) < date.getTime();
  },

  isNewerThan(snowflake: Snowflake, date: Date): boolean {
    return this.getTimestamp(snowflake) > date.getTime();
  },

  formatDate(snowflake: Snowflake, format: SnowflakeDateFormat = "long"): string {
    const date = this.getDate(snowflake);

    switch (format) {
      case "short":
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

      case "long":
        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

      case "relative": {
        const now = Date.now();
        const diff = now - date.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        if (years > 0) {
          return `${years} year${years === 1 ? "" : "s"} ago`;
        }
        if (months > 0) {
          return `${months} month${months === 1 ? "" : "s"} ago`;
        }
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

      case "iso":
        return date.toISOString();

      default:
        return date.toLocaleString();
    }
  },
} as const;

export function assertSnowflake(value: string): Snowflake {
  if (!SnowflakeUtil.isValid(value)) {
    throw new Error(`Invalid snowflake: ${value}`);
  }
  return value;
}
