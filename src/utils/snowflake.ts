export const DISCORD_EPOCH = 1420070400000n as const;

export const Snowflake = {
  isValid: (id: string): boolean => /^\d{17,20}$/.test(id),
  toTimestamp: (id: string): number => Number((BigInt(id) >> 22n) + DISCORD_EPOCH),
  toDate: (id: string): Date => new Date(Snowflake.toTimestamp(id)),
  age: (id: string): number => Date.now() - Snowflake.toTimestamp(id),
  isOlderThan: (id: string, ms: number): boolean => Snowflake.age(id) > ms,
  compare: (a: string, b: string): number => Snowflake.toTimestamp(a) - Snowflake.toTimestamp(b),
} as const;
