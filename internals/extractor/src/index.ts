import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { get } from "node:https";
import { join } from "node:path";
import { launch } from "puppeteer";

interface UrlCheckResult {
  isValid: boolean;
  statusCode?: number;
  error?: unknown;
}

interface ExtractionResult {
  url: string;
  success: boolean;
  message: string;
  filePath: string | null;
}

async function checkUrl(url: string): Promise<UrlCheckResult> {
  return new Promise((resolve) => {
    try {
      const request = get(url, (response) => {
        resolve({
          isValid:
            response.statusCode !== undefined &&
            response.statusCode >= 200 &&
            response.statusCode < 400,
          statusCode: response.statusCode,
        });
      });

      request.on("error", (error) => {
        resolve({
          isValid: false,
          error: error.message,
        });
      });

      request.setTimeout(10000, () => {
        request.destroy();
        resolve({
          isValid: false,
          error: "Timeout while checking URL",
        });
      });
    } catch (error) {
      resolve({
        isValid: false,
        error: error,
      });
    }
  });
}

async function extractAndSaveHtml(
  url: string,
  outputDir: string,
): Promise<ExtractionResult> {
  const urlCheck = await checkUrl(url);
  if (!urlCheck.isValid) {
    return {
      url,
      success: false,
      message: `Invalid or inaccessible URL (${urlCheck.statusCode ?? urlCheck.error})`,
      filePath: null,
    };
  }

  const browser = await launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(30000);
    page.setDefaultTimeout(30000);

    page.on("console", (msg) => console.log("Page log:", msg.text()));
    page.on("pageerror", (error) => console.log("Page error:", error.message));

    await page.goto(url, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    await Promise.race([
      page.waitForSelector(".contentWrapper-3RqEiS"),
      page.waitForSelector(".markdown-19oyJN"),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout waiting for content")),
          10000,
        ),
      ),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const html = await page.evaluate(() => {
      const mainContent = document.querySelector("main");
      if (!mainContent) {
        throw new Error("Main content not found");
      }
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Discord Developer Documentation</title>
        </head>
        <body>
            ${mainContent.innerHTML}
        </body>
        </html>
      `;
    });

    const urlPath = new URL(url).pathname;
    const lastSegment =
      urlPath
        .split("/")
        .filter((segment) => segment)
        .pop() ?? Math.random().toString(36).substring(7);
    const fileName = `${lastSegment}.html`;
    const filePath = join(outputDir, fileName);

    writeFileSync(filePath, html, "utf8");

    await browser.close();

    return {
      url,
      success: true,
      message: `Page successfully saved to: ${filePath}`,
      filePath,
    };
  } catch (error) {
    console.error("Detailed error:", error);
    try {
      await browser.close();
    } catch (closeError) {
      console.error("Error while closing browser:", closeError);
    }
    return {
      url,
      success: false,
      message: `Extraction error: ${error}`,
      filePath: null,
    };
  }
}

async function processUrlsInParallel(
  urls: string[],
  outputDir: string,
  concurrencyLimit: number,
): Promise<ExtractionResult[]> {
  const results: ExtractionResult[] = [];
  const pending = new Set<Promise<ExtractionResult>>();
  const urlQueue = [...urls];
  const totalUrls = urls.length;

  console.log("\nStarting parallel extraction:");
  console.log(`- Maximum concurrent jobs: ${concurrencyLimit}`);
  console.log(`- Total URLs to process: ${totalUrls}`);
  console.log(
    "- Progress format: [Job N/Max] Processing: URL (Progress/Total)\n",
  );

  while (urlQueue.length > 0 || pending.size > 0) {
    while (pending.size < concurrencyLimit && urlQueue.length > 0) {
      const url = urlQueue.shift();
      if (!url) {
        break;
      }

      const promise = (async () => {
        const jobNumber = pending.size + 1;
        const progress = totalUrls - urlQueue.length;
        console.log(
          `[Job ${jobNumber}/${concurrencyLimit}] Processing: ${url} (${progress}/${totalUrls})`,
        );
        return await extractAndSaveHtml(url, outputDir);
      })();

      pending.add(promise);
      promise.then((result) => {
        results.push(result);
        pending.delete(promise);
      });
    }

    if (pending.size > 0) {
      await Promise.race(pending);
    }
  }

  return results;
}

const urls: string[] = [
  "https://discord.com/developers/docs/reference",
  "https://discord.com/developers/docs/interactions/overview",
  "https://discord.com/developers/docs/interactions/receiving-and-responding",
  "https://discord.com/developers/docs/interactions/application-commands",
  "https://discord.com/developers/docs/interactions/message-components",
  "https://discord.com/developers/docs/events/overview",
  "https://discord.com/developers/docs/events/gateway",
  "https://discord.com/developers/docs/events/gateway-events",
  "https://discord.com/developers/docs/events/webhook-events",
  "https://discord.com/developers/docs/resources/application",
  "https://discord.com/developers/docs/resources/application-role-connection-metadata",
  "https://discord.com/developers/docs/resources/audit-log",
  "https://discord.com/developers/docs/resources/auto-moderation",
  "https://discord.com/developers/docs/resources/channel",
  "https://discord.com/developers/docs/resources/emoji",
  "https://discord.com/developers/docs/resources/entitlement",
  "https://discord.com/developers/docs/resources/guild",
  "https://discord.com/developers/docs/resources/guild-scheduled-event",
  "https://discord.com/developers/docs/resources/guild-template",
  "https://discord.com/developers/docs/resources/invite",
  "https://discord.com/developers/docs/resources/message",
  "https://discord.com/developers/docs/resources/poll",
  "https://discord.com/developers/docs/resources/sku",
  "https://discord.com/developers/docs/resources/soundboard",
  "https://discord.com/developers/docs/resources/stage-instance",
  "https://discord.com/developers/docs/resources/sticker",
  "https://discord.com/developers/docs/resources/subscription",
  "https://discord.com/developers/docs/resources/user",
  "https://discord.com/developers/docs/resources/voice",
  "https://discord.com/developers/docs/resources/webhook",
  "https://discord.com/developers/docs/topics/oauth2",
  "https://discord.com/developers/docs/topics/opcodes-and-status-codes",
  "https://discord.com/developers/docs/topics/permissions",
  "https://discord.com/developers/docs/topics/rate-limits",
  "https://discord.com/developers/docs/topics/teams",
  "https://discord.com/developers/docs/topics/threads",
  "https://discord.com/developers/docs/topics/voice-connections",
];

const outputDir = "./out";
const CONCURRENCY_LIMIT = 10;

async function main(): Promise<void> {
  const results = await processUrlsInParallel(
    urls,
    outputDir,
    CONCURRENCY_LIMIT,
  );

  console.log("\nExtraction Summary:");
  console.log("------------------------");

  for (const result of results) {
    console.log(`URL: ${result.url}`);
    console.log(`Status: ${result.success ? "Success ✓" : "Failed ✗"}`);
    console.log(`Message: ${result.message}`);
    if (result.success) {
      console.log(`File: ${result.filePath}`);
    }
    console.log("------------------------");
  }

  const successful = results.filter((r) => r.success).length;
  console.log("\nFinal Statistics:");
  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${results.length - successful}`);
}

main().catch((error) => {
  console.error("An error occurred during extraction:", error);
  process.exit(1);
});
