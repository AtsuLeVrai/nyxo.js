import {DISCORD_EPOCH, DiscordSnowflake} from "../src";

describe('DiscordSnowflake', () => {
    test('getInternalWorkerId should return correct worker ID', () => {
        const snowflake = '123456789012345678';
        const workerId = DiscordSnowflake.getInternalWorkerId(snowflake);
        expect(workerId).toBe(Number((BigInt(snowflake) & 0x3E0000n) >> 17n));
    });

    test('getProcessId should return correct process ID', () => {
        const snowflake = '123456789012345678';
        const processId = DiscordSnowflake.getProcessId(snowflake);
        expect(processId).toBe(Number((BigInt(snowflake) & 0x1F000n) >> 12n));
    });

    test('getIncrement should return correct increment', () => {
        const snowflake = '123456789012345678';
        const increment = DiscordSnowflake.getIncrement(snowflake);
        expect(increment).toBe(Number(BigInt(snowflake) & 0xFFFn));
    });

    test('snowflakeToTimestamp should return correct timestamp', () => {
        const snowflake = '123456789012345678';
        const timestamp = DiscordSnowflake.snowflakeToTimestamp(snowflake);
        expect(timestamp).toBe(Number((BigInt(snowflake) >> 22n) + DISCORD_EPOCH));
    });

    test('timestampToSnowflake should return correct snowflake', () => {
        const timestamp = Date.now();
        const snowflake = DiscordSnowflake.timestampToSnowflake(timestamp);
        expect(BigInt(snowflake)).toBe((BigInt(timestamp) - DISCORD_EPOCH) << 22n);
    });
});
