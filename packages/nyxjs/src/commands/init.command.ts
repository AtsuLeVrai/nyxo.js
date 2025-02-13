import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Config } from "@swc/core";
import boxen from "boxen";
import chalk from "chalk";
import { execa } from "execa";
import gradient from "gradient-string";
import inquirer from "inquirer";
import ora from "ora";
import type { PackageJson, TsConfigJson } from "type-fest";

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";
type ProjectStructure = "Simple" | "Standard" | "Advanced";

interface InitOptions {
  name: string;
  packageManager: PackageManager;
  language: "Typescript" | "Javascript";
  projectStructure: ProjectStructure;
  github: boolean;
  installPackages: boolean;
}

const colors = {
  primary: chalk.rgb(129, 140, 248),
  secondary: chalk.rgb(167, 139, 250),
  success: chalk.rgb(52, 211, 153),
  error: chalk.rgb(248, 113, 113),
  warning: chalk.rgb(251, 191, 36),
  info: chalk.rgb(96, 165, 250),
  highlight: chalk.rgb(244, 114, 182),
};

const templates = {
  typescript: {
    index: "// WIP",
    ping: "// WIP",
    ready: "// WIP",
  },
  javascript: {
    index: "// WIP",
    ping: "// WIP",
    ready: "// WIP",
  },
  envExample: `# Bot Token
DISCORD_TOKEN=your-token-here
`,
  gitignore: `# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
.DS_Store
Thumbs.db`,
  readme: "WIP",
};

async function createProjectStructure(
  options: InitOptions,
  projectPath: string,
): Promise<boolean> {
  const spinner = ora({
    text: colors.info("Creating project structure..."),
    spinner: "dots",
  }).start();

  try {
    await mkdir(projectPath, { recursive: true });

    const dirs = [
      "src",
      "src/commands",
      "src/events",
      "src/custom",
      "src/utils",
      options.projectStructure === "Advanced" && "src/modules",
      options.projectStructure === "Advanced" && "src/services",
      options.language === "Typescript" && "src/types",
    ]
      .filter(Boolean)
      .map(String);

    for (const dir of dirs) {
      await mkdir(resolve(projectPath, dir), { recursive: true });
    }

    spinner.succeed(
      colors.success("✨ Project structure created successfully"),
    );
    return true;
  } catch (error) {
    spinner.fail(colors.error("Failed to create project structure"));
    throw error;
  }
}

