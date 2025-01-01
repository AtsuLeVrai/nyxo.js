import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import TurndownService from "turndown";

const UrlProcessor = {
  processUrls(markdown) {
    const endpointProcessed = markdown.replace(
      /`(GET|POST|PUT|DELETE|PATCH)` `\/([^`]+)`(?:\[([^\]]+)\]\(([^)]+)\))?/g,
      (_match, method, path, paramText, paramLink) => {
        if (paramText && paramLink) {
          return `\`${method}\` \`/${path}\` [${paramText}](${paramLink.replace("/developers/docs/", "/docs/")})`;
        }
        return `\`${method}\` \`/${path}\``;
      },
    );

    return endpointProcessed.replace(
      /\[([^\]]+)\]\((\/developers\/docs[^)]+)\)/g,
      (_match, text, link) => {
        const cleanLink = link.replace("/developers/docs/", "/docs/");
        return `[${text}](${cleanLink})`;
      },
    );
  },

  standardizeHeaders(markdown) {
    const h6Processed = markdown.replace(/^#{6}\s+(.+)$/gm, "### $1");
    return h6Processed.replace(/^## /gm, "\n---\n\n## ");
  },
  cleanMarkdown(markdown) {
    const urlProcessed = UrlProcessor.processUrls(markdown);
    return UrlProcessor.standardizeHeaders(urlProcessed);
  },
};

const MarkdownCleaner = {
  cleanTitles(markdown) {
    return markdown.replace(/^(#+\s*[^\n]+)\[\s*\n*\]\([^)]+\)/gm, "$1");
  },
  cleanEndpoints(markdown) {
    return markdown.replace(
      /^(GET|POST|PUT|DELETE|PATCH)\/([\w/@{}\-._]+)/gm,
      "`$1` `/$2`",
    );
  },
  removeNavigation(markdown) {
    return markdown.replace(/On this page\n\n(\[[^\]]+\]\([^)]+\))+\n\n/g, "");
  },
  cleanSpacing(markdown) {
    const codeBlocks = new Map();
    let counter = 0;

    let processedMarkdown = markdown.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `CODE_BLOCK_${counter}`;
      codeBlocks.set(placeholder, match);
      counter++;
      return placeholder;
    });

    processedMarkdown = processedMarkdown
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n\n(#+)/g, "\n\n\n$1");

    codeBlocks.forEach((value, key) => {
      processedMarkdown = processedMarkdown.replace(key, value);
    });

    return processedMarkdown;
  },
  cleanAll(markdown) {
    let cleaned = markdown;
    cleaned = MarkdownCleaner.removeNavigation(cleaned);
    cleaned = MarkdownCleaner.cleanTitles(cleaned);
    cleaned = MarkdownCleaner.cleanEndpoints(cleaned);
    cleaned = MarkdownCleaner.cleanSpacing(cleaned);
    return cleaned;
  },
};

const config = {
  paths: {
    output: path.join(process.cwd(), "output"),
    docs: path.join(process.cwd(), "docs"),
  },
  urlReplacements: [
    {
      match: /\[([^\]]+)\]\(#([^)]+)\)/g,
      replace: (_, text, anchor) => `[${text}](#${anchor.toLowerCase()})`,
    },
    {
      match: /\]\(\\/g,
      replace: "](/docs/",
    },
    {
      match: /\\\\/g,
      replace: "/",
    },
  ],
};

const configureTurndown = () => {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    hr: "---",
    bulletListMarker: "-",
    emDelimiter: "_",
  });
  turndown.addRule("codeBlocks", {
    filter: (node) => {
      return node.nodeName === "PRE" && node.querySelector("code");
    },
    replacement: (_content, node) => {
      const code = node.querySelector("code");
      const language = code?.className?.replace("language-", "") || "";
      const codeContent = code?.textContent || "";
      return `\n\`\`\`${language}\n${codeContent.trim()}\n\`\`\`\n`;
    },
  });
  turndown.addRule("tables", {
    filter: "table",
    replacement: (_content, node) => {
      const rows = Array.from(node.querySelectorAll("tr"));
      if (rows.length === 0) {
        return "";
      }

      const headers = Array.from(rows[0].querySelectorAll("th")).map((th) =>
        th.textContent.trim(),
      );

      const separator = headers.map(() => "---");

      const bodyRows = rows.slice(1).map((row) => {
        return Array.from(row.querySelectorAll("td")).map((td) =>
          td.textContent.trim(),
        );
      });

      return [
        "",
        headers.join(" | "),
        separator.join(" | "),
        ...bodyRows.map((row) => row.join(" | ")),
        "",
      ].join("\n");
    },
  });

  return turndown;
};

