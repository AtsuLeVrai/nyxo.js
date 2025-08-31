export const DISCORD_EPOCH = 1420070400000n as const;

export const SnowflakeUtil = {
  isValid: (id: string): boolean => /^\d{17,20}$/.test(id),
  toTimestamp: (id: string): number => Number((BigInt(id) >> 22n) + DISCORD_EPOCH),
  toDate: (id: string): Date => new Date(SnowflakeUtil.toTimestamp(id)),
  age: (id: string): number => Date.now() - SnowflakeUtil.toTimestamp(id),
  isOlderThan: (id: string, ms: number): boolean => SnowflakeUtil.age(id) > ms,
  compare: (a: string, b: string): number =>
    SnowflakeUtil.toTimestamp(a) - SnowflakeUtil.toTimestamp(b),
} as const;
