import { exec } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import chalk from "chalk";
import { copy } from "fs-extra";
import inquirer from "inquirer";
import ora from "ora";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun" | "deno";
export type Feature = "eslint" | "prettier" | "vitest" | "husky" | "lint-staged" | "commitlint" | "biome";
type Answers = {
    packageManager: PackageManager;
    projectName: string;
    typescript: boolean;
    features: Feature[];
    initializeGit: boolean;
    installDependencies: boolean;
};

async function createProjectDirectory(projectName: string): Promise<boolean> {
    const spinner = ora("Creating project directory...").start();

    try {
        const stats = await stat(projectName);
        if (stats.isDirectory()) {
            spinner.fail(chalk.red("Project directory already exists!"));

            return false;
        }
        await mkdir(projectName);
        spinner.succeed(chalk.green("Project directory created!"));

        return true;
    } catch {
        spinner.fail(chalk.red("Failed to create project directory!"));

        return false;
    }
}

async function copyTemplate(
    typescript: boolean,
    projectName: string,
    projectPath: string,
    features: Feature[],
): Promise<boolean> {
    const isTypescript = typescript ? "ts" : "js";
    const templatePath = resolve(new URL(`../../templates/${isTypescript}`, import.meta.url).pathname);
    const spinner = ora("Copying template files...").start();

    try {
        await copy(templatePath, projectPath);
        spinner.succeed(chalk.green("Template files copied!"));

        await createPackageJson(projectName, typescript, projectPath, features);

        return true;
    } catch (_error) {
        spinner.fail(chalk.red("Failed to copy template files!"));

        return false;
    }
}

async function createPackageJson(
    projectName: string,
    typescript: boolean,
    projectPath: string,
    features: Feature[],
): Promise<void> {
    const packageJson = {
        name: projectName,
        version: "1.0.0",
        description: "A Nyx.js project",
        main: typescript ? "dist/index.js" : "index.js",
        type: "module",
        scripts: {
            start: "nyx start",
            build: "nyx build",
            test: "nyx test",
            lint: "eslint .",
            format: "prettier --write .",
        },
        keywords: [],
        author: "",
        license: "ISC",
        dependencies: {
            dotenv: "latest",
            winston: "latest",
            chalk: "latest",
            "nyx.js": "latest",
        },
        devDependencies: {
            "@types/node": "^latest",
            ...(typescript ? { typescript: "latest" } : {}),
            ...(features.includes("eslint") ? { eslint: "^latest" } : {}),
            ...(features.includes("prettier") ? { prettier: "^latest" } : {}),
            ...(features.includes("husky") ? { husky: "^latest" } : {}),
            ...(features.includes("vitest") ? { vitest: "^latest" } : {}),
            ...(features.includes("lint-staged") ? { "lint-staged": "^latest" } : {}),
            ...(features.includes("commitlint") ? { commitlint: "^latest" } : {}),
            ...(features.includes("biome") ? { biome: "^latest" } : {}),
        },
    };

    try {
        await writeFile(join(projectPath, "package.json"), JSON.stringify(packageJson, null, 2));
    } catch (_error) {}
}

async function initializeGit(projectPath: string): Promise<boolean> {
    const spinner = ora("Initializing Git repository...").start();
    try {
        await execPromise("git init", { cwd: projectPath });
        spinner.succeed(chalk.green("Git repository initialized!"));

        return true;
    } catch (_error) {
        spinner.fail(chalk.red("Failed to initialize Git repository!"));

        return false;
    }
}

async function addFeatures(features: Feature[], projectPath: string): Promise<void> {
    const spinner = ora("Adding selected features...").start();
    try {
        for (const feature of features) {
            switch (feature) {
                case "eslint": {
                    // Create .eslintrc file and add dependencies
                    await execPromise("npx eslint --init", { cwd: projectPath });
                    break;
                }
                case "prettier": {
                    // Create .prettierrc file and add dependencies
                    await execPromise("npm install prettier -D", { cwd: projectPath });
                    break;
                }
                case "husky": {
                    // Install husky and set up hooks
                    await execPromise("npm install husky -D", { cwd: projectPath });
                    await execPromise("npx husky install", { cwd: projectPath });
                    break;
                }
                // Add other features as needed
                default:
            }
        }
        spinner.succeed(chalk.green("Selected features added!"));
    } catch (_error) {
        spinner.fail(chalk.red("Failed to add selected features!"));
    }
}

async function installDependencies(packageManager: PackageManager, projectPath: string): Promise<boolean> {
    const spinner = ora("Installing dependencies...").start();
    try {
        const installCommand = packageManager === "npm" ? "npm install" : `${packageManager} install`;
        await execPromise(installCommand, { cwd: projectPath });
        spinner.succeed(chalk.green("Dependencies installed!"));

        return true;
    } catch (_error) {
        spinner.fail(chalk.red("Failed to install dependencies!"));

        return false;
    }
}

function execPromise(command: string, options: { cwd: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(command, options, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}

function initFinished(_answers: Answers): void {}

export async function init(): Promise<void> {
    const answers = await inquirer.prompt<Answers>([
        {
            type: "list",
            name: "packageManager",
            message: "Choose a package manager:",
            choices: ["npm", "yarn", "pnpm"],
        },
        {
            type: "input",
            name: "projectName",
            message: "Enter the project name:",
            default: "nyxjs-project",
        },
        {
            type: "confirm",
            name: "typescript",
            message: "Do you want to use TypeScript?",
            default: true,
        },
        {
            type: "checkbox",
            name: "features",
            message: "Select features to add:",
            choices: ["eslint", "prettier", "vitest", "husky", "biome"],
        },
        {
            type: "confirm",
            name: "initializeGit",
            message: "Initialize a Git repository?",
            default: true,
        },
        {
            type: "confirm",
            name: "installDependencies",
            message: "Install dependencies?",
            default: true,
        },
    ]);

    const projectPath = join(process.cwd(), answers.projectName);

    const isCreateProjectDirectory = await createProjectDirectory(answers.projectName);
    if (!isCreateProjectDirectory) {
        return;
    }

    const isCopyTemplate = await copyTemplate(answers.typescript, answers.projectName, projectPath, answers.features);
    if (!isCopyTemplate) {
        return;
    }

    if (answers.initializeGit) {
        const isInitializeGit = await initializeGit(projectPath);
        if (!isInitializeGit) {
            return;
        }
    }

    await addFeatures(answers.features, projectPath);

    if (answers.installDependencies) {
        const isInstallDependencies = await installDependencies(answers.packageManager, projectPath);
        if (!isInstallDependencies) {
            return;
        }
    }

    initFinished(answers);
}
