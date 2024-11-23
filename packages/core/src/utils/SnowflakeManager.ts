export const SnowflakeManager = {
  discordEpoch: 1420070400000,
  snowflakeRegex: /^\d+$/,
  toDate(snowflake: string): Date {
    const timestamp =
      Number(BigInt(snowflake) >> 22n) + SnowflakeManager.discordEpoch;
    return new Date(timestamp);
  },
  fromDate(date: Date): string {
    const timestamp = date.getTime() - SnowflakeManager.discordEpoch;
    return (BigInt(timestamp) << 22n).toString();
  },
  getTimestamp(snowflake: string): number {
    return Number(BigInt(snowflake) >> 22n) + SnowflakeManager.discordEpoch;
  },
  getWorkerId(snowflake: string): number {
    return Number((BigInt(snowflake) & 0x3e0000n) >> 17n);
  },
  getProcessId(snowflake: string): number {
    return Number((BigInt(snowflake) & 0x1f000n) >> 12n);
  },
  getIncrement(snowflake: string): number {
    return Number(BigInt(snowflake) & 0xfffn);
  },
  isValid(snowflake: string): boolean {
    try {
      if (!this.snowflakeRegex.test(snowflake)) {
        return false;
      }
      const timestamp = SnowflakeManager.getTimestamp(snowflake);
      return (
        timestamp >= SnowflakeManager.discordEpoch && timestamp <= Date.now()
      );
    } catch {
      return false;
    }
  },
  isNewer(snowflake1: string, snowflake2: string): boolean {
    if (
      !(
        SnowflakeManager.isValid(snowflake1) &&
        SnowflakeManager.isValid(snowflake2)
      )
    ) {
      throw new Error("Invalid snowflake provided");
    }
    return BigInt(snowflake1) > BigInt(snowflake2);
  },
  generate(
    timestamp: number = Date.now(),
    workerId = 0,
    processId = 0,
    increment = 0,
  ): string {
    if (workerId < 0 || workerId > 31) {
      throw new Error("Worker ID must be between 0 and 31");
    }
    if (processId < 0 || processId > 31) {
      throw new Error("Process ID must be between 0 and 31");
    }
    if (increment < 0 || increment > 4095) {
      throw new Error("Increment must be between 0 and 4095");
    }

    const timestampBits =
      BigInt(timestamp - SnowflakeManager.discordEpoch) << 22n;
    const workerBits = BigInt(workerId) << 17n;
    const processBits = BigInt(processId) << 12n;
    const incrementBits = BigInt(increment);

    return (
      timestampBits |
      workerBits |
      processBits |
      incrementBits
    ).toString();
  },
};
