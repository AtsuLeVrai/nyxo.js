/**
 * Successful module import result with loaded module and type safety.
 *
 * @typeParam T - Expected type of the imported module
 */
export interface ImportSuccess<T> {
  /** Import operation succeeded */
  readonly success: true;
  /** The successfully imported and resolved module */
  readonly module: T;
}

/**
 * Failed module import result with detailed error information for debugging.
 * Contains normalized error details and module identification for troubleshooting.
 */
export interface ImportFailure {
  /** Import operation failed */
  readonly success: false;
  /** Normalized error instance with descriptive message */
  readonly error: Error;
  /** Name of the module that failed to import */
  readonly moduleName: string;
}

/**
 * Discriminated union type representing the outcome of a module import operation.
 * Enables type-safe handling of both successful and failed import attempts.
 *
 * @typeParam T - Expected type of the imported module on success
 *
 * @see {@link ImportSuccess} for successful import structure
 * @see {@link ImportFailure} for failed import structure
 * @see {@link safeModuleImport} for usage examples
 */
export type ImportResult<T> = ImportSuccess<T> | ImportFailure;

/**
 * Safely imports a module with comprehensive error handling and format normalization.
 * Handles both ESM (ES Modules) and CommonJS module formats automatically,
 * providing consistent module resolution regardless of the source format.
 *
 * ESM modules with default exports are automatically unwrapped, while CommonJS
 * modules are returned as-is. All errors are normalized to Error instances
 * with descriptive messages for better debugging experience.
 *
 * @typeParam T - Expected type of the imported module for type safety
 * @param moduleName - Name or path of the module to import (supports npm packages and relative paths)
 * @returns Promise resolving to ImportResult with either success or failure details
 *
 * @see {@link ImportResult} for return type structure
 * @see {@link https://nodejs.org/api/esm.html} for ESM module documentation
 * @see {@link https://nodejs.org/api/modules.html} for CommonJS module documentation
 */
export async function safeModuleImport<T = unknown>(moduleName: string): Promise<ImportResult<T>> {
  try {
    // Attempt dynamic import
    const importedModule = await import(moduleName);

    // Handle ESM default export vs CommonJS module export
    // ESM: { default: actualExport, ...namedExports }
    // CommonJS: actualExport directly
    const resolvedModule =
      importedModule.default !== undefined ? importedModule.default : importedModule;

    return {
      success: true,
      module: resolvedModule as T,
    };
  } catch (error) {
    // Ensure error is always an Error instance with descriptive message
    const normalizedError =
      error instanceof Error
        ? error
        : new Error(`Failed to import module "${moduleName}": ${String(error)}`);

    return {
      success: false,
      error: normalizedError,
      moduleName,
    };
  }
}