async function generateConfigFiles(
  options: InitOptions,
  projectPath: string,
): Promise<boolean> {
  const spinner = ora({
    text: colors.info("Generating configuration files..."),
    spinner: "dots",
  }).start();

  try {
    const packageJson: PackageJson = {
      name: options.name,
      version: "1.0.0",
      type: "module",
      scripts: {
        ...(options.language === "Typescript"
          ? {
              dev: "tsx watch src/index.ts",
              build:
                "swc ./src -d dist --strip-leading-paths --config-file .swcrc",
              start: "node dist/index.js",
            }
          : {
              dev: "nodemon src/index.js",
              start: "node src/index.js",
            }),
      },
      dependencies: {
        "nyx.js": "latest",
        dotenv: "latest",
        ...(options.language === "Javascript"
          ? {
              nodemon: "latest",
            }
          : {}),
      },
      devDependencies: {
        ...(options.language === "Typescript"
          ? {
              "@types/node": "latest",
              typescript: "latest",
              "@swc/cli": "latest",
              "@swc/core": "latest",
              tsx: "latest",
            }
          : {}),
      },
    };

    const swcConfig: Config = {
      jsc: {
        target: "esnext",
        parser: {
          syntax: "typescript",
          tsx: false,
          decorators: true,
        },
        externalHelpers: true,
        keepClassNames: true,
        transform: {
          legacyDecorator: false,
          decoratorMetadata: true,
          useDefineForClassFields: true,
        },
      },
      module: {
        type: "es6",
        strict: true,
        lazy: true,
        importInterop: "swc",
      },
      sourceMaps: false,
      exclude: ["node_modules", "dist", ".*.js$", ".*\\.d.ts$"],
      minify: false,
    };

    const tsConfig: TsConfigJson = {
      compilerOptions: {
        target: "ESNext",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true,
        outDir: "dist",
        rootDir: "src",
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist", ".nyxjs"],
    };

    await writeFile(
      resolve(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2),
    );

    if (options.language === "Typescript") {
      await writeFile(
        resolve(projectPath, "tsconfig.json"),
        JSON.stringify(tsConfig, null, 2),
      );

      await writeFile(
        resolve(projectPath, ".swcrc"),
        JSON.stringify(swcConfig, null, 2),
      );
    }

    const templateSet =
      options.language === "Typescript"
        ? templates.typescript
        : templates.javascript;
    const extension = options.language === "Typescript" ? ".ts" : ".js";

    await writeFile(
      resolve(projectPath, `src/index${extension}`),
      templateSet.index,
    );
    await writeFile(
      resolve(projectPath, `src/commands/ping${extension}`),
      templateSet.ping,
    );
    await writeFile(
      resolve(projectPath, `src/events/ready${extension}`),
      templateSet.ready,
    );

    await writeFile(resolve(projectPath, ".env.example"), templates.envExample);
    if (options.github) {
      await writeFile(resolve(projectPath, ".gitignore"), templates.gitignore);
    }

    const readmeContent = templates.readme
      .replace("{{projectName}}", options.name)
      .replace("{{language}}", options.language)
      .replace(/\{\{packageManager\}\}/g, options.packageManager)
      .replace(
        "{{advancedDirs}}",
        options.projectStructure === "Advanced"
          ? "  ├── modules/     # Modular features\n  ├── services/    # Service layer\n"
          : "",
      );
    await writeFile(resolve(projectPath, "README.md"), readmeContent);

    spinner.succeed(
      colors.success("📝 Configuration files generated successfully"),
    );
    return true;
  } catch (error) {
    spinner.fail(colors.error("Failed to generate configuration files"));
    throw error;
  }
}

async function initGit(projectPath: string): Promise<boolean> {
  const spinner = ora({
    text: colors.info("Initializing git repository..."),
    spinner: "dots",
  }).start();

  try {
    await execa("git", ["init"], { cwd: projectPath });
    await execa("git", ["add", "."], { cwd: projectPath });
    await execa("git", ["commit", "-m", "✨ Initial commit"], {
      cwd: projectPath,
    });
    spinner.succeed(
      colors.success("🎉 Git repository initialized successfully"),
    );
    return true;
  } catch (error) {
    spinner.fail(colors.error("Failed to initialize git repository"));
    throw error;
  }
}

async function installDependencies(
  options: InitOptions,
  projectPath: string,
): Promise<boolean> {
  const spinner = ora({
    text: colors.info("Installing dependencies..."),
    spinner: "dots",
  }).start();

  try {
    let installCmd: string;
    switch (options.packageManager) {
      case "yarn":
        installCmd = "install";
        break;
      case "pnpm":
        installCmd = "install";
        break;
      case "bun":
        installCmd = "install";
        break;
      default:
        installCmd = "install";
    }

    await execa(options.packageManager, [installCmd], { cwd: projectPath });
    spinner.succeed(colors.success("📦 Dependencies installed successfully"));
    return true;
  } catch (error) {
    spinner.fail(colors.error("Failed to install dependencies"));
    throw error;
  }
}

function displayCompletionMessage(options: InitOptions): void {
  const text = gradient.mind.multiline(
    `🚀 Your project is ready!\n\n📁 Project: ${options.name.padEnd(27)}\n🛠  Language: ${options.language.padEnd(25)}\n📦 Package Manager: ${options.packageManager.padEnd(20)}\n\nTo get started:\ncd ${options.name}\n${options.packageManager} dev\n\nHappy coding! 🎉`,
  );
  console.log(
    boxen(text, {
      padding: 1,
      margin: 1,
      borderStyle: "round",
    }),
  );
}

export async function init(): Promise<void> {
  console.log(
    gradient.mind.multiline("\n🚀 Welcome to the nyx.js Project Generator!\n"),
  );

  const response = await inquirer.prompt<InitOptions>([
    {
      type: "input",
      name: "name",
      message: colors.primary("What is the name of your project?"),
      default: "my-discord-bot",
      validate: (input: string): boolean | string => {
        if (/^[a-z0-9-_]+$/i.test(input)) {
          return true;
        }
        return colors.error(
          "Project name can only contain letters, numbers, dashes and underscores",
        );
      },
    },
    {
      type: "list",
      name: "packageManager",
      message: colors.primary("Which package manager do you want to use?"),
      choices: [
        { name: colors.highlight("pnpm (Recommended)"), value: "pnpm" },
        { name: "npm", value: "npm" },
        { name: "yarn", value: "yarn" },
        { name: "bun", value: "bun" },
      ],
      default: "pnpm",
    },
    {
      type: "list",
      name: "language",
      message: colors.primary("Select the programming language:"),
      choices: [
        {
          name: colors.highlight("TypeScript (Recommended)"),
          value: "Typescript",
        },
        { name: "JavaScript", value: "Javascript" },
      ],
      default: "Typescript",
    },
    {
      type: "list",
      name: "projectStructure",
      message: colors.primary("Select the project structure:"),
      choices: [
        {
          name: colors.info("Simple (Recommended for small bots)"),
          value: "Simple",
        },
        {
          name: colors.info("Standard (Recommended for medium bots)"),
          value: "Standard",
        },
        {
          name: colors.info("Advanced (Recommended for large bots)"),
          value: "Advanced",
        },
      ],
      default: "Standard",
    },
    {
      type: "confirm",
      name: "github",
      message: colors.primary("Do you want to initialize a GitHub repository?"),
      default: true,
    },
    {
      type: "confirm",
      name: "installPackages",
      message: colors.primary("Do you want to install packages?"),
      default: true,
    },
  ]);

  const projectPath = resolve(process.cwd(), response.name);

  try {
    await createProjectStructure(response, projectPath);
    await generateConfigFiles(response, projectPath);

    if (response.github) {
      await initGit(projectPath);
    }

    if (response.installPackages) {
      await installDependencies(response, projectPath);
    }

    displayCompletionMessage(response);
  } catch {
    console.log(
      colors.error("\n❌ An error occurred while creating the project.\n"),
    );
    process.exit(1);
  }
}
