/**
 * Utility for handling optional dependencies in Node.js applications.
 * Provides methods to dynamically import modules with graceful fallbacks.
 *
 * @example
 * ```typescript
 * const chalk = await OptionalDeps.import<typeof import('chalk')>('chalk');
 * if (chalk) {
 *   console.log(chalk.green('Module loaded successfully!'));
 * } else {
 *   console.log('Chalk not available, using fallback...');
 * }
 * ```
 *
 * @public
 */
export const OptionalDeps = {
  /**
   * Dynamically imports module that may not be installed.
   * Handles both CommonJS and ESM modules automatically.
   *
   * @typeParam T - Type of module to import
   * @param moduleName - Name of module to import
   * @returns Promise resolving to imported module
   *
   * @throws {Error} When module cannot be imported
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
   *
   * @public
   */
  async import<T>(moduleName: string): Promise<T> {
    const module = await import(moduleName);
    return (module.default ?? module) as T;
  },

  /**
   * Safely imports module without throwing exceptions.
   * Returns result object with success/error information.
   *
   * @typeParam T - Expected type of imported module
   * @param moduleName - Name of module to import
   * @returns Object containing import result
   *
   * @example
   * ```typescript
   * const result = await OptionalDeps.safeImport<typeof import('chalk')>('chalk');
   *
   * if (result.success) {
   *   console.log(result.data.green('Success!'));
   * } else {
   *   console.log('Could not import chalk:', result.error.message);
   * }
   * ```
   *
   * @public
   */
  async safeImport<T>(
    moduleName: string,
  ): Promise<{ success: true; data: T } | { success: false; error: Error }> {
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
   * Checks if module is available without throwing error.
   *
   * @param moduleName - Name of module to check
   * @returns Promise resolving to availability status
   *
   * @example
   * ```typescript
   * if (await OptionalDeps.isAvailable('sharp')) {
   *   // Use sharp for image processing
   * } else {
   *   // Use fallback image processing method
   * }
   * ```
   *
   * @public
   */
  async isAvailable(moduleName: string): Promise<boolean> {
    try {
      await import(moduleName);
      return true;
    } catch {
      return false;
    }
  },
} as const;
