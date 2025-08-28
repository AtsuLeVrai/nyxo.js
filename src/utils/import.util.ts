/**
 * @description Result type for successful dynamic module import operations.
 */
export interface ImportSuccess<T> {
  readonly success: true;
  readonly module: T;
}

/**
 * @description Result type for failed dynamic module import operations.
 */
export interface ImportFailure {
  readonly success: false;
  readonly error: Error;
  readonly moduleName: string;
}

/**
 * @description Union type representing safe dynamic import operation results.
 */
export type ImportResult<T> = ImportSuccess<T> | ImportFailure;

/**
 * @description Safely imports modules with error handling and ESM/CommonJS compatibility.
 *
 * @param moduleName - Module identifier or path to import
 * @returns Promise resolving to success/failure result with type safety
 * @throws {TypeError} When moduleName is invalid string
 */
export async function safeModuleImport<T = unknown>(moduleName: string): Promise<ImportResult<T>> {
  try {
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
