import type { Snowflake } from "@nyxjs/core";

export type DeconstructedSnowflakeResult = {
    date: Date;
    increment: number;
    processId: number;
    timestamp: number;
    workerId: number;
};

export class SnowflakeProvider {
    private static readonly DISCORD_EPOCH: bigint = 1_420_070_400_000n;

    public static generateSnowflake(): string {
        const timestamp: number = Date.now() - Number(SnowflakeProvider.DISCORD_EPOCH);
        return ((BigInt(timestamp) << 22n) | (0n << 17n) | (0n << 12n) | 0n).toString();
    }

    public static snowflakeToTimestamp(snowflake: Snowflake): number {
        return Number(BigInt(snowflake) >> (22n + SnowflakeProvider.DISCORD_EPOCH));
    }

    public static timestampToSnowflake(timestamp: number): Snowflake {
        const discordMs: number = timestamp - Number(SnowflakeProvider.DISCORD_EPOCH);
        return ((BigInt(discordMs) << 22n) | (0n << 17n) | (0n << 12n) | 0n).toString();
    }

    public static extractTimestamp(snowflake: Snowflake): number {
        return Number(BigInt(snowflake) >> (22n + SnowflakeProvider.DISCORD_EPOCH));
    }

    public static extractWorkerId(snowflake: Snowflake): number {
        return Number((BigInt(snowflake) & 0x3e0000n) >> 17n);
    }

    public static extractProcessId(snowflake: Snowflake): number {
        return Number((BigInt(snowflake) & 0x1f000n) >> 12n);
    }

    public static extractIncrement(snowflake: Snowflake): number {
        return Number(BigInt(snowflake) & 0xfffn);
    }

    public static snowflakeToBinary(snowflake: Snowflake): string {
        return BigInt(snowflake).toString(2).padStart(64, "0");
    }

    public static isValidSnowflake(snowflake: Snowflake): boolean {
        try {
            BigInt(snowflake);
            return snowflake.length === 18;
        } catch {
            return false;
        }
    }

    public static snowflakeToDate(snowflake: Snowflake): Date {
        return new Date(SnowflakeProvider.snowflakeToTimestamp(snowflake));
    }

    public static dateToSnowflake(date: Date): Snowflake {
        return SnowflakeProvider.timestampToSnowflake(date.getTime());
    }

    public static compareSnowflakes(snowflake1: Snowflake, snowflake2: Snowflake): number {
        return SnowflakeProvider.snowflakeToTimestamp(snowflake1) - SnowflakeProvider.snowflakeToTimestamp(snowflake2);
    }

    public static isSnowflakeBeforeDate(snowflake: Snowflake, date: Date): boolean {
        return SnowflakeProvider.snowflakeToTimestamp(snowflake) < date.getTime();
    }

    public static generateCustomSnowflake(workerId: number, processId: number): Snowflake {
        const timestamp = BigInt(Date.now() - Number(SnowflakeProvider.DISCORD_EPOCH));
        const workerIdBits: bigint = BigInt(workerId) << 17n;
        const processIdBits: bigint = BigInt(processId) << 12n;
        const increment = 0n;

        return ((timestamp << 22n) | workerIdBits | processIdBits | increment).toString();
    }

    public static deconstructSnowflake(snowflake: Snowflake): DeconstructedSnowflakeResult {
        const timestamp = SnowflakeProvider.extractTimestamp(snowflake);
        return {
            timestamp,
            workerId: SnowflakeProvider.extractWorkerId(snowflake),
            processId: SnowflakeProvider.extractProcessId(snowflake),
            increment: SnowflakeProvider.extractIncrement(snowflake),
            date: new Date(timestamp),
        };
    }
}
