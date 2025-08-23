export async function safeImport<T>(
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
}
