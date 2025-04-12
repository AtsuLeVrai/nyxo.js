/**
 * Utility for handling optional dependencies in a Node.js application.
 *
 * This utility provides methods to dynamically import modules that may or may not
 * be installed, check if modules are available, and import multiple modules at once.
 * It helps implement feature detection and graceful fallbacks for optional dependencies.
 *
 * @example
 * ```typescript
 * // Try to import an optional dependency
 * const chalk = await OptionalDeps.import<typeof import('chalk')>('chalk');
 *
 * if (chalk) {
 *   console.log(chalk.green('Module loaded successfully!'));
 * } else {
 *   console.log('Chalk is not available, using fallback...');
 * }
 * ```
 */
export const OptionalDeps = {
  /**
   * Dynamically imports a module that may not be installed.
   *
   * This method attempts to import a module and returns it if successful.
   * It handles both CommonJS and ESM modules by checking for default exports.
   *
   * @template T - The type of the module to import
   * @param moduleName - The name of the module to import (e.g., 'chalk', 'lodash')
   * @returns A Promise that resolves to the imported module, or rejects if the module cannot be imported
   *
   * @example
   * ```typescript
   * try {
   *   const _ = await OptionalDeps.import<typeof import('lodash')>('lodash');
   *   const result = _.chunk([1, 2, 3, 4, 5], 2);
   * } catch (error) {
   *   console.error('Lodash not available:', error.message);
   * }
   * ```
   */
  async import<T>(moduleName: string): Promise<T> {
    const module = await import(moduleName);
    return (module.default ?? module) as T;
  },

  /**
   * Safely imports a module without throwing an exception, similar to Zod's safeParse.
   *
   * This function attempts to dynamically import a module and returns an object with:
   * - `success`: A boolean indicating whether the import was successful
   * - `data`: The imported module (if successful)
   * - `error`: The error that occurred (if unsuccessful)
   *
   * @template T - The expected type of the imported module
   * @param moduleName - The name of the module to import
   * @returns An object containing the result of the import attempt
   *
   * @example
   * ```typescript
   * // Try to import chalk
   * const result = await OptionalDeps.safeImport<typeof import('chalk')>('chalk');
   *
   * if (result.success) {
   *   // Use the imported module safely
   *   console.log(result.data.green('Success!'));
   * } else {
   *   // Handle the error gracefully
   *   console.log('Could not import chalk:', result.error.message);
   * }
   * ```
   */
  async safeImport<T>(
    moduleName: string,
  ): Promise<
    | { success: true; data: T; error?: undefined }
    | { success: false; data?: undefined; error: Error }
  > {
    try {
      const module = await import(moduleName);
      return {
        success: true,
        data: (module.default ?? module) as T,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Checks if a module is available without throwing an error.
   *
   * This method attempts to import a module and returns a boolean indicating
   * whether the import was successful, without throwing an error on failure.
   *
   * @param moduleName - The name of the module to check
   * @returns A Promise that resolves to true if the module is available, false otherwise
   *
   * @example
   * ```typescript
   * if (await OptionalDeps.isAvailable('sharp')) {
   *   // Use sharp for image processing
   * } else {
   *   // Use fallback image processing method
   * }
   * ```
   */
  async isAvailable(moduleName: string): Promise<boolean> {
    try {
      await import(moduleName);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Imports multiple modules at once and returns a partial object of successfully imported modules.
   *
   * This method attempts to import an array of modules and returns an object
   * where the keys are the module names and the values are the imported modules.
   * If a module fails to import, it will not be included in the result object.
   *
   * @template T - An object type where keys are module names and values are the corresponding module types
   * @param moduleNames - An array of module names to import
   * @returns A Promise that resolves to a partial object of the requested modules
   *
   * @example
   * ```typescript
   * // Define the type of modules we want to import
   * type OptionalModules = {
   *   'chalk': typeof import('chalk');
   *   'commander': typeof import('commander');
   *   'inquirer': typeof import('inquirer');
   * };
   *
   * // Import them all at once
   * const modules = await OptionalDeps.importMany<OptionalModules>([
   *   'chalk',
   *   'commander',
   *   'inquirer'
   * ]);
   *
   * // Use modules safely with optional chaining
   * console.log(modules.chalk?.green('Success!'));
   * ```
   */
  async importMany<T extends Record<string, unknown>>(
    moduleNames: string[],
  ): Promise<Partial<T>> {
    const results = await Promise.allSettled(
      moduleNames.map(async (name) => ({
        name,
        module: await this.import(name),
      })),
    );

    return results.reduce(
      (acc, result) => {
        if (result.status === "fulfilled" && result.value.module) {
          acc[result.value.name as keyof T] = result.value.module as T[keyof T];
        }
        return acc;
      },
      {} as Partial<T>,
    );
  },
} as const;
