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
            console.log(
                `${chalk.red("Error:")} The directory ${chalk.white(projectName)} already exists. Please choose a different name or remove the existing directory.`,
            );

            return false;
        } else {
            await mkdir(projectName);
            spinner.succeed(chalk.green("Project directory created!"));
            console.log(
                `${chalk.green("1. Success:")} Project directory ${chalk.white(projectName)} created successfully.`,
            );

            return true;
        }
    } catch {
        spinner.fail(chalk.red("Failed to create project directory!"));
        console.error(
            `${chalk.red("Error:")} Failed to create project directory ${chalk.white(projectName)}. Please check your permissions and try again.`,
        );

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
        console.log(
            `${chalk.green("2. Success:")} Template files for ${chalk.white(isTypescript)} copied successfully to ${chalk.white(projectName)}.`,
        );

        await createPackageJson(projectName, typescript, projectPath, features);

        return true;
    } catch (error) {
        spinner.fail(chalk.red("Failed to copy template files!"));
        console.error(
            `${chalk.red("Error:")} Failed to copy template files to ${chalk.white(projectPath)}. Please verify the template path and permissions.`,
        );

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
        console.log(
            `${chalk.green("3. Success:")} The ${chalk.white("package.json")} file was created successfully in ${chalk.white(projectPath)}.`,
        );
    } catch (error) {
        console.error(chalk.red("Failed to create package.json"));
        console.error(
            `${chalk.red("Error:")} Failed to write ${chalk.white("package.json")} to ${chalk.white(projectPath)}. Please check your permissions and file paths.`,
        );
    }
}

async function initializeGit(projectPath: string): Promise<boolean> {
    const spinner = ora("Initializing Git repository...").start();
    try {
        await execPromise(`git init`, { cwd: projectPath });
        spinner.succeed(chalk.green("Git repository initialized!"));
        console.log(
            `${chalk.green("4. Success:")} Git repository initialized successfully in ${chalk.white(projectPath)}.`,
        );

        return true;
    } catch (error) {
        spinner.fail(chalk.red("Failed to initialize Git repository!"));
        console.error(
            `${chalk.red("Error:")} Failed to initialize Git repository in ${chalk.white(projectPath)}. Please verify your Git installation.`,
        );

        return false;
    }
}

async function addFeatures(features: Feature[], projectPath: string): Promise<void> {
    const spinner = ora("Adding selected features...").start();
    try {
        for (const feature of features) {
            switch (feature) {
                case "eslint":
                    // Create .eslintrc file and add dependencies
                    await execPromise(`npx eslint --init`, { cwd: projectPath });
                    console.log(
                        `${chalk.green("5. Success:")} ESLint configured successfully in ${chalk.white(projectPath)}.`,
                    );
                    break;
                case "prettier":
                    // Create .prettierrc file and add dependencies
                    await execPromise(`npm install prettier -D`, { cwd: projectPath });
                    console.log(
                        `${chalk.green("6. Success:")} Prettier installed and configured successfully in ${chalk.white(projectPath)}.`,
                    );
                    break;
                case "husky":
                    // Install husky and set up hooks
                    await execPromise(`npm install husky -D`, { cwd: projectPath });
                    await execPromise(`npx husky install`, { cwd: projectPath });
                    console.log(
                        `${chalk.green("7. Success:")} Husky installed and Git hooks set up successfully in ${chalk.white(projectPath)}.`,
                    );
                    break;
                // Add other features as needed
                default:
                    console.log(chalk.yellow(`Feature ${feature} is not yet implemented.`));
            }
        }
        spinner.succeed(chalk.green("Selected features added!"));
    } catch (error) {
        spinner.fail(chalk.red("Failed to add selected features!"));
        console.error(
            `${chalk.red("Error:")} Failed to add selected features to ${chalk.white(projectPath)}. Please check the logs for more details.`,
        );
    }
}

async function installDependencies(packageManager: PackageManager, projectPath: string): Promise<boolean> {
    const spinner = ora("Installing dependencies...").start();
    try {
        const installCommand = packageManager === "npm" ? "npm install" : `${packageManager} install`;
        await execPromise(installCommand, { cwd: projectPath });
        spinner.succeed(chalk.green("Dependencies installed!"));
        console.log(
            `${chalk.green("8. Success:")} Dependencies installed successfully in ${chalk.white(projectPath)} using ${chalk.white(packageManager)}.`,
        );

        return true;
    } catch (error) {
        spinner.fail(chalk.red("Failed to install dependencies!"));
        console.error(
            `${chalk.red("Error:")} Failed to install dependencies in ${chalk.white(projectPath)}. Please verify your internet connection and package manager configuration.`,
        );

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

function initFinished(answers: Answers): void {
    console.log(chalk.green("\nProject setup completed!"));
    console.log(`${chalk.green("1.")} Navigate to your project: ${chalk.white(`cd ${answers.projectName}`)}`);
    console.log(
        `${chalk.green("2.")} Run the development server: ${chalk.white(`${answers.packageManager} run start`)}`,
    );
    console.log(`${chalk.green("3.")} Enjoy coding and building something awesome! 🚀`);
    console.log(chalk.white("\n💡 Tip: Don't forget to check out the documentation for any extra setup steps."));
    console.log(
        chalk.white(`   Visit: ${chalk.underline("https://nyxjs.dev/docs")}
`),
    );
}

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