class DiscordDocsExtractor {
  #browser = null;
  #turndown = null;

  constructor(options = {}) {
    this.#turndown = configureTurndown();
    this.options = {
      headless: "new",
      ...options,
    };
  }

  async init() {
    this.#browser = await puppeteer.launch(this.options);
  }

  async close() {
    if (this.#browser) {
      await this.#browser.close();
      this.#browser = null;
    }
  }

  cleanMarkdown(markdown) {
    let cleaned = markdown;
    for (const { match, replace } of config.urlReplacements) {
      cleaned = cleaned.replace(match, replace);
    }

    cleaned = cleaned.replace(/```(\w+)\n\n/g, "```$1\n");
    cleaned = cleaned.replace(/\n\n```/g, "\n```");
    cleaned = MarkdownCleaner.cleanAll(cleaned);
    cleaned = UrlProcessor.cleanMarkdown(cleaned);

    return cleaned;
  }

  async #extractContent(page) {
    await page.waitForSelector("#algolia-crawler--page-content-container", {
      timeout: 5000,
    });

    const content = await page.evaluate(() => {
      const container =
        document.querySelector("#algolia-crawler--page-content-container") ||
        document.body;

      const clone = container.cloneNode(true);
      const selectors = [
        ".copy-3pDAd6", // Copy buttons
        ".noticeBar-1ozWeq", // Notice bars
        "script", // Script tags
        "style", // Style tags
      ];

      for (const selector of selectors) {
        for (const el of clone.querySelectorAll(selector)) {
          el.remove();
        }
      }

      return clone.innerHTML;
    });

    const markdown = this.#turndown.turndown(content);
    return this.cleanMarkdown(markdown);
  }

  async extractFromUrl(url, options = {}) {
    if (!this.#browser) {
      throw new Error("Browser not initialized. Call init() first.");
    }

    const page = await this.#browser.newPage();
    try {
      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: options.timeout || 30000,
      });

      return await this.#extractContent(page);
    } finally {
      await page.close();
    }
  }

  async saveToFile(markdown, filename) {
    await mkdir(config.paths.output, { recursive: true });
    const outputPath = path.join(config.paths.output, filename);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, markdown, "utf8");
    return outputPath;
  }
}

const DOCS_TO_EXTRACT = [
  "https://discord.com/developers/docs/reference",
  "https://discord.com/developers/docs/interactions/receiving-and-responding",
  "https://discord.com/developers/docs/interactions/application-commands",
  "https://discord.com/developers/docs/interactions/message-components",
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

function getFilenameFromUrl(url) {
  const lastSegment = url.replace(/\/$/, "").split("/").pop();
  return `${lastSegment}.md`;
}

async function extractDocs(urls) {
  const extractor = new DiscordDocsExtractor({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
  });

  try {
    await extractor.init();
    console.log("Starting extraction of multiple docs...\n");

    const tasks = urls.map((url) => ({
      url,
      filename: getFilenameFromUrl(url),
    }));

    const results = await Promise.allSettled(
      tasks.map(async ({ url, filename }) => {
        try {
          console.log(`📄 Extracting ${filename} from ${url}...`);
          const markdown = await extractor.extractFromUrl(url, {
            timeout: 60000,
          });
          await extractor.saveToFile(markdown, filename);
          console.log(`✅ Saved ${filename}`);
          return { success: true, url, filename };
        } catch (error) {
          console.error(`❌ Failed to extract ${filename}:`, error.message);
          return { success: false, url, filename, error: error.message };
        }
      }),
    );

    console.log("\n📊 Extraction Summary:");
    const successful = results.filter((r) => r.value?.success).length;
    const failed = results.filter((r) => !r.value?.success).length;
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    const failures = results
      .filter((r) => !r.value?.success)
      .map((r) => r.value);
    if (failures.length > 0) {
      console.log("\n❌ Failed extractions:");
      for (const failure of failures) {
        console.log(`- ${failure.filename} (${failure.url}): ${failure.error}`);
      }
    }
  } catch (error) {
    console.error("💥 Fatal error:", error);
  } finally {
    await extractor.close();
  }
}

extractDocs(DOCS_TO_EXTRACT).catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
