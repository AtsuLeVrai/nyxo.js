import { ApiVersion } from "@nyxjs/core";
import { AuthTypeFlag, Rest } from "@nyxjs/rest";
import { config } from "dotenv";

const { parsed: env } = config({ debug: true });

if (!env?.DISCORD_TOKEN) {
  throw new Error("Failed to parse .env file");
}

const rest = new Rest({
  token: env.DISCORD_TOKEN,
  authType: AuthTypeFlag.Bot,
  version: ApiVersion.V10,
  compress: true,
});

rest.on("debug", console.log);
rest.on("error", console.error);
rest.on("warn", console.warn);
rest.on("apiRequest", console.log);
rest.on("rateLimitHit", console.log);

async function runBenchmark(iterations: number): Promise<void> {
  const restTimes: bigint[] = [];

  for (let i = 0; i < iterations; i++) {
    console.log(`Iteration ${i + 1}/${iterations}`);
    const start = process.hrtime.bigint();
    await rest.users.getCurrentUser();
    const end = process.hrtime.bigint();
    restTimes.push(end - start);
  }

  const restAverage = restTimes.reduce((a, b) => a + b) / BigInt(iterations);

  console.log(`Nyx.js average time: ${restAverage} nanoseconds`);

  const memoryUsage = process.memoryUsage();
  console.log(`Heap total: ${memoryUsage.heapTotal}`);
  console.log(`Heap used: ${memoryUsage.heapUsed}`);
  console.log(`External: ${memoryUsage.external}`);
  console.log(`Array Buffers: ${memoryUsage.arrayBuffers}`);
}

const iterations = 100;
runBenchmark(iterations).catch(console.error);
