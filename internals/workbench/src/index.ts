import { HttpMethodFlag, Rest } from "@nyxjs/rest";
import { config } from "dotenv";

const { parsed: env } = config({ debug: true });

if (!env?.DISCORD_TOKEN) {
  throw new Error("Failed to parse .env file");
}

const rest = new Rest({
  token: env.DISCORD_TOKEN,
  compress: true,
});

rest.on("debug", console.log);
rest.on("error", console.error);
rest.on("warn", console.warn);
rest.on("apiRequest", console.log);
rest.on("rateLimitHit", console.log);
rest.on("requestRetry", console.log);
rest.on("responseReceived", console.log);
rest.on("proxyUpdate", console.log);

rest
  .request({
    path: "/users/@me",
    method: HttpMethodFlag.Get,
  })
  .then(console.log)
  .catch(console.error);
async function runBenchmark(iterations: number): Promise<void> {
  const restTimes: bigint[] = [];

  for (let i = 0; i < iterations; i++) {
    console.log(`Iteration ${i + 1}/${iterations}`);
    const start = process.hrtime.bigint();
    await rest.getRouter("users").getCurrentUser();
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

const iterations = 10;
runBenchmark(iterations).catch(console.error);
