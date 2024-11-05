export class SnowflakeManager {
    static readonly DISCORD_EPOCH = 1420070400000;
    static readonly MAX_INCREMENT = 4095;
    static readonly INCREMENT_BITS = 12;
    static readonly PROCESS_ID_BITS = 5;
    static readonly WORKER_ID_BITS = 5;
    static readonly TIMESTAMP_LEFT_SHIFT =
        SnowflakeManager.WORKER_ID_BITS + SnowflakeManager.PROCESS_ID_BITS + SnowflakeManager.INCREMENT_BITS;
    #increment: number;
    #lastTimestamp: number;
    readonly #workerId: number;
    readonly #processId: number;

    constructor(workerId = 1, processId = 1) {
        if (workerId > 31 || workerId < 0) {
            throw new Error("Worker ID must be between 0 and 31");
        }
        if (processId > 31 || processId < 0) {
            throw new Error("Process ID must be between 0 and 31");
        }

        this.#workerId = workerId;
        this.#processId = processId;
        this.#increment = 0;
        this.#lastTimestamp = -1;
    }

    static decodeSnowflake(snowflake: string): {
        timestamp: Date;
        workerId: number;
        processId: number;
        increment: number;
    } {
        const snowflakeNum = BigInt(snowflake);

        const timestamp = Number(snowflakeNum >> BigInt(22)) + SnowflakeManager.DISCORD_EPOCH;
        const workerId = Number((snowflakeNum & BigInt(0x3e0000)) >> BigInt(17));
        const processId = Number((snowflakeNum & BigInt(0x1f000)) >> BigInt(12));
        const increment = Number(snowflakeNum & BigInt(0xfff));

        return {
            timestamp: new Date(timestamp),
            workerId,
            processId,
            increment,
        };
    }

    static generateSnowflakeFromTimestamp(timestamp: number): string {
        const snowflake = BigInt(timestamp - SnowflakeManager.DISCORD_EPOCH) << BigInt(22);
        return snowflake.toString();
    }

    static isValidSnowflake(snowflake: string): boolean {
        try {
            const snowflakeNum = BigInt(snowflake);
            return snowflakeNum > 0;
        } catch {
            return false;
        }
    }

    generateSnowflake(): string {
        let timestamp = this.#getCurrentTimestamp();

        if (timestamp < this.#lastTimestamp) {
            throw new Error("Clock moved backwards. Refusing to generate snowflake.");
        }

        if (timestamp === this.#lastTimestamp) {
            this.#increment = (this.#increment + 1) & SnowflakeManager.MAX_INCREMENT;
            if (this.#increment === 0) {
                timestamp = this.#waitNextMillis(this.#lastTimestamp);
            }
        } else {
            this.#increment = 0;
        }

        this.#lastTimestamp = timestamp;

        const snowflake =
            (BigInt(timestamp - SnowflakeManager.DISCORD_EPOCH) << BigInt(SnowflakeManager.TIMESTAMP_LEFT_SHIFT)) |
            (BigInt(this.#workerId) << BigInt(SnowflakeManager.WORKER_ID_BITS + SnowflakeManager.INCREMENT_BITS)) |
            (BigInt(this.#processId) << BigInt(SnowflakeManager.INCREMENT_BITS)) |
            BigInt(this.#increment);

        return snowflake.toString();
    }

    #getCurrentTimestamp(): number {
        return Date.now();
    }

    #waitNextMillis(lastTimestamp: number): number {
        let timestamp = this.#getCurrentTimestamp();
        while (timestamp <= lastTimestamp) {
            timestamp = this.#getCurrentTimestamp();
        }
        return timestamp;
    }
}
