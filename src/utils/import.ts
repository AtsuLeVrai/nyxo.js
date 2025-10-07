export interface ImportSuccess<T> {
  readonly success: true;

  readonly module: T;
}

export interface ImportFailure {
  readonly success: false;

  readonly error: Error;

  readonly moduleName: string;
}

export type ImportResult<T> = ImportSuccess<T> | ImportFailure;

export async function safeModuleImport<T = unknown>(moduleName: string): Promise<ImportResult<T>> {
  try {
    const importedModule = await import(moduleName);

    const resolvedModule =
      importedModule.default !== undefined ? importedModule.default : importedModule;

    return {
      success: true,
      module: resolvedModule as T,
    };
  } catch (error) {
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
